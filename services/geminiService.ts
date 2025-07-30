
import { GoogleGenAI, Type } from "@google/genai";
import { GrammarSpotterQuestion, GrammarFillQuestion, Dialogue, EmojiQuestion, GrammarValidationResult } from '../types';
import { TOTAL_QUESTIONS_PER_GAME } from "../constants";

export const isApiKeyConfigured = (): boolean => {
    return !!process.env.API_KEY;
};

const ai: GoogleGenAI | null = isApiKeyConfigured()
    ? new GoogleGenAI({ apiKey: process.env.API_KEY as string })
    : null;

if (!isApiKeyConfigured()) {
    console.warn(
        "Gemini API key not found. Please set the API_KEY environment variable. The app will show a warning screen."
    );
}

const model = "gemini-2.5-flash";

const grammarSpotterSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sentence: { type: Type.STRING },
            incorrectWord: { type: Type.STRING },
            correctWord: { type: Type.STRING },
            explanation: { type: Type.STRING },
        },
        required: ["sentence", "incorrectWord", "correctWord", "explanation"],
    },
};

const grammarFillSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sentence: { type: Type.STRING, description: "Sentence with '__BLANK__' as a placeholder." },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
        },
        required: ["sentence", "options", "answer", "explanation"],
    },
};

const dialogueSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: { type: Type.STRING },
        lines: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    speaker: { type: Type.STRING },
                    line: { type: Type.STRING },
                },
                required: ["id", "speaker", "line"],
            },
        },
    },
    required: ["scenario", "lines"],
};

const emojiQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        emojis: { type: Type.STRING, description: "A sequence of 3-5 emojis that can be formed into a grammatically correct sentence." },
    },
    required: ["emojis"],
};

const grammarValidationSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: { type: Type.BOOLEAN, description: "True if the sentence is grammatically correct AND accurately represents the emojis." },
        feedback: { type: Type.STRING, description: "A concise, encouraging explanation for the user. If incorrect, explain the grammar error or how it doesn't match the emojis. If correct, praise the user and explain why it's a good sentence." },
        correctExample: { type: Type.STRING, description: "If the user's sentence is incorrect, provide one example of a correct sentence that fits the emojis. Omit this field if the user's sentence is correct." }
    },
    required: ["isCorrect", "feedback"],
};


const generateWithSchema = async <T,>(prompt: string, schema: any): Promise<T> => {
    if (!ai) {
        console.error("Gemini API key not configured. Cannot make API calls.");
        throw new Error("Gemini API key is not configured.");
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate content from Gemini API.");
    }
};

export const generateGrammarSpotterQuestions = (): Promise<GrammarSpotterQuestion[]> => {
    const prompt = `Generate ${TOTAL_QUESTIONS_PER_GAME} unique sentences for English learners. Each sentence must contain one clear grammatical error (tense, subject-verb agreement, or pluralization). For each, provide the sentence, the incorrect word, the correct word, and a brief explanation.`;
    return generateWithSchema<GrammarSpotterQuestion[]>(prompt, grammarSpotterSchema);
};

export const generateGrammarFillQuestions = (): Promise<GrammarFillQuestion[]> => {
    const prompt = `Generate ${TOTAL_QUESTIONS_PER_GAME} unique fill-in-the-blank questions for English learners, focusing on helping verbs, articles, and tenses. For each, provide a sentence with '__BLANK__', four options (one correct, three plausible distractors), the correct answer, and a brief explanation.`;
    return generateWithSchema<GrammarFillQuestion[]>(prompt, grammarFillSchema);
};

export const generateMazeQuestions = (): Promise<GrammarFillQuestion[]> => {
    const prompt = `Generate 15 unique fill-in-the-blank grammar questions for English learners, covering a mix of topics like tenses, prepositions, and articles. For each, provide a sentence with '__BLANK__', four options (one correct, three plausible distractors), the correct answer, and a brief explanation.`;
    return generateWithSchema<GrammarFillQuestion[]>(prompt, grammarFillSchema);
};

export const generatePrepositionDropQuestions = (): Promise<GrammarFillQuestion[]> => {
    const prompt = `Generate ${TOTAL_QUESTIONS_PER_GAME} unique fill-in-the-blank questions for English learners, focusing ONLY on prepositions (e.g., in, on, at, under, over, with). For each, provide a sentence with '__BLANK__', four preposition options (one correct, three distractors), the correct answer, and a brief explanation.`;
    return generateWithSchema<GrammarFillQuestion[]>(prompt, grammarFillSchema);
};

export const generateDialogue = (scenario: string): Promise<Dialogue> => {
    const prompt = `Generate a short, logical dialogue for a '${scenario}' scenario with 5-7 turns. Assign a unique ID to each line starting from 1. The dialogue should be between two distinct speakers.`;
    return generateWithSchema<Dialogue>(prompt, dialogueSchema);
};

export const generateEmojiQuestion = (categoryPrompt: string, level: number): Promise<EmojiQuestion> => {
    const prompt = `
        Generate a single, unique emoji puzzle for an English language learner. The user's goal is to write a complete, grammatically correct sentence based on the emojis.
        The emoji sequence should visually suggest a simple action or scene. Ensure the generated puzzle is different from previous ones.
        
        - Category Hint: "${categoryPrompt}"
        - Difficulty level: ${level}/5.
        - For lower levels (1-2), generate a sequence for a simple sentence (e.g., 🧑‍🍳🎂 or 🐱🏃🏠).
        - For higher levels (4-5), generate a sequence that allows for more complex sentences, possibly involving abstract concepts or multiple clauses (e.g., 👩‍🚀🚀✨🪐 or 🌧️🌱🌷).
        
        The response must only contain the emoji sequence.
    `;
    return generateWithSchema<EmojiQuestion>(prompt, emojiQuestionSchema);
};

export const validateSentenceGrammar = (emojis: string, sentence: string): Promise<GrammarValidationResult> => {
    const prompt = `
        An English language learner was shown an emoji sequence and tasked with writing a grammatically correct sentence that creatively describes it.
        - Emoji Sequence: "${emojis}"
        - User's Sentence: "${sentence}"

        Evaluate the user's sentence based on two criteria:
        1. Grammatical Correctness: Is the sentence grammatically valid in English?
        2. Emoji Representation: Does the sentence logically and creatively represent the emojis? Multiple interpretations are allowed and encouraged.

        The goal is to provide helpful, positive feedback.
        
        - If the sentence is both grammatically correct and a good representation of the emojis, respond with 'isCorrect: true'. The feedback should be encouraging, like "Excellent! That's a perfect sentence for these emojis. Great job with the verb tense!".
        - If the sentence is grammatically incorrect, respond with 'isCorrect: false'. The feedback should gently point out the error without being discouraging, like "You're on the right track! It looks like the verb needs a little adjustment. Try checking the subject-verb agreement.". In this case, YOU MUST also provide a 'correctExample' field with one example of a grammatically correct sentence for the emojis.
        - If the sentence is grammatically correct but does not match the emojis, respond with 'isCorrect: false'. The feedback should acknowledge the correct grammar but guide them back to the emojis, like "That's a grammatically perfect sentence! However, it doesn't seem to match the story in the emojis. Give it another look!". In this case, YOU MUST also provide a 'correctExample' field with a sentence that better matches the emojis.

        Provide your evaluation in the specified JSON format.
    `;
    return generateWithSchema<GrammarValidationResult>(prompt, grammarValidationSchema);
};