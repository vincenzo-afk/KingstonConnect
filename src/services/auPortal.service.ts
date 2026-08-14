/**
 * Frontend client for the Anna University portal proxy
 * (/api/au-portal — see api/au-portal.ts on the server).
 */

export interface AUParsedSubject {
  code: string;
  name: string;
  credits: string;
  internal: string;
  external: string;
  total: string;
  grade: string;
  result: string;
  gpa: number;
}

export interface AUParsedSemester {
  name?: string;
  register?: string;
  semester: string;
  cgpa?: string;
  subjects: AUParsedSubject[];
  rawSnippet?: string;
}

export interface AUSessionInit {
  salt: string;
  pagetoken: string;
  tokenName: string;
  tokenValue: string;
  captchaBase64: string;
  captchaMime: string;
  phpsessid: string;
  hidden?: Record<string, string>;
}

/** In-memory AU portal session cookie, kept for the lifetime of the page. */
let auSessionId = "";

/** Current AU portal session id (for debugging). */
export function getAUSessionId(): string {
  return auSessionId;
}

export interface AUFetchError {
  error: string;
  message: string;
}

function isFetchError(payload: unknown): payload is AUFetchError {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    'message' in payload
  );
}

function assertOk(res: Response): void {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** Fetch the login page tokens + captcha image (server session cookie retained). */
export async function initAUSession(): Promise<AUSessionInit> {
  const res = await fetch('/api/au-portal?action=init');
  assertOk(res);
  const json = await res.json();
  if (isFetchError(json)) throw new Error(json.message);
  const init = json as AUSessionInit;
  if (init.phpsessid) auSessionId = init.phpsessid;
  return init;
}

/** Submit credentials + captcha and get parsed results. */
export async function fetchAUResults(params: {
  registerNo: string;
  dob: string;
  captchaCode: string;
  tokenName: string;
  tokenValue: string;
}): Promise<AUParsedSemester> {
  const res = await fetch('/api/au-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      register_no: params.registerNo,
      dob: params.dob,
      security_code_student: params.captchaCode,
      tokenName: params.tokenName,
      tokenValue: params.tokenValue,
      phpsessid: auSessionId,
    }),
  });
  if (!res.ok) {
    // Try to surface the server error message
    let msg = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (isFetchError(json)) msg = json.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const json = await res.json();
  if (isFetchError(json)) throw new Error(json.message);
  return json as AUParsedSemester;
}
