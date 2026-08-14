import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useAUResultsStore } from '@/stores/auResultsStore';
import { buildStudentContext, getStudentQuickFacts } from '@/services/studyContext';
import { getRelevantTeacherContent } from '@/data/teacherContent';
import {
    applyFormats,
    buildModeInstructions,
    detectFormats,
} from '@/services/formatEngine';
import {
    getDeadlinesSorted,
    ATTENDANCE_STATS,
} from '@/data/studentData';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'ai';
    content: string;
}

export interface StudyGPTResponse {
    content: string;
    sources?: string[];
}

// Get the API URL from environment or localStorage
const getApiUrl = (): string | null => {
    // First check localStorage (user override)
    const localUrl = localStorage.getItem('studygpt_colab_url');
    if (localUrl && localUrl.trim()) {
        return localUrl.trim();
    }
    // Then check environment variable
    const envUrl = import.meta.env.VITE_STUDYGPT_API_URL;
    if (envUrl && envUrl.trim()) {
        return envUrl.trim();
    }
    return null;
};

export const setColabUrl = (url: string) => {
    localStorage.setItem('studygpt_colab_url', url);
};

export const getColabUrl = (): string | null => {
    return getApiUrl();
};

// Simple RAG: Fetch relevant notes based on keywords
const retrieveContext = async (userQuery: string): Promise<string> => {
    try {
        const notesRef = collection(db, COLLECTIONS.NOTES);
        const q = query(notesRef, where('status', '==', 'approved'), orderBy('uploadedAt', 'desc'), limit(20));
        // Guard: never let the notes lookup hang the chat (Firestore can stall offline)
        const snapshot = await Promise.race([
            getDocs(q),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('notes_timeout')), 8000))
        ]);

        const keywords = userQuery.toLowerCase().split(' ').filter(w => w.length > 3);
        const relevantNotes: string[] = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const text = `${data.title} ${data.description} ${data.subject}`.toLowerCase();

            const matches = keywords.filter(k => text.includes(k));
            if (matches.length > 0) {
                relevantNotes.push(`
Title: ${data.title}
Subject: ${data.subject}
Description: ${data.description}
                `.trim());
            }
        });

        if (relevantNotes.length === 0) return "";

        return `
Here are some relevant study notes from the student's database:

${relevantNotes.join('\n\n')}

Use the above information to answer if relevant.
        `.trim();

    } catch (error) {
        console.error("Error retrieving context:", error);
        return "";
    }
};

// =============================================================================
// INTENT DETECTION — route a query to the best local knowledge block
// =============================================================================

type Intent = 'dsa' | 'algo' | 'dbms' | 'os' | 'cn' | 'se' | 'math'
    | 'physics' | 'chemistry' | 'english' | 'microprocessor' | 'electronics'
    | 'signals' | 'aiml' | 'exam' | 'grades' | 'studyplan' | 'attendance'
    | 'arrear' | 'portal' | 'housing' | 'notes' | 'deadlines'
    | 'focus' | 'teacher' | 'generic';

const detectIntent = (q: string): Intent => {
    const l = q.toLowerCase();
    const tests: [RegExp, Intent][] = [
        [/data structure|linked list|stack|queue|tree|graph|sorting|hash table|dsa\b/i, 'dsa'],
        [/algorithm|dynamic programming|greedy|divide and conquer|recursion|backtracking|big ?o\b|time complexity|space complexity/i, 'algo'],
        [/database|dbms|sql|normalization|er diagram|relational|transaction|acid|indexing|index\b/i, 'dbms'],
        [/operating system|os\b|process|thread|scheduling|paging|segmentation|deadlock|semaphore|mutex|memory management|virtual memory|file system/i, 'os'],
        [/network|tcp|udp|ip\b|osi|routing|subnet|dns|http\b|protocol|topology|ethernet|cryptography|cipher/i, 'cn'],
        [/software engineer|uml|agile|scrum|sdlc|waterfall|requirement|testing|design pattern|oop|object oriented|inheritance|polymorphism|encapsulation/i, 'se'],
        [/math|calculus|linear algebra|probability|statistics|transform|differential equation|discrete mathematics|laplace|fourier|z ?transform|matrix|eigenvalue/i, 'math'],
        [/physics|quantum|optics|thermodynamic|semiconductor|laser|nuclear|crystal|electromagnet|wave|photoelectric/i, 'physics'],
        [/chemistr|organic|inorganic|polymer|corrosion|nano|spectroscopy|electrochemistry|water technology/i, 'chemistry'],
        [/english|grammar|essay|technical communication|presentation|writing skill|professional communication/i, 'english'],
        [/microprocessor|microcontroller|8086|8085|arm\b|assembly|interrupt|instruction set|bus architecture|embedded/i, 'microprocessor'],
        [/circuit|electronics|diode|transistor|op-?amp|amplifier|digital logic|logic gate|flip flop|vlsi|analog|eda\b/i, 'electronics'],
        [/signal|dsp|control system|feedback|pid|frequency response|bode/i, 'signals'],
        [/artificial intelligence|machine learning|deep learning|neural|nlp|computer vision|data science|data mining|cloud|iot|internet of things|big data|python|robot/i, 'aiml'],
        [/exam pattern|question pattern|2 ?mark|16 ?mark|internal mark|external mark|part a|part b|semester exam|anna university exam/i, 'exam'],
        [/cgpa|gpa|grade point|how to calculate|grade|arrear|fail|revaluation|supplementary/i, 'grades'],
        [/study plan|timetable|how to study|preparation|revision plan|30 days|schedule|weak subject|improve my/i, 'studyplan'],
        [/attendance|75|eligible for exam|attendance shortage|leave/i, 'attendance'],
        [/how to clear|failed|supplementary exam/i, 'arrear'],
        [/anna university|portal|coe\.annauniv|results portal|results corner/i, 'portal'],
        [/housing|hostel|room|pg|rent|accommodation|flat/i, 'housing'],
        [/teacher|uploaded|announcement|announcements|assignment.*posted|professor|dr\. |prof\.|what did|what has been posted|newly uploaded/i, 'teacher'],
        [/notes|upload|study material|syllabus/i, 'notes'],
        [/deadline|due|when is.*due|submission/i, 'deadlines'],
        [/what should i focus|focus today|where to start|priorit/i, 'focus'],
    ];
    for (const [re, intent] of tests) {
        if (re.test(l)) return intent;
    }
    return 'generic';
};

// =============================================================================
// LOCAL KNOWLEDGE BLOCKS — rich, AU-flavoured tutor responses
// =============================================================================

const respondDSA = (): string => `## Data Structures & Algorithms (CS8391 / MA8351)

Data Structures is one of the most heavily tested subjects in Anna University exams — expect a 16-mark question on **trees or graphs** almost every semester.

**Core topics and what to focus on:**

| Topic | Exam Weight | Must-Know |
|---|---|---|
| Stacks & Queues | 2-mark staple | Infix→Postfix conversion, applications (recursion, BFS) |
| Linked Lists | 16-mark favourite | Singly/doubly/circular lists, polynomial addition |
| Trees & BST | 16-mark favourite | Traversals (in/pre/post-order), AVL rotations |
| Graphs | 16-mark favourite | BFS/DFS, Dijkstra's, Prim's & Kruskal's |
| Hashing | 2-mark staple | Collision resolution: chaining vs open addressing |

**Typical 16-mark question style:**
> "Construct an AVL tree by inserting the keys 10, 20, 30, 40, 50, 25 in order and show each rotation." (8 marks) + "Write pseudocode for in-order traversal." (8 marks)

**Top tips:**
1. Memorize the *time complexities* — they appear as Part A questions (2 marks each).
2. Practice drawing trees/graphs by hand — step-by-step marks are given per operation.
3. Learn **pseudocode**, not just code — examiners reward clear algorithmic steps.

Would you like me to work through a specific problem, derive a complexity, or give you a 16-mark question set to practice?`;

const respondAlgo = (): string => `## Algorithm Design & Analysis (CS8451)

Algorithms questions are proof-heavy: examiners love asking you to *trace* an algorithm and then *analyze* its complexity.

**Key paradigms to master:**

1. **Divide & Conquer** — Merge Sort, Quick Sort, Strassen's matrix multiplication. *Merge Sort always beats Quick Sort in the worst case (O(n log n)).*
2. **Dynamic Programming** — 0/1 Knapsack, Matrix Chain Multiplication, LCS, Floyd-Warshall. Always show the **DP table** step-by-step; that's where marks come from.
3. **Greedy** — Activity Selection, Huffman Coding, Fractional Knapsack. Know when greedy *fails* (e.g., 0/1 Knapsack).
4. **Backtracking & Branch & Bound** — N-Queens, Graph Coloring, TSP. Draw the state-space tree.
5. **Complexity analysis** — Big-O, Omega, Theta; Master Theorem for recurrences like T(n) = 2T(n/2) + n.

**Classic 16-markers:**
- Solve 0/1 Knapsack for a given item list using DP (table + optimal subset).
- Design a Backtracking algorithm for the N-Queens problem with state-space tree.
- Apply Dijkstra's algorithm and trace shortest paths.

Tell me the specific algorithm or problem set and I'll walk you through it step by step.`;

const respondDBMS = (): string => `## Database Management Systems (CS8492 / CS3491)

DBMS is a high-scoring subject — questions are direct and formulaic.

**The 5 pillars examiners test:**

1. **ER Modeling (16 marks, near-guaranteed)** — entities, relationships, cardinality, weak entities. Always draw a clean ER diagram and convert it to relational schema.
2. **Normalization (16 marks, near-guaranteed)** — 1NF → 2NF → 3NF → BCNF. Common trap: *2NF removes partial dependency, 3NF removes transitive dependency.*
3. **SQL (16 marks)** — joins, subqueries, GROUP BY/HAVING. Practice the classic "find employees earning more than their department average."
4. **Transactions & Concurrency (Part A + Part B)** — ACID properties, serializability, 2PL, deadlock prevention.
5. **Indexing** — B+ trees (why B+ over B-tree: range queries), hash indexes, clustered vs non-clustered.

**2-mark favourites:**
- "Define a candidate key." — *A minimal superkey that uniquely identifies tuples.*
- "What is a view?" — *A virtual table derived from a SELECT query, not physically stored.*

Want me to solve a specific normalization problem or write SQL queries for your exercise?`;

const respondOS = (): string => `## Operating Systems (CS8491 / CS3451)

OS has the most *numerical* Part B questions of any core subject — CPU scheduling problems almost always appear.

**Must-practice numericals (16 marks):**

1. **CPU Scheduling** — FCFS, SJF (preemptive/non-preemptive), Round Robin, Priority. Build the Gantt chart and compute *average waiting time* and *average turnaround time* — that's the full solution.
2. **Banker's Algorithm** — safety sequence + safe state check. Given Allocation/Max/Available matrices, find if the system is safe.
3. **Page Replacement** — FIFO, LRU, Optimal. Count page faults for a given reference string.
4. **Disk Scheduling** — FCFS, SSTF, SCAN, C-SCAN. Compute total head movement.
5. **Semaphores & Synchronization** — Producer-Consumer, Readers-Writers, Dining Philosophers.

**2-mark staples:**
- Thrashing: *excessive paging causing CPU utilization to collapse.*
- Mutex vs Semaphore: *mutex = ownership + count 1; semaphore = general count, no ownership.*
- Fragmentation: *internal (fixed partitions) vs external (variable partitions).*

Give me a specific scheduling or page-replacement problem and I'll solve it with a full Gantt chart / trace.`;

const respondCN = (): string => `## Computer Networks (CS8591 / EC8551)

Networking is diagram-heavy. Examiners reward well-labelled diagrams (OSI stack, TCP handshake, subnet layouts).

**Core units to focus on:**

1. **OSI & TCP/IP models (16 marks)** — all 7 layers with functions and protocols. Common follow-up: *difference between OSI and TCP/IP.*
2. **Data Link Layer** — Framing, error detection (CRC, checksum), sliding window protocols (Go-Back-N vs Selective Repeat — always compare in a table).
3. **Network Layer** — IPv4 addressing, subnetting (numerical!), routing (Dijkstra's/Link-state, Distance Vector, RIP, OSPF), NAT.
4. **Transport Layer** — TCP 3-way handshake, congestion control (slow start, AIMD), flow control, UDP vs TCP comparison.
5. **Application Layer** — DNS hierarchy, HTTP, SMTP, DHCP.

**Subnetting numerical (very common 16-marker):**
> "Given network 192.168.10.0/24, create 6 subnets. Find mask, number of hosts, and first/last IP of each subnet."

**2-mark favourites:** bandwidth vs latency, CSMA/CD vs CSMA/CA, unicast/multicast/broadcast.

Want me to work through a subnetting problem or explain a protocol in depth?`;

const respondSE = (): string => `## Software Engineering (CS8493 / CS3491)

SE is theory-heavy but very scoring — answers are structured lists, and examiners mark per point.

**High-frequency questions:**

1. **SDLC models (16 marks)** — Waterfall, Iterative, Spiral (risk-driven), Agile/Scrum. *Always end with "when to use which."*
2. **Requirements** — functional vs non-functional, SRS document structure (IEEE 830), requirement elicitation techniques.
3. **Design (16 marks, near-guaranteed)** — UML diagrams: Use Case, Class, Sequence, Activity, State. Prepare one example system (e.g., Library Management) drawn in all 5 diagrams.
4. **Testing** — black-box (equivalence partitioning, BVA) vs white-box (statement/branch coverage), integration strategies, V-model.
5. **Project Management** — COCOMO, risk management, Gantt chart, CPM/PERT basics.

**2-mark favourites:**
- Cohesion vs Coupling: *high cohesion + low coupling = good design.*
- "What is a use case?" — *A description of a sequence of actions a system performs yielding observable value to an actor.*

Tell me which unit you want — I can draft full 16-mark answers with UML examples.`;

const respondMath = (): string => `## Engineering Mathematics (MA8351 / MA8402)

Math questions are fully numerical — practice the *method*, and marks follow automatically.

**Probability (R2021, heavily weighted):**
- Random variables, PMF/PDF, expectation, variance
- Standard distributions: Binomial, Poisson, Geometric, Uniform, Exponential, Normal
- Hypothesis testing, correlation & regression (numericals guaranteed)

**Transforms (MA8351):**
- **Laplace Transform** — L{1}, L{t^n}, L{sin at}, first shifting theorem, solving ODEs via LT
- **Inverse Laplace** — partial fractions + convolution theorem
- **Fourier Series** — even/odd functions, half-range sine/cosine series
- **Z-Transform** — standard pairs, initial/final value theorems

**Linear Algebra:**
- Eigenvalues & eigenvectors, Cayley-Hamilton theorem, diagonalization, quadratic forms

**ODEs (second order):**
- Complementary function + particular integral method for L(D)y = F(x)

**Exam tip:** In Part B, write the *formula first*, substitute, and show every intermediate step — step marks are generous in AU math papers.

Give me a specific problem (e.g., "solve by Laplace transform" or "find eigenvalues") and I'll solve it completely.`;

const respondPhysics = (): string => `## Engineering Physics (PH3151)

Physics at Anna University focuses on modern/applied topics. Part B is almost always: properties + principle + applications + numerical.

**Key units:**
1. **Crystal Physics** — lattice types, Miller indices (numerical: find interplanar spacing d), packing factor calculations
2. **Properties of Matter & Thermal Physics** — elasticity, Hooke's law, thermal conductivity, heat transfer modes
3. **Quantum Physics** — Schrödinger equation, particle in a box (energy levels), wave-particle duality, Compton effect
4. **Lasers & Fibre Optics** — population inversion, types of lasers (He-Ne, CO2, semiconductor), numerical aperture and acceptance angle of optical fibre
5. **Modern Engineering Materials** — metallic glasses, shape memory alloys, nanomaterials

**Fibre optics numerical (classic 16-marker):**
> "Find the numerical aperture and acceptance angle given n1 = 1.48, n2 = 1.46."
> Solution: NA = √(n1² − n2²) ≈ 0.242; θa = sin⁻¹(NA) ≈ 14°

Tell me the unit or the numerical you're stuck on.`;

const respondChemistry = (): string => `## Engineering Chemistry (CY3151)

Chemistry is memory + application. Focus on water technology, polymers, and energy — they dominate Part B.

**Key units:**
1. **Water Technology** — hardness (EDTA method numerical), boiler troubles, desalination (RO, electrodialysis)
2. **Polymer Chemistry** — addition vs condensation polymerization, FRP, Teflon/Nylon-66 preparation and uses
3. **Energy & Fuels** — calorific value (bomb calorimeter numerical), knocking, octane/cetane numbers, batteries (Li-ion), fuel cells
4. **Nanomaterials** — properties, synthesis (sol-gel, CVD), applications
5. **Corrosion** — electrochemical corrosion, galvanic series, cathodic protection (sacrificial anode vs impressed current)

**Calorific value numerical (frequent 16-marker):**
> Bomb calorimeter: GCV = (W + w)(t2 − t1) × 4.184 / m — learn to substitute coal mass and water equivalent.

What topic or numerical would you like me to cover?`;

const respondEnglish = (): string => `## Professional English (HS3151 / HS3251)

English is the easiest marks on your transcript — invest a little, gain a lot.

**What Part B asks:**
- Paragraph/essay writing (100-150 words): problem-solution, cause-effect, descriptive
- Précis writing: reduce a passage to one-third, keep the core idea
- Report writing: format — title, introduction, findings, conclusion, recommendations
- Formal letter/email: complaints, requests, leave letters
- Grammar: subject-verb agreement, tenses, active/passive, direct/indirect speech, one-word substitutions

**Quick wins:**
1. Use the **PREP** structure for essays: Point → Reason → Example → Point (restated).
2. In précis, write the title and check word count — examiners deduct for both errors.
3. Emails: always include subject line, salutation, purpose, request, sign-off.

Send me a writing topic and I'll draft a model answer you can learn from.`;

const respondMicroprocessor = (): string => `## Microprocessors & Microcontrollers (EC8551 / CS8491)

Expect assembly-language programs and architecture diagrams in Part B.

**8086 focus (most common):**
1. **Architecture** — BIU/execution unit, 14 registers, segmentation (CS:IP, SS:SP), pin diagram of 8086
2. **Addressing modes** — immediate, register, direct, register indirect, indexed, based indexed (always list with examples)
3. **Instruction set** — data transfer (MOV, XCHG), arithmetic (ADD, SUB, MUL, DIV), logical (AND, OR, NOT), branch (JMP, JZ, LOOP)
4. **Assembly programs (16 marks)** — addition of N numbers, largest/smallest in an array, string operations, multiplication via repeated addition
5. **Interrupts & DMA** — types, 8259 PIC, 8237 DMA controller

**Sample assembly (add two 16-bit numbers):**
\`\`\`
MOV AX, 1234H
MOV BX, 5678H
ADD AX, BX      ; AX = 68ACh
HLT
\`\`\`

Want me to write a specific assembly program or explain the architecture in depth?`;

const respondElectronics = (): string => `## Electronic Devices & Circuits (EC3151)

Core numerical + circuit subjects: diodes, transistors, op-amps, and logic design.

**Key topics:**
1. **Diodes** — PN junction biasing, Zener as regulator (load regulation numerical), clipper/clamper circuits
2. **BJT** — CE/CB/CC configurations, operating point, load line analysis, voltage divider bias (stability factor S — numerical!)
3. **Op-amps** — inverting/non-inverting amplifier gain, adder, integrator, comparator, Schmitt trigger
4. **Digital Logic** — gates, Karnaugh maps (simplification numerical — nearly guaranteed), flip-flops (SR, JK, D, T), counters (ripple/synchronous)
5. **A/D & D/A** — R-2R ladder, successive approximation

**K-map numerical example:** simplify F = Σm(0,1,2,5,6,7) — group 1s into quads/pairs for the minimal SOP expression.

Which circuit or K-map problem shall I solve?`;

const respondSignals = (): string => `## Signals & Systems / Control Systems (EC3354)

Transform-heavy subject — if you know Laplace/Fourier/Z deeply, both Signals and Math papers get easier.

**Core topics:**
1. **Signal classification** — continuous/discrete, periodic, energy vs power signals
2. **LTI systems** — convolution sum/integral, impulse response, causality, stability (BIBO)
3. **Fourier** — Fourier series of periodic signals, Fourier transform properties
4. **Laplace** — ROC, system function H(s), pole-zero plots, stability from pole locations
5. **Z-transform** — ROC, inverse Z by partial fractions, system response
6. **Control (if applicable)** — transfer function, block diagram reduction, Routh-Hurwitz stability, root locus, Bode plots

**Classic problem:** find the output y[n] = x[n] * h[n] using convolution for given sequences, or determine stability from the pole-zero plot.

Send me the specific signal/system problem you're working on.`;

const respondAIML = (): string => `## AI, ML & Modern Electives (CS3491 / CS3391 / open electives)

**Artificial Intelligence (CS3491):**
- Search: BFS/DFS, A*, heuristic functions, constraint satisfaction
- Knowledge: propositional & first-order logic, resolution, expert systems
- Planning & learning basics: inductive learning, neural network overview

**Machine Learning (CS3391 / elective):**
1. **Supervised learning** — linear/logistic regression, decision trees, SVM, Naive Bayes
2. **Model evaluation** — accuracy, precision, recall, F1, confusion matrix (numerical!)
3. **Unsupervised** — K-means clustering (iterations), PCA
4. **Deep learning** — perceptron, activation functions (ReLU, sigmoid), backpropagation concept
5. **Overfitting** — causes, regularization, cross-validation

**Typical exam question:**
> "Given a confusion matrix (TP=50, FP=10, FN=5, TN=85), compute precision, recall, and F1-score."
> Precision = 50/60 ≈ 0.833; Recall = 50/55 ≈ 0.909; F1 = 2·P·R/(P+R) ≈ 0.870

Which topic or problem should I deep-dive into?`;

const respondExam = (): string => `## Anna University Exam Pattern — Know the Battlefield

The semester exam is out of **100 marks** with internal assessment contributing **50 marks**:

| Component | Marks | Details |
|---|---|---|
| Part A | 20 | 10 questions × 2 marks — answer all, one-line definitions with examples |
| Part B | 80 | 5 questions × 16 marks — choose 5 of ~8; each is usually 2 sub-parts (8+8) |
| Internal assessment | 50 | 3 tests + assignment + seminar; min 50% needed for exam eligibility |

**Strategy by question type:**
- **2-markers:** definition + 1 example + 1 formula if relevant. Never write paragraphs.
- **16-markers:** structure with headings, diagrams, step-by-step working, and a concluding summary table. 16 marks ≈ 3-4 pages of structured writing.
- **Numericals:** formula → substitution → working → result with units. Every step carries marks.

**General tips:**
1. Attempt all 5 Part B questions — no negative marking.
2. Write Part A in the first 20 minutes; it's quick scoring.
3. Draw diagrams even when not explicitly asked — examiners award extra clarity marks.
4. Revise the last 3 years' question papers — 60-70% of questions repeat in pattern.

Tell me your subject and I'll share a topic-wise mark distribution or solve sample papers.`;

const respondGrades = (): string => `## Grades, CGPA & How They Work at Anna University

**Grade → Grade Point mapping (R2017/R2021):**

| Grade | Marks Range | Grade Point |
|---|---|---|
| O | 90 – 100 | 10 |
| A+ | 80 – 89 | 9 |
| A | 70 – 79 | 8 |
| B+ | 60 – 69 | 7 |
| B | 55 – 59 | 6 |
| C | 50 – 54 | 5 |
| P | 40 – 49 | 4 |
| U / W / SA / RA | Fail | 0 |

**Formulas:**
- **Semester GPA** = Σ(grade point × credits) ÷ Σ(credits of passed subjects)
- **CGPA** = same formula across *all* semesters combined

**Example:** Semester with Maths-3cr (A=8), DSA-3cr (O=10), OS-4cr (B+=7):
GPA = (3×8 + 3×10 + 4×7) ÷ 10 = 82 ÷ 10 = **8.2**

**Important rules:**
- Minimum **P (40%)** in each subject to pass; an arrear (U) wipes that subject's credits from your GPA until cleared.
- Arrears are cleared through **supplementary/repeat exams** — the new grade replaces the old one in CGPA computation.
- Attendance must be **≥ 75%** to sit the semester exam; 65-75% needs medical condonation, below 65% means detention.

Add your results on the **AU Portal** page and I'll track your CGPA and flag weak subjects automatically. Want help planning how to raise your CGPA next semester?`;

const respondAttendance = (personalized?: {
    pct: number;
    subjectsLine: string;
    warning: string;
}): string => {
    const p = personalized ?? {
        pct: 81,
        subjectsLine: '- Data Structures: 85%\n- Algorithms: 90%\n- Database Systems: 74% (🟡 low)\n- Operating Systems: 88%\n- Discrete Mathematics: 89%',
        warning: '- ✅ Safe zone — keep it above 75% until the last week of classes.',
    };

    return `## Attendance Rules & Eligibility (Anna University)

**The golden number is 75%** — but the full picture:

| Attendance | Consequence |
|---|---|
| ≥ 75% | Eligible to write the semester exam |
| 65% – 75% | Eligible with **medical condonation** (certified medical leave, max 10%) |
| < 65% | **Not eligible** — detained, must repeat the semester's attendance |

**Per-subject rule:** Many colleges enforce 75% *per subject*, not just overall. A single subject below threshold can block you.

**Your current standing (from your records):**
- Overall attendance: ${p.pct}%
${p.subjectsLine}
${p.warning}

**If you're short on attendance:**
1. Attend every class of the weakest subject first — one missed class hurts most where you're lowest.
2. Medical condonation: collect a proper medical certificate for genuine absences.
3. Talk to your class advisor *before* the eligibility cutoff, not after.

Would you like me to calculate exactly how many consecutive classes you must attend to reach 75% in a subject?`;
};

function buildAttendanceBlock(): string {
    const user = useAuthStore.getState().user;
    const quick = getStudentQuickFacts(user);
    const auStore = useAUResultsStore.getState();
    const internal = auStore.getAttendanceEligible();
    const pct = internal.percentage > 0 ? internal.percentage : quick.attendance;

    let warning = '';
    if (pct < 65) {
        warning = '- ⚠️ **CRITICAL:** Below 65% — not exam eligible. See your class advisor immediately.';
    } else if (pct < 75) {
        warning = `- ⚠️ **Warning:** ${pct}% attendance — below 75% eligibility. Collect medical certificates if absences were genuine.`;
    } else {
        warning = '- ✅ Safe zone — keep it above 75% until the last week of classes.';
    }

    const subjectEntries = internal.percentage > 0
        ? auStore.semesters.flatMap((s) =>
            s.subjects
                .filter((sub) => typeof sub.internalMarks === 'number')
                .map((sub) => ({
                    name: sub.name,
                    percentage: Math.round(((sub.internalMarks ?? 0) / 50) * 100),
                }))
        )
        : quick.attendanceLowSubject
            ? [{ name: quick.attendanceLowSubject, percentage: 70 }]
            : [];

    const subjectsLine = subjectEntries.length > 0
        ? subjectEntries
            .map((s) => `- ${s.name}: ${s.percentage}% (${s.percentage < 65 ? '🔴 critical' : '🟡 low'})`)
            .join('\n')
        : '- No subject-specific data recorded yet.';

    return respondAttendance({ pct, subjectsLine, warning });
}

function buildStudyPlan(): string {
    const auStore = useAUResultsStore.getState();
    const weak = auStore.getWeakSubjects();
    const cgpa = auStore.getCGPA();

    const weakList = weak.length > 0
        ? weak
            .map(
                (w, i) =>
                    `${i + 1}. **${w.subject.name} (${w.subject.code})** — Semester ${w.semester}, grade ${w.subject.grade}. Spend ~40% of study time here.`
            )
            .join('\n')
        : '- No results recorded yet. Add them on the AU Portal page and I\'ll build a fully personalized plan. Meanwhile the general priority order is: current semester subjects → arrears → CGPA-boosting electives.';

    const target =
        cgpa !== null && cgpa < 8.5
            ? `Your current CGPA is **${cgpa}**. To reach 8.5+, aim for A+ or O grades in every upcoming subject — a 4-credit O (vs a B) adds 1.6 GPA points per semester.`
            : 'Keep recording your results so I can set an exact CGPA target and track progress.';

    return `## Personalized Study Plan

${target}

**Your weak subjects (priority revision list):**
${weakList}

**Weekly structure (adapt to your timetable):**

| Day | Focus | Duration |
|---|---|---|
| Mon | Weakest subject — Unit 1 revision + 2-mark Q bank | 2h |
| Tue | Second-priority subject — concepts + examples | 2h |
| Wed | Weakest subject — 16-mark previous papers | 2h |
| Thu | Current semester subjects — new topics | 2h |
| Fri | Mixed problem-solving (numericals) | 2h |
| Sat | Full-length previous year paper (timed) | 3h |
| Sun | Review mistakes + plan next week | 1.5h |

**Exam-month intensive (last 30 days):**
1. Days 1-10: Complete all 2-mark question banks (all subjects)
2. Days 11-20: One full unit per day for Part B, weakest first
3. Days 21-27: Previous 3 years' papers, timed, with self-evaluation
4. Days 28-30: Light revision of formulas, diagrams, and definitions only

${weak.length === 0 ? 'Tell me your weakest subjects or add your results, and I\'ll make this plan fully personalized.' : 'This plan prioritizes your recorded weak subjects. Ask me for a deep-dive on any of them.'}`;
}

const respondArrear = (): string => `## Clearing Arrears — A Practical Plan

First, don't panic — a large share of students clear arrears within 1-2 supplementary exams.

**Step-by-step:**
1. **Check the arrear list** on your student profile / AU portal — note subject codes and the regulation (R2017/R2021) each falls under.
2. **Supplementary exams** are held alongside regular semester exams — you can attempt arrears while continuing current semesters.
3. **Study strategy for the re-exam:**
   - Get the last 5 years' question papers for that exact subject code — patterns repeat heavily.
   - Master all Part A (2-mark) questions first — they're the fastest marks.
   - For Part B, prepare 2-3 "safe" units thoroughly rather than skimming all 5.
   - Focus on the units where the subject's 16-mark questions most frequently come from (usually Units 2, 3 and 5).
4. **Internal marks** — check with your department whether internal scores from the original attempt carry over.
5. **Once cleared**, the new grade replaces the arrear in CGPA computation — your CGPA recovers automatically.

**Motivation:** One arrear affects only that subject's credits. Focus energy on passing it *and* keeping your current semester on track.

Tell me the subject code and I'll suggest a unit-wise study priority based on past exam patterns.`;

const respondPortal = (): string => `## Anna University Official Portal (COE)

**Official Centre for Examinations portal:** [coe.annauniv.edu](https://coe.annauniv.edu/home/)

**What you can do there:**
- **Student Login → Students' Corner**: view semester results, download grade cards, check hall tickets
- **Revaluation application**: apply within 15 days of result publication
- **Duplicate certificate requests** and exam notifications

**How to log in (Student):**
1. Go to https://coe.annauniv.edu/home/
2. Use your **Register Number** (format like 21BCE1234)
3. Enter your **Date of Birth** (DD-MM-YYYY)
4. Enter the **security code** shown on screen
5. Solve the **captcha** and submit

**Important notes:**
- The portal uses a captcha, so it can't be auto-checked from this app — log in there directly when results are published.
- Results are typically published **4-6 weeks** after semester exams end.
- This app's **AU Portal** page lets you record your results manually so StudyGPT can track your CGPA and weak subjects in real time.

Want me to open the official portal for you, or help you record your latest semester results here?`;

const respondHousing = (): string => `## Student Housing

KingstonConnect has a built-in **Housing** section with verified student accommodations near campus.

**What's available there:**
- 12 verified listings with photos, rent, distance to campus, and amenities
- Search by location, price range, and amenities (Wi-Fi, AC, mess, laundry)
- **Wishlist**: save favourites to compare later
- **Compare mode**: side-by-side comparison of up to 3 listings (rent, distance, amenities)
- Detail modal for each listing with full info and contact

**Tips when choosing:**
1. Prioritize **distance ≤ 3 km** — saves roughly an hour daily.
2. Check if rent includes **mess/food** — a ₹2-3k mess outside adds up fast.
3. Confirm **Wi-Fi reliability** — essential for online classes and submissions.
4. For groups, split a 2BHK/3BHK — per-person cost often beats hostel fees.

Head to the **Housing** page in the sidebar to browse listings. Anything specific you'd like to know — budget areas, PG vs flat, or safety checks?`;

const respondNotes = (): string => `## Study Notes (KingstonConnect Notes Library)

The **Notes** page in this app is your shared knowledge base:

- **Browse approved notes** uploaded by peers, organized by subject
- **Upload your own notes** (PDF/images) — they go through review before approval
- Notes you upload also power my answers: when you ask about a topic covered in uploaded notes, I reference them directly

**Making the most of it:**
1. Search the Notes library before asking me — human-written notes + my explanations work best together.
2. Upload *handwritten solved question papers* — they're gold before exams.
3. Tag notes with the correct subject code (e.g., CS8391) so others can find them.

Would you like me to explain a specific topic while I search the notes library for supporting material?`;

const respondGeneric = (q: string): string => {
    const quick = getStudentQuickFacts(useAuthStore.getState().user);
    let personal = '';
    if (quick.weakSubjectName) {
        personal += `**Your priority:** ${quick.weakSubjectName} is your weakest recorded subject — I can build a revision plan for it.\n`;
    }
    if (quick.attendanceLowSubject) {
        personal += `**Alert:** ${quick.attendanceLowSubject} is below 75% attendance — attend those classes!\n`;
    }
    return `## How can I help you today? 🎓

I'm StudyGPT, your personal AI tutor for engineering studies at Kingston Engineering College.

**I can help with:**
- 📚 **Any subject** — DSA, OS, DBMS, Networks, SE, Maths, Physics, Chemistry, English, Microprocessors, Electronics, Signals, AI/ML
- 📝 **Exam prep** — Anna University 2-mark/16-mark patterns, solved problems, mark strategy
- 📊 **Your academics** — CGPA analysis, weak subjects, attendance eligibility
- 🏠 **Campus life** — housing search, study notes, timetable, events
${personal ? `\n**About you right now:**\n${personal}` : ''}
*Tip: The more specific your question, the better I can help. Try things like "explain deadlock with example", "solve this knapsack problem", or "make a study plan for my weak subjects."*

Note: The external AI backend is not connected right now — I'm running on my enhanced offline knowledge base, which covers all core engineering subjects and Anna University exam patterns in depth.

You asked: "${q}" — could you rephrase with the subject or topic you have in mind?`;
};

type IntentFn = () => string;

const INTENT_RESPONSES: Record<Exclude<Intent, 'generic' | 'teacher'>, IntentFn> = {
    dsa: respondDSA,
    algo: respondAlgo,
    dbms: respondDBMS,
    os: respondOS,
    cn: respondCN,
    se: respondSE,
    math: respondMath,
    physics: respondPhysics,
    chemistry: respondChemistry,
    english: respondEnglish,
    microprocessor: respondMicroprocessor,
    electronics: respondElectronics,
    signals: respondSignals,
    aiml: respondAIML,
    exam: respondExam,
    grades: respondGrades,
    studyplan: buildStudyPlan,
    attendance: buildAttendanceBlock,
    arrear: respondArrear,
    portal: respondPortal,
    housing: respondHousing,
    notes: respondNotes,
    deadlines: buildDeadlinesResponse,
    focus: buildFocusResponse,
};

// ---------------------------------------------------------------------------
// Dashboard-aware responses — deadlines & today's focus use real dashboard
// data (shared via src/data/studentData.ts, same source as the Dashboard page)
// ---------------------------------------------------------------------------

function buildDeadlinesResponse(): string {
    const deadlines = getDeadlinesSorted();
    const rows = deadlines
        .map(
            (d) =>
                `| ${d.title} | ${d.subject} | ${d.dueDate} | ${d.daysUntil} day(s) | ${d.type} |`
        )
        .join('\n');
    const urgent = deadlines.find((d) => d.daysUntil <= 3);
    return `## Your Upcoming Deadlines

You have **${deadlines.length} deadline(s)** coming up:

| Item | Subject | Due Date | In | Type |
| --- | --- | --- | --- | --- |
${rows}

${
    urgent
        ? `**⚠️ Urgent:** "${urgent.title}" is due in **${urgent.daysUntil} day(s)**. Want me to make a crash plan for it?`
        : 'None of these are urgent yet — but starting early on the DBMS Project is a smart move.'
}

**Tips:**
1. Work backward from each due date — aim to finish the first draft 2 days early
2. For the quiz, practice 16-mark style questions from Anna University previous papers
3. For the project, define scope today and split it into milestones`;
}

function buildFocusResponse(): string {
    const deadlines = getDeadlinesSorted();
    const urgent = deadlines.filter((d) => d.daysUntil <= 3);
    const below = ATTENDANCE_STATS.subjectWise.filter((s) => s.percentage < 75);
    const auStore = useAUResultsStore.getState();
    const weak = auStore.getWeakSubjects();

    const lines = [
        '## What You Should Focus On Today',
        '',
        'Based on your dashboard data, here is your priority order:',
        '',
    ];
    let n = 1;
    if (urgent.length > 0) {
        lines.push(
            `${n++}. **${urgent[0].title}** (${urgent[0].subject}) — due in ${urgent[0].daysUntil} day(s). Deadline first; even 90 minutes today keeps you on track.`
        );
    }
    if (below.length > 0) {
        lines.push(
            `${n++}. **Attend every ${below[0].name} class** — attendance is ${below[0].percentage}%, below the 75% exam-eligibility line.`
        );
    }
    if (weak.length > 0) {
        lines.push(
            `${n++}. **Revise ${weak[0].subject.name}** — your weakest recorded subject (grade ${weak[0].subject.grade}, Semester ${weak[0].semester}).`
        );
    }
    lines.push(
        `${n++}. **Keep your momentum in Algorithms** — you scored 18/20 on the last assignment; a quick revision session maintains the edge.`
    );

    const schedule = `| When | Focus |
| --- | --- |
| Today | ${urgent[0]?.title ?? 'Algorithms revision'} |
| Tomorrow | ${deadlines[1]?.title ?? 'DBMS Project — milestone 1'} |
| This week | ${below[0] ? `Attend all ${below[0].name} classes` : 'Complete the first DBMS Project milestone'} |`;
    return lines.join('\n') + '\n\n**Today\'s mini-schedule:**\n\n' + schedule;
}

// Teacher-uploaded content awareness: announcements, assignments, notes
function respondTeacher(content: string): string {
    const teacherBlock = getRelevantTeacherContent(content);
    const formats = detectFormats(content);
    const formatted = applyFormats(teacherBlock, formats);
    return `${formatted}${buildModeInstructions(content)}

*Tip: if you want a deeper answer on any of these, ask me directly — e.g. "summarize the Database Design Project" or "explain the Process Scheduling graded assignment". You can also pick a format with the sparkles button (MCQs, flashcards, 2-mark answer, flowchart …).*`;
}

// Fallback local AI response when no backend is available
const generateLocalResponse = (content: string): string => {
    const intent = detectIntent(content);
    if (intent === 'teacher') return respondTeacher(content);
    if (intent === 'generic') return respondGeneric(content);
    const core = INTENT_RESPONSES[intent]();
    // Apply any requested output formats / learning modes from the catalog
    const formats = detectFormats(content);
    return applyFormats(core, formats) + buildModeInstructions(content);
};

// =============================================================================
// MESSAGE HANDLER — student-aware system prompt + RAG + online/offline paths
// =============================================================================

export const sendMessage = async (
    content: string,
    _sessionId: string,
    _userId: string,
    history: ChatMessage[],
    _attachments?: File[]
): Promise<StudyGPTResponse> => {
    const apiUrl = getApiUrl();
    const user = useAuthStore.getState().user;
    void user; // identity used inside buildStudentContext via store snapshot

    // Student-aware context: profile + AU results + attendance
    const studentContext = buildStudentContext(user);

    // Teacher-uploaded content: everything teachers posted must be known
    const teacherContent = getRelevantTeacherContent(content);

    // Append teacher content to the user message so the online backend can
    // cite uploaded material, and also for the local path below.
    const userMessage = `${content}${teacherContent.startsWith('Nothing') ? '' : '\n\n' + teacherContent}`;

    // If no backend URL, use local fallback
    if (!apiUrl) {
        // Retrieve any relevant context from notes
        const context = await retrieveContext(content);

        // Teacher-uploaded material always flows into local answers
        const localAnswer = generateLocalResponse(userMessage);
        return {
            content: localAnswer,
            sources: context ? ['Local Knowledge Base', 'Teacher Uploads', 'Student Notes'] : ['Local Knowledge Base', 'Teacher Uploads']
        };
    }

    // Retrieve Context (RAG)
    const context = await retrieveContext(content);

    // Construct Messages
    const systemPrompt = `You are StudyGPT, an intelligent AI tutor for engineering students at Kingston Engineering College (Anna University affiliated).

Your goal is to help students learn, solve problems, and understand concepts.
Always be encouraging, precise, and helpful.

The following is the CURRENT STUDENT's live context — use it to personalize every answer:
${studentContext}

If you use the provided context notes, explicitly mention them.
Format your response in clean Markdown.`;

    const historyMessages: ChatMessage[] = history
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }));

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: context ? `${context}\n\nQuestion: ${userMessage}` : userMessage }
    ];

    try {
        // Call API with a timeout guard — a dead ngrok tunnel must never freeze the chat
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        let response: Response;
        try {
            response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    messages: messages,
                    max_tokens: 2048,
                    temperature: 0.7
                }),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            // If server error, fall back to local response
            console.warn('AI Server returned error, using fallback');
            return {
                content: generateLocalResponse(content),
                sources: []
            };
        }

        const data = await response.json();
        return {
            content: data.content || data.message || data.response || generateLocalResponse(content),
            sources: context ? ['Student Notes', 'AI Backend'] : ['AI Backend']
        };

    } catch (error) {
        console.error("StudyGPT Error:", error);
        // Fallback to local response on any error
        return {
            content: generateLocalResponse(content),
            sources: ['Offline Mode']
        };
    }
};
