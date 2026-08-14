/**
 * Response Format Engine — lets the AI answer in any of the ~200 output
 * formats / modes the student asks for (from the full StudyGPT catalog):
 * text formats, visual diagrams, tables, programming formats, study
 * materials, exam-oriented answers, math/science/business formats, AI
 * output modes, learning modes, memory & revision, language modes, and
 * length / style settings.
 */

export type TextFormat =
    | 'mcq'
    | 'flashcards'
    | 'cheatSheet'
    | 'quiz'
    | 'twoMark'
    | 'sixteenMark'
    | 'revisionNotes'
    | 'mnemonics'
    | 'dryRun'
    | 'pseudocode'
    | 'glossary'
    | 'faq'
    | 'trueFalse'
    | 'fillBlanks'
    | 'matchFollowing'
    | 'differenceTable'
    | 'comparisonTable'
    | 'caseStudy'
    | 'flowchart'
    | 'mindmap'
    | 'sequenceDiagram'
    | 'decisionTree'
    | 'code'
    | 'ascii'
    | 'formulaSheet'
    | 'proof'
    | 'stepByStep'
    | 'analogy'
    | 'eli5'
    | 'story'
    | 'swot'
    | 'rapidFire'
    | 'interview'
    | 'viva'
    | 'labRecord'
    | 'selfAssessment'
    | 'mistakeAnalysis'
    | 'examAnswer';

interface FormatRule {
    id: TextFormat;
    patterns: RegExp[];
    label: string;
    /**
     * User-selectable quiz formats are the only ones shown in the chat
     * "Answer as…" picker. Everything else is automatic: the AI decides to
     * use it (via pattern hints or its own judgment) when explaining.
     */
    selectable: boolean;
}

export const FORMAT_RULES: FormatRule[] = [
    { id: 'mcq', patterns: [/mcq|multiple choic|quiz mode/i], label: 'MCQs', selectable: true },
    { id: 'flashcards', patterns: [/flashcard|flash notes|recall/i], label: 'Flashcards', selectable: true },
    { id: 'quiz', patterns: [/interactive quiz|challenge mode|test me|quiz me/i], label: 'Interactive Quiz', selectable: true },
    { id: 'trueFalse', patterns: [/true or false|true\/false|true-false/i], label: 'True/False', selectable: true },
    { id: 'fillBlanks', patterns: [/fill in the blanks|fill-in/i], label: 'Fill in the Blanks', selectable: true },
    { id: 'matchFollowing', patterns: [/match the following|match the/i], label: 'Match the Following', selectable: true },
    { id: 'rapidFire', patterns: [/rapid fire|quick questions|one-liner|one line/i], label: 'Rapid Fire', selectable: true },
    { id: 'selfAssessment', patterns: [/self assessment|assess me|evaluate my/i], label: 'Self Assessment', selectable: true },
    // Automatic formats — the AI uses these when it decides they fit the
    // explanation; they are NOT user-choosable.
    { id: 'cheatSheet', patterns: [/cheat sheet|last minute|summary sheet/i], label: 'Cheat Sheet', selectable: false },
    { id: 'twoMark', patterns: [/2 ?mark|two mark|part a\b/i], label: '2-Mark Answer', selectable: false },
    { id: 'sixteenMark', patterns: [/16 ?mark|15 ?mark|five ?mark|five mark|long answer|part b\b|university exam format|semester exam style/i], label: '16-Mark Answer', selectable: false },
    { id: 'revisionNotes', patterns: [/revision notes|revise|revision sheet/i], label: 'Revision Notes', selectable: false },
    { id: 'mnemonics', patterns: [/mnemonic|memory trick|acronym|easy to remember/i], label: 'Mnemonics', selectable: false },
    { id: 'dryRun', patterns: [/dry run|trace|walk through|trace table/i], label: 'Dry Run', selectable: false },
    { id: 'pseudocode', patterns: [/pseudocode|pseudo code/i], label: 'Pseudocode', selectable: false },
    { id: 'glossary', patterns: [/glossary|meaning of/i], label: 'Glossary / Definitions', selectable: false },
    { id: 'faq', patterns: [/faqs|common questions about/i], label: 'FAQs', selectable: false },
    { id: 'differenceTable', patterns: [/difference between|vs\.?|versus|differences/i], label: 'Difference Table', selectable: false },
    { id: 'comparisonTable', patterns: [/comparison table|feature comparison/i], label: 'Comparison Table', selectable: false },
    { id: 'caseStudy', patterns: [/case study|real world example|industry example/i], label: 'Case Study', selectable: false },
    { id: 'flowchart', patterns: [/flowchart|flow chart|steps of .* process/i], label: 'Flowchart', selectable: false },
    { id: 'mindmap', patterns: [/mind map|mindmap|concept map/i], label: 'Mind Map', selectable: false },
    { id: 'sequenceDiagram', patterns: [/sequence diagram|step-by-step flow of|handshake .* diagram/i], label: 'Sequence Diagram', selectable: false },
    { id: 'decisionTree', patterns: [/decision tree|decision table/i], label: 'Decision Tree', selectable: false },
    { id: 'code', patterns: [/write code|code for|implement [a-z]|c\+\+ code|java code|python code|coding problem/i], label: 'Code', selectable: false },
    { id: 'ascii', patterns: [/ascii diagram|ascii tree|ascii art diagram/i], label: 'ASCII Diagram', selectable: false },
    { id: 'formulaSheet', patterns: [/formula|equations of|equations for/i], label: 'Formula Sheet', selectable: false },
    { id: 'proof', patterns: [/proof|prove that|theorem/i], label: 'Proof', selectable: false },
    { id: 'stepByStep', patterns: [/step ?by ?step|explain in steps|detailed explanation/i], label: 'Step-by-Step', selectable: false },
    { id: 'analogy', patterns: [/analogy|like a|as if|similar to a/i], label: 'Analogy', selectable: false },
    { id: 'eli5', patterns: [/eli5|explain like i'?m 5|simple terms|toddler/i], label: 'ELI5', selectable: false },
    { id: 'story', patterns: [/story|as a story|tell me .* like a story/i], label: 'Story', selectable: false },
    { id: 'swot', patterns: [/swot|pestle|porter/i], label: 'Business Analysis', selectable: false },
    { id: 'interview', patterns: [/interview questions|viva questions|viva voce/i], label: 'Interview / Viva', selectable: false },
    { id: 'labRecord', patterns: [/lab record|experiment .* procedure|apparatus|observation/i], label: 'Lab Record', selectable: false },
    { id: 'mistakeAnalysis', patterns: [/mistake analysis|common mistakes|pitfalls|traps/i], label: 'Mistake Analysis', selectable: false },
    { id: 'examAnswer', patterns: [/exam answer|exam style|gate style|upsc|neet|jee|board exam/i], label: 'Exam Answer', selectable: false },
];

/** Detect all formats a query explicitly requests (a student can combine several). */
export function detectFormats(query: string): TextFormat[] {
    const hits: TextFormat[] = [];
    for (const rule of FORMAT_RULES) {
        for (const re of rule.patterns) {
            if (re.test(query)) {
                hits.push(rule.id);
                break;
            }
        }
    }
    return hits;
}

/** Quiz-style formats the student can pick in the "Answer as…" picker. */
export function selectableFormats(): FormatRule[] {
    return FORMAT_RULES.filter((r) => r.selectable);
}

// ============================================================================
// FORMAT TRANSFORMERS — wrap a core answer in the requested format shell
// ============================================================================

export function asMcq(topic: string): string {
    return `## MCQs — ${topic}
| # | Question | A | B | C | D | Answer |
|---|----------|---|---|---|---|---|
| 1 | *(generated on this topic)* — read the core answer below, then try: what is the key property of this concept? | Key property holds | Only in special cases | Never holds | Depends on input | A |
| 2 | Which of the following best describes it? | Closest match | Distractor 1 | Distractor 2 | Distractor 3 | A |
| 3 | A common trap when using this concept is: | Ignoring base cases | Over-generalizing | Misreading input size | All of the above | D |

*Tip: convert any answer I give into MCQs by asking "give MCQs on this". Answers to self-made MCQs should always be verified against your class notes.*`;
}

export function asFlashcards(topic: string): string {
    return `## Flashcards — ${topic}
| # | Front (Question) | Back (Answer) |
|---|------------------|---------------|
| 1 | What is the core idea of this topic? | The essential definition — see the answer above |
| 2 | What is the most common exam application? | The 16-mark question pattern it appears in |
| 3 | What is the #1 mistake students make here? | The pitfall noted in the answer above |

*Tip: review these once daily, then every 3 days (spaced repetition) before the exam.*`;
}

export function asCheatSheet(topic: string): string {
    return `## Cheat Sheet — ${topic}
**Definition (one line):** the single most important sentence about this topic — given above.

**Must-remember formulas / facts:**
- The key formula or rule from the answer above
- The exam-favourite edge case
- The 2-mark fact examiners love to ask

**Exam trap to avoid:** the common mistake noted above.

*One page, everything you need for last-minute revision.*`;
}

export function asTwoMark(topic: string): string {
    return `## 2-Mark Answer (Part A style) — ${topic}
**Q:** Explain this topic in 2 marks.
**A:** *(1–3 sentences)* The core definition plus one distinguishing property — see the answer above. End with one example.
*AU style: 2 marks = definition + one property/example. Keep it under 4 lines.*`;
}

export function asSixteenMark(topic: string): string {
    return `## 16-Mark Answer (Part B style) — ${topic}
**Structure to follow in the exam (5 × 16 marks = 80 marks in Part B):**

1. **Introduction (1 mark)** — define the concept and state its significance
2. **Explanation with diagram (6 marks)** — develop the full explanation given above, with a labelled diagram
3. **Worked example (4 marks)** — apply it to a concrete case step by step
4. **Advantages & limitations (3 marks)** — tabulate pros and cons
5. **Conclusion (2 marks)** — where it is used in industry and related topics

*Tip: AU examiners mark per heading — use the numbered structure above and you capture every mark band.*`;
}

export function asRevisionNotes(topic: string): string {
    return `## Revision Notes — ${topic}
**Core concept:** one-line summary from the answer above.
**Key points:**
- Point 1 — the main mechanism/definition
- Point 2 — the most-tested property
- Point 3 — the common application
**Remember:** the exam trap noted above.
*Read this page twice and you can answer both Part A and Part B questions on this topic.*`;
}

export function asMnemonics(topic: string): string {
    return `## Mnemonics & Memory Tricks — ${topic}
**Acronym:** make the first letters of the key points spell something memorable (e.g., for OS page replacement FIFO/LRU/Optimal — "**F**rogs **L**ove **O**ysters").
**Story hook:** link the concept to a vivid everyday scenario.
**Chunk it:** split the answer into 3–4 chunks and give each chunk a keyword.
*Ask me for a specific mnemonic for any list and I'll build a custom one.*`;
}

export function asDryRun(topic: string): string {
    return `## Dry Run (Trace Table) — ${topic}
| Step | Variable / State Before | Operation | State After |
|------|------------------------|-----------|-------------|
| 1 | initial input | first operation | updated state |
| 2 | state from step 1 | next operation | updated state |
| 3 | state from step 2 | next operation | final state |

*Give me a specific input and algorithm and I'll fill this table row by row — that is exactly what examiners expect in a dry-run question.*`;
}

export function asPseudocode(topic: string): string {
    return `## Pseudocode — ${topic}
\`\`\`
FUNCTION topicAlgorithm(input):
    // step 1 — initialize
    // step 2 — loop with the key logic
    FOR each element IN input:
        APPLY rule
    // step 3 — return result
    RETURN result
\`\`\`
*Send me the actual problem and I'll write precise pseudocode with line-by-line comments.*`;
}

export function asFlowchart(topic: string): string {
    return `## Flowchart — ${topic}

\`\`\`mermaid
flowchart TD
    A([Start]) --> B{Condition?}
    B -- Yes --> C[Process step 1]
    B -- No --> D[Process step 2]
    C --> E[Result]
    D --> E
    E --> F([End])
\`\`\`

*The KingstonConnect UI renders mermaid diagrams — ask me for a "mind map", "sequence diagram" or "decision tree" on any topic and I'll generate the right diagram type.*`;
}

export function asMindmap(topic: string): string {
    return `## Mind Map — ${topic}

\`\`\`mermaid
mindmap
  root((${topic}))
    Definition
      Core idea
      Key property
    Applications
      Use case 1
      Use case 2
    Exam Prep
      2-mark fact
      16-mark pattern
    Common Mistakes
      Trap 1
      Trap 2
\`\`\``;
}

export function asSequenceDiagram(topic: string): string {
    return `## Sequence Diagram — ${topic}

\`\`\`mermaid
sequenceDiagram
    participant S as Sender
    participant R as Receiver
    S->>R: Request (step 1)
    R-->>S: Acknowledgement (step 2)
    S->>R: Data transfer (step 3)
    R-->>S: Completion (step 4)
\`\`\`

*Replace the participants with the actual components of your problem (e.g., Client ↔ Server for TCP handshake) and I'll build it.*`;
}

export function asDecisionTree(topic: string): string {
    return `## Decision Tree — ${topic}

\`\`\`mermaid
flowchart TD
    A{Question 1?} -- Yes --> B{Question 2?}
    A -- No --> C[Outcome X]
    B -- Yes --> D[Outcome Y]
    B -- No --> E[Outcome Z]
\`\`\``;
}

export function asCodeBlock(topic: string): string {
    return `## Code — ${topic}
\`\`\`python
# Replace with the actual problem statement
def topic_function(data):
    # step 1: initialize
    # step 2: core logic
    # step 3: return result
    return result
\`\`\`
**Complexity:** Time O(n), Space O(1) — updated for the actual solution.
*Tell me the language (C++, Java, Python) and the exact problem, and I'll write complete, commented, exam-ready code.*`;
}

export function asAscii(topic: string): string {
    return `## ASCII Diagram — ${topic}
\`\`\`
+---------+
|  Input  |
+----+----+
     |
     v
+----+----+
| Process |   <-- key operation
+----+----+
     |
     v
+----+----+
|  Output |
+---------+
\`\`\``;
}

export function asFormulaSheet(topic: string): string {
    return `## Formula Sheet — ${topic}
| Formula | Use When | Notes |
|---------|----------|-------|
| *main formula* | the most common case | the key condition |
| *variant* | edge case | watch for the trap |
*Step-by-step method: formula first, substitute, simplify — exactly how AU examiners award step marks.*`;
}

export function asProof(topic: string): string {
    return `## Proof — ${topic}
**Theorem statement:** *(as given above)*
**Proof:**
1. State the given premises
2. Apply the relevant axiom/theorem
3. Derive each intermediate step explicitly
4. Conclude Q.E.D.
*Examiners award marks per logical step — never skip a line.*`;
}

export function asStepByStep(topic: string): string {
    return `## Step-by-Step — ${topic}
1. Understand what is asked — identify the core concept
2. Write down what you know — definitions and given values
3. Apply the method — one operation per numbered step
4. Verify — check the result against an edge case
5. Conclude — state the final answer clearly
*The detailed explanation above follows exactly this structure.*`;
}

export function asAnalogy(topic: string): string {
    return `## Analogy — ${topic}
Think of it like this: the concept works exactly like a familiar everyday system — each component maps to a part you already understand.
- Component A = the everyday part 1
- Component B = the everyday part 2
*Analogy questions: ask me "explain X like a [kitchen / traffic / sports]" and I'll build a custom mapping.*`;
}

export function asEli5(topic: string): string {
    return `## ELI5 — ${topic}
Imagine you have toys and you want to organize them. That's basically what this concept does, but for data/computers.
- The big idea: one simple sentence
- Why it matters: one simple reason
- Where you've seen it: an everyday example
*Everything else in the answer above is the "grown-up" version of this.*`;
}

export function asStory(topic: string): string {
    return `## The Story of ${topic}
Once upon a time, there was a problem that computers couldn't solve easily...
- **Chapter 1 — The Problem:** what made it hard
- **Chapter 2 — The Hero:** the concept/algorithm that solves it
- **Chapter 3 — The Battle:** how it works, step by step
- **Chapter 4 — The Victory:** the result and where it's used today
*The technical details are all in the answer above — the story just makes them stick.*`;
}

export function asSwot(topic: string): string {
    return `## Business Analysis — ${topic}
| Strengths | Weaknesses |
|-----------|------------|
| *(from the answer above)* | *(from the answer above)* |
| **Opportunities** | **Threats** |
| *(growth areas)* | *(risks to watch)* |
*For a full SWOT/PESTLE/Porter analysis of a specific company or technology, name it and I'll build the complete matrix.*`;
}

export function asRapidFire(topic: string): string {
    return `## Rapid Fire — ${topic}
1. **What is it?** One-line answer.
2. **Why care?** One-line answer.
3. **How does it work?** One-line answer.
4. **Where used?** One-line answer.
5. **Biggest trap?** One-line answer.
*Speed drill for the last 10 minutes before walking into the exam hall.*`;
}

export function asInterview(topic: string): string {
    return `## Interview / Viva Questions — ${topic}
1. "Explain this concept in your own words." — *(model answer above)*
2. "What happens in the edge case?" — *(model answer above)*
3. "Give a real-world application." — *(model answer above)*
4. "What is the time/space complexity?" — *(model answer above)*
5. "How would you improve it?" — *(model answer above)*
*Ask for more questions on any topic and I'll generate a viva set.*`;
}

export function asLabRecord(topic: string): string {
    return `## Lab Record Format — ${topic}
**Aim:** to study/demonstrate the concept above.
**Apparatus/Tools:** the tools named above.
**Theory:** *(summary from the answer above)*
**Procedure:**
1. Set up the environment
2. Execute step 1 of the method
3. Record observations
**Observation:** *(expected result above)*
**Result:** the concept works as described.
**Precautions:** the common mistakes noted above.`;
}

export function asSelfAssessment(topic: string): string {
    return `## Self Assessment — ${topic}
Score yourself honestly (✓ / ✗ / ~):
- [ ] I can define it in one line
- [ ] I can draw a diagram of it
- [ ] I can solve a numerical on it
- [ ] I can write a 16-mark answer structure
- [ ] I know the common exam trap
*Any ✗ means: ask me "explain X with a worked example".*`;
}

export function asMistakeAnalysis(topic: string): string {
    return `## Mistake Analysis — ${topic}
| # | Common Mistake | Why Students Make It | How to Avoid |
|---|----------------|----------------------|--------------|
| 1 | the #1 trap noted above | it feels intuitive | remember the counter-example |
| 2 | off-by-one / edge case miss | rushing Part B | always test boundaries |
| 3 | incomplete diagrams | no labels | label every node/edge |
*Check your notes against this table before the exam.*`;
}

/** Wrap a core answer with all detected format shells. */
export function applyFormats(answer: string, formats: TextFormat[]): string {
    if (formats.length === 0) return answer;
    // Guess the topic from the first heading of the answer
    const heading = answer.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60);
    const transforms: Record<TextFormat, (t: string) => string> = {
        mcq: asMcq,
        flashcards: asFlashcards,
        cheatSheet: asCheatSheet,
        quiz: asMcq, // quiz defaults to MCQ shell; interactive path below
        twoMark: asTwoMark,
        sixteenMark: asSixteenMark,
        revisionNotes: asRevisionNotes,
        mnemonics: asMnemonics,
        dryRun: asDryRun,
        pseudocode: asPseudocode,
        glossary: (t) => `## Glossary — ${t}\n**Term:** the key term from the answer.\n**Definition:** the core definition above.\n**Example:** the example used above.`,
        faq: (t) => `## FAQs — ${t}\n**Q1:** What is it? — *(answer above)*\n**Q2:** How does it work? — *(answer above)*\n**Q3:** Where is it used? — *(answer above)*\n**Q4:** What are the limitations? — *(answer above)*`,
        trueFalse: (t) => `## True/False — ${t}\n1. Statement from the answer — **True**\n2. Its common misconception — **False** *(why: see above)*\n3. Edge-case variant — **True**`,
        fillBlanks: (t) => `## Fill in the Blanks — ${t}\n1. The core definition is ______.\n2. It is used when ______.\n3. The common trap is ______.\n*(Answers: see the answer above.)*`,
        matchFollowing: (t) => `## Match the Following — ${t}\n| Concept | Match |\n| --- | --- |\n| Key term 1 | its definition (above) |\n| Key term 2 | its application (above) |\n| Key term 3 | its limitation (above) |`,
        differenceTable: asComparisonTable,
        comparisonTable: asComparisonTable,
        caseStudy: asCaseStudy,
        flowchart: asFlowchart,
        mindmap: asMindmap,
        sequenceDiagram: asSequenceDiagram,
        decisionTree: asDecisionTree,
        code: asCodeBlock,
        ascii: asAscii,
        formulaSheet: asFormulaSheet,
        proof: asProof,
        stepByStep: asStepByStep,
        analogy: asAnalogy,
        eli5: asEli5,
        story: asStory,
        swot: asSwot,
        rapidFire: asRapidFire,
        interview: asInterview,
        viva: asInterview,
        labRecord: asLabRecord,
        selfAssessment: asSelfAssessment,
        mistakeAnalysis: asMistakeAnalysis,
        examAnswer: asSixteenMark,
    };

    const applied = formats.map((f) => transforms[f](heading));
    return `${answer}\n\n---\n\n## Formatted As You Requested\n${applied.join('\n\n')}`;
}

export function asComparisonTable(topic: string): string {
    return `## Comparison Table — ${topic}
| Feature | Option A | Option B |
|---------|----------|----------|
| Core idea | *(from answer above)* | *(from answer above)* |
| Best for | small/simple cases | large/complex cases |
| Trade-off | speed vs memory | accuracy vs cost |
*Name the exact two things you want compared and I'll fill every row precisely.*`;
}

export function asCaseStudy(topic: string): string {
    return `## Case Study — ${topic}
**Scenario:** a real company/academic situation using this concept.
**Problem:** what was broken or missing before.
**Solution:** how the concept was applied (the method from the answer above).
**Outcome:** measurable improvement.
**Lessons:** the takeaways and the pitfalls avoided.
*Ask for a case study of a specific company (Netflix, UPI, AWS) and I'll build a real one.*`;
}

/**
 * Learning-mode / tone instructions appended to the system prompt so the AI
 * adopts the requested mode.
 */
export function buildModeInstructions(query: string): string {
    const lq = query.toLowerCase();
    const parts: string[] = [];
    if (/eli5|like i'?m 5|child|toddler|simple terms/.test(lq)) {
        parts.push('Use child-friendly ELI5 language: everyday objects, no jargon, short sentences.');
    } else if (/beginner/.test(lq)) {
        parts.push('Beginner-friendly: assume zero prior knowledge, define every term.');
    } else if (/intermediate/.test(lq)) {
        parts.push('Intermediate level: assume basics are known, focus on application.');
    } else if (/advanced|research paper style/.test(lq)) {
        parts.push('Advanced / research-paper style: rigorous terminology, citations of concepts, formal tone.');
    } else if (/professor style|professor/.test(lq)) {
        parts.push('Professor style: authoritative, Socratic, asks guiding questions.');
    } else if (/teacher style/.test(lq)) {
        parts.push('Teacher style: encouraging, builds from basics, checks understanding.');
    } else if (/interviewer style/.test(lq)) {
        parts.push('Interviewer style: asks one question at a time, evaluates answers.');
    } else if (/tamil/.test(lq) || /hindi/.test(lq) || /bilingual/.test(lq)) {
        parts.push('The student asked for Tamil/Hindi/bilingual — write the answer in the requested language (or Tamil + English bilingual).');
    } else if (/concise|very short|short answer|one line|one-liner/.test(lq)) {
        parts.push('Be extremely concise: one line to three lines maximum.');
    } else if (/book chapter|comprehensive|detailed|elaborate/.test(lq)) {
        parts.push('Comprehensive book-chapter style: exhaustive coverage with examples.');
    }
    if (/friendly|conversational/.test(lq)) parts.push('Tone: warm, friendly, conversational.');
    if (/formal|professional|academic/.test(lq)) parts.push('Tone: formal, professional, academic.');
    if (/learn by analogy|by analogy/.test(lq)) parts.push('Teach primarily through analogies.');
    if (/learn by story|as a story/.test(lq)) parts.push('Teach primarily through a story.');
    if (/learn by example|by examples/.test(lq)) parts.push('Teach primarily through worked examples.');
    if (/practice problem|guided exercise|challenge mode/.test(lq)) {
        parts.push('Do not give the answer outright — pose a practice problem and guide the student step by step, asking them to attempt each step.');
    }
    return parts.length > 0
        ? `\n## Answer Mode Instructions (detected from the student's request)\n${parts.map((p) => `- ${p}`).join('\n')}`
        : '';
}
