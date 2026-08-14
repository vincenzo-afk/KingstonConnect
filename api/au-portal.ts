/**
 * Anna University (CoE) portal proxy.
 *
 * Browser-side fetch of https://coe.annauniv.edu is blocked by CORS and
 * requires cookies/captcha that can only be solved by the student.
 * This Vercel serverless route runs server-to-server, bypasses CORS, and
 * relays the captcha image + parses the result HTML.
 *
 * GET  /api/au-portal?action=init
 *   Returns: { salt, pagetoken, tokenName, tokenValue, captchaBase64, captchaMime }
 *   (salt/pagetoken/tokens must be echoed back on the POST)
 *
 * POST /api/au-portal
 *   Body: { register_no, dob, security_code_student, tokenName, tokenValue, salt, pagetoken }
 *   Returns: { name, registers: [{regNo, semester, cgpa}], semesters: [...] }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Agent as UndiciAgent } from "undici";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const UNDICI_AGENT = new UndiciAgent({ connect: { rejectUnauthorized: false } });

const PORTAL_BASE = "https://coe.annauniv.edu/home";
const STUDENTS_CORNER = `${PORTAL_BASE}/students_corner.php`;
const CAPTCHA_URL = `${PORTAL_BASE}/includes/captcha_student.php`;
const LOGIN_PAGE = `${PORTAL_BASE}/`;

/** Fetch a URL through the proxy agent and return text (or buffer). */
async function fetchUrl(
  url: string,
  opts: { buffer?: boolean; method?: string; body?: string; headers?: Record<string, string> } = {},
) {
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    body: opts.body,
    headers: {
      "User-Agent": UA,
      Accept:
        opts.buffer ?? false
          ? "image/png,image/jpeg,*/*"
          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...(opts.headers ?? {}),
    },
    // @ts-expect-error undici dispatcher — works in Node 22+/Vercel runtime
    dispatcher: UNDICI_AGENT,
  } as RequestInit & { dispatcher?: UndiciAgent });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return opts.buffer ? Buffer.from(await res.arrayBuffer()) : res.text();
}

/** All hidden inputs on the page. */
function allHiddenInputs(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<input[^>]*type=["']hidden["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const n = (tag.match(/name=["']([^"']+)["']/i) ?? [])[1];
    const v = (tag.match(/value=["']([^"']*)["']/i) ?? [])[1];
    if (n) out[n] = v ?? "";
  }
  return out;
}

/** Convert a buffer to a base64 data-url-safe string with detected mime. */
function toBase64(buf: Buffer): { base64: string; mime: string } {
  const head = buf.slice(0, 8);
  const isPng =
    head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const mime = isPng ? "image/png" : "image/jpeg";
  return { base64: buf.toString("base64"), mime };
}

/**
 * GET init: load the login page, capture dynamic tokens, and download the
 * captcha image as base64.
 */
async function handleInit(): Promise<unknown> {
  const htmlRes = await fetch(LOGIN_PAGE, {
    headers: { "User-Agent": UA },
    // @ts-expect-error undici dispatcher
    dispatcher: UNDICI_AGENT,
  });
  if (!htmlRes.ok) throw new Error(`HTTP ${htmlRes.status} for ${LOGIN_PAGE}`);
  const html = await htmlRes.text();

  // Capture the AU portal session cookie so the captcha image and the later
  // credentials POST share the SAME PHP session (the captcha is validated
  // against the session that issued the image).
  let phpsessid = "";
  const setCookie = htmlRes.headers.get("set-cookie");
  if (setCookie) {
    const m = setCookie.match(/PHPSESSID=([A-Za-z0-9,]+)/);
    if (m) phpsessid = m[1];
  }

  const hidden = allHiddenInputs(html);

  // Captcha image — same session as the login page
  const imgBuf = await fetchUrl(CAPTCHA_URL, {
    buffer: true,
    headers: { ...(phpsessid ? { Cookie: `PHPSESSID=${phpsessid}` } : {}) },
  });
  const { base64, mime } = toBase64(imgBuf);

  // The student login form carries a dynamic self-valued hidden token
  // (name == value, e.g. "ZyH556OcMVTSVku17Vdq"). Find it by excluding
  // the known staff-form fields.
  const dynamicKeys = Object.keys(hidden).filter((k) => k !== "salt" && k !== "pagetoken");
  const tokenName = dynamicKeys[0] ?? "";
  return {
    salt: hidden.salt ?? "",
    pagetoken: hidden.pagetoken ?? "",
    tokenName,
    tokenValue: hidden[tokenName] ?? "",
    captchaBase64: base64,
    captchaMime: mime,
    phpsessid,
    hidden,
  };
}

/** AU grade → grade point. */
function gradePoint(grade: string): number {
  const g = grade.toUpperCase().trim();
  switch (g) {
    case "O":
      return 10;
    case "A+":
      return 9;
    case "A":
      return 8;
    case "B+":
      return 7;
    case "B":
      return 6;
    case "C":
      return 5;
    case "P":
      return 4;
    default:
      return 0;
  }
}

/** Parse the result-page tables into structured semester/subject data. */
function parseResults(html: string): {
  name?: string;
  register?: string;
  semester: string;
  cgpa?: string;
  subjects: { code: string; name: string; credits: string; internal: string; external: string; total: string; grade: string; result: string; gpa: number }[];
} {
  // Student meta: name and register often appear near labels
  const nameMatch = html.match(/Name\s*[:-]\s*<[^>]+>\s*([^<]+)/i) || html.match(/name[^>]{0,80}>([^<]{3,60})/i);
  const name = nameMatch ? nameMatch[1].trim() : undefined;
  const regMatch = html.match(/Register\s*(?:Number|No\.?)\s*[:-]\s*<[^>]+>\s*([^<]+)/i) || html.match(/register[^>]{0,80}>\s*([\dA-Z]{7,15})/i);
  const register = regMatch ? regMatch[1].trim() : undefined;

  const results: {
    name?: string;
    register?: string;
    semester: string;
    cgpa?: string;
    subjects: { code: string; name: string; credits: string; internal: string; external: string; total: string; grade: string; result: string; gpa: number }[];
  }[] = [];

  // The result page typically has one table per semester. Each <table> block
  // is preceded by a semester heading (h3/h4/b or text like "III Semester").
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  const raw = html.replace(/\s+/g, " ");

  // Semesters headings: look for "I Semester" … "X Semester" patterns
  const semRe = /([IVX]+)\s*(?:SEMESTER|Semester)/g;
  const headingPositions: { sem: string; pos: number }[] = [];
  let hm: RegExpExecArray | null;
  while ((hm = semRe.exec(raw)) !== null) {
    headingPositions.push({ sem: hm[1], pos: hm.index });
  }

  let tm: RegExpExecArray | null;
  const tableBlocks: { start: number; text: string }[] = [];
  while ((tm = tableRe.exec(raw)) !== null) {
    tableBlocks.push({ start: tm.index, text: tm[0] });
  }

  for (const block of tableBlocks) {
    const text = block.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!/\d{6}/.test(text)) continue; // skip non-result tables

    // find nearest preceding semester heading
    let sem = "";
    let best = -1;
    for (const h of headingPositions) {
      if (h.pos < block.start && h.pos > best) {
        best = h.pos;
        sem = h.sem;
      }
    }
    if (!sem) sem = String(results.length + 1);

    // Extract CGPA: "CGPA : X.XX" or "CGPA :X.XX" patterns within the block
    const cgpaM = block.text.match(/CGPA\s*[:-]\s*([\d.]+)/i) || block.text.match(/CGPA[^0-9]{0,30}([\d.]{2,5})/);
    const cgpa = cgpaM ? cgpaM[1] : undefined;

    // Rows: try to find sequences starting with a 6-digit subject code
    const subjects: { code: string; name: string; credits: string; internal: string; external: string; total: string; grade: string; result: string; gpa: number }[] = [];
    const codeRe = /\b(\d{6})\b/g;
    let cm: RegExpExecArray | null;
    const fullText = block.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    while ((cm = codeRe.exec(fullText)) !== null) {
      const code = cm[1];
      const tail = fullText.slice(cm.index + 6);
      // Subject name runs until credits number; grades are 1-2 letters at the end.
      // Pattern: <digits> <name words> <credits> <internal> <external> <total> <grade> <result>
      const rowRe = /^([A-Za-z][A-Za-z0-9 &./-]{2,70}?)\s+(\d{1,2})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+([OABCP]+[+-]?)\s+(Pass|Fail|Arrear|Absent|Detained|RA|NA)?/i;
      const rm = tail.match(rowRe);
      if (!rm) continue;
      const grade = rm[6] ?? "";
      subjects.push({
        code,
        name: rm[1].trim(),
        credits: rm[2],
        internal: rm[3],
        external: rm[4],
        total: rm[5],
        grade,
        result: rm[7] ?? (grade ? "Pass" : ""),
        gpa: gradePoint(grade),
      });
    }

    if (subjects.length > 0) {
      results.push({
        name: results[0]?.name ?? name,
        register: results[0]?.register ?? register,
        semester: sem,
        cgpa,
        subjects,
      });
    }
  }

  if (results.length === 0) {
    // Fallback: raw dump so the frontend can still surface what the portal said
    const snippet = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      name: name ?? undefined,
      register: register ?? undefined,
      semester: "Unknown",
      subjects: [],
      rawSnippet: snippet.slice(0, 2000),
    } as never;
  }

  // attach meta to first semester
  results[0].name = results[0].name ?? name;
  results[0].register = results[0].register ?? register;
  return results[0] as never;
}

/**
 * POST: submit credentials + captcha to the AU portal and parse results.
 */
async function handleSubmit(body: {
  register_no?: string;
  dob?: string;
  security_code_student?: string;
  tokenName?: string;
  tokenValue?: string;
  phpsessid?: string;
}): Promise<unknown> {
  const {
    register_no,
    dob,
    security_code_student,
    tokenName,
    tokenValue,
    phpsessid,
  } = body;

  if (!register_no || !dob || !security_code_student) {
    throw new Error("Missing register_no, dob, or security_code_student");
  }

  // The student form submits only register_no / dob / security_code_student
  // plus its own dynamic self-valued hidden token and the "gos" submit button.
  // (salt/pagetoken belong to the separate institution/staff form.)
  const params = new URLSearchParams({
    register_no,
    dob,
    security_code_student,
    gos: "Login",
  });
  if (tokenName) params.set(tokenName, tokenValue ?? "");

  const resultHtml = await fetchUrl(STUDENTS_CORNER, {
    method: "POST",
    body: params.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://coe.annauniv.edu",
      Referer: LOGIN_PAGE,
      ...(phpsessid ? { Cookie: `PHPSESSID=${phpsessid}` } : {}),
    },
  });

  // Detect common portal errors
  if (/INVALID|NOT FOUND|captcha|no result|not exist/i.test(resultHtml) && !/<table/i.test(resultHtml)) {
    const clean = resultHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const snippet = clean.slice(0, 400);
    // Order matters: credential error pages also contain the word "invalid".
    if (/register number|date of birth|profile not found/i.test(snippet)) {
      return {
        error: "NO_RESULT",
        message:
          "No results found for this register number / DOB. Please double-check both values (DD-MM-YYYY format) and try again.",
      };
    }
    if (/invalid|captcha/i.test(snippet)) {
      return {
        error: "INVALID_CAPTCHA",
        message:
          "The captcha code was incorrect, or the register number / DOB does not match. Please re-enter the captcha carefully (and verify your DOB format: DD-MM-YYYY) and try again.",
      };
    }
    if (/no result|not exist|not found/i.test(snippet)) {
      return { error: "NO_RESULT", message: "No results found for this register number / DOB." };
    }
    return { error: "PORTAL_ERROR", message: snippet || "The portal returned an unexpected page." };
  }

  return parseResults(resultHtml);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      if (req.query.action === "init") {
        const data = await handleInit();
        return res.status(200).json(data);
      }
      if (req.query.action === "echo-session") {
        // Debug helper: confirm the session cookie round-trips correctly.
        const phpsessid = String(req.query.phpsessid ?? "");
        const probe = await fetch(CAPTCHA_URL, {
          headers: {
            "User-Agent": UA,
            ...(phpsessid ? { Cookie: `PHPSESSID=${phpsessid}` } : {}),
          },
          // @ts-expect-error undici dispatcher
          dispatcher: UNDICI_AGENT,
        });
        return res.status(200).json({ ok: true, probeStatus: probe.status });
      }
      return res.status(400).json({ error: "MISSING_ACTION", message: "Use ?action=init" });
    }
    if (req.method === "POST") {
      const data = await handleSubmit((req.body ?? {}) as Parameters<typeof handleSubmit>[0]);
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (/HTTP 5\d\d|fetch failed|ECONN|timeout|certificate/i.test(msg)) {
      return res.status(502).json({
        error: "PORTAL_UNAVAILABLE",
        message: "The Anna University portal is currently unreachable from the server. Please try again later.",
      });
    }
    return res.status(500).json({ error: "SERVER_ERROR", message: msg });
  }
}
