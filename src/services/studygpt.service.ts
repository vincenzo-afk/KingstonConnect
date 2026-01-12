import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
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
        const snapshot = await getDocs(q);

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

// Fallback local AI response when no backend is available
const generateLocalResponse = (content: string): string => {
    const lowerContent = content.toLowerCase();

    // Subject-specific responses
    if (lowerContent.includes('database') || lowerContent.includes('sql') || lowerContent.includes('dbms')) {
        return `## Database Management Systems

I'd be happy to help with your database question! Here are some key concepts:

**Key Topics in DBMS:**
1. **ER Diagrams** - Entity-Relationship modeling for database design
2. **Normalization** - 1NF, 2NF, 3NF, BCNF for reducing redundancy
3. **SQL** - Structured Query Language for data manipulation
4. **Transactions** - ACID properties (Atomicity, Consistency, Isolation, Durability)
5. **Indexing** - B-trees, Hash indexes for faster queries

Could you please provide more details about your specific question? I can explain:
- How to design ER diagrams
- SQL query examples
- Normalization steps
- Concurrency control concepts`;
    }

    if (lowerContent.includes('operating system') || lowerContent.includes('os') || lowerContent.includes('process')) {
        return `## Operating Systems

Great question about Operating Systems! Here are the core concepts:

**Key OS Topics:**
1. **Process Management** - Process states, scheduling algorithms
2. **Memory Management** - Paging, segmentation, virtual memory
3. **File Systems** - File organization, allocation methods
4. **Deadlocks** - Prevention, avoidance, detection, recovery
5. **CPU Scheduling** - FCFS, SJF, Round Robin, Priority scheduling

What specific topic would you like me to explain in detail?`;
    }

    if (lowerContent.includes('network') || lowerContent.includes('tcp') || lowerContent.includes('ip') || lowerContent.includes('osi')) {
        return `## Computer Networks

Let me help you with networking concepts!

**Key Networking Topics:**
1. **OSI Model** - 7 layers of network communication
2. **TCP/IP** - Protocol suite for internet communication
3. **Routing** - Distance vector, link state algorithms
4. **Transport Layer** - TCP vs UDP, flow control
5. **Application Protocols** - HTTP, FTP, DNS, SMTP

Which specific networking concept would you like me to explain?`;
    }

    // Generic helpful response
    return `## Hello! I'm StudyGPT 🎓

I'm here to help you with your studies! I can assist with:

📚 **Subjects I can help with:**
- Database Management Systems (DBMS)
- Operating Systems
- Computer Networks
- Data Structures & Algorithms
- Software Engineering
- And more!

**How to get the best help:**
1. Ask specific questions about a topic
2. Share what you're confused about
3. Request examples or explanations

*Note: The AI backend is not currently connected. For full AI capabilities, please configure the StudyGPT API URL in Settings.*

What would you like to learn about today?`;
};

export const sendMessage = async (
    content: string,
    _sessionId: string,
    _userId: string,
    history: any[],
    _attachments?: File[]
): Promise<StudyGPTResponse> => {
    const apiUrl = getApiUrl();

    // If no backend URL, use local fallback
    if (!apiUrl) {
        // Retrieve any relevant context from notes
        const context = await retrieveContext(content);

        return {
            content: generateLocalResponse(content),
            sources: context ? ['Local Knowledge Base'] : []
        };
    }

    // Retrieve Context (RAG)
    const context = await retrieveContext(content);

    // Construct Messages
    const systemPrompt = `You are StudyGPT, an intelligent AI tutor for engineering students.
Your goal is to help students learn, solve problems, and understand concepts.
Always be encouraging, precise, and helpful.
If you use the provided context notes, explicitly mention them.
Format your response in clean Markdown.`;

    const historyMessages: ChatMessage[] = history
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
        }));

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: context ? `${context}\n\nQuestion: ${content}` : content }
    ];

    try {
        // Call API
        const response = await fetch(`${apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

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
            sources: context ? ['Student Notes'] : []
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
