import { GameCardData, GameType, CategoryInfo, GameCategory } from './types';
import { TargetIcon } from './components/icons/TargetIcon';
import { PuzzleIcon } from './components/icons/PuzzleIcon';
import { DragDropIcon } from './components/icons/DragDropIcon';
import { MazeIcon } from './components/icons/MazeIcon';
import { DialogueIcon } from './components/icons/DialogueIcon';
import { LeaderboardIcon } from './components/icons/LeaderboardIcon';
import { EmojiIcon } from './components/icons/EmojiIcon';

export const GAME_CARDS: GameCardData[] = [
    {
        id: GameType.GrammarSpotter,
        title: "Grammar Spotter",
        description: "Find the grammatical error in the sentence. Tap the incorrect word to score points.",
        Icon: TargetIcon,
    },
    {
        id: GameType.GrammarFill,
        title: "Grammar Fill",
        description: "Complete the sentence by choosing the correct word from multiple options.",
        Icon: PuzzleIcon,
    },
    {
        id: GameType.PrepositionDrop,
        title: "Preposition Drop",
        description: "Drag and drop the correct preposition to complete the sentence.",
        Icon: DragDropIcon,
    },
    {
        id: GameType.GrammarMaze,
        title: "Grammar Maze",
        description: "Navigate a maze by answering grammar questions to unlock doors and find the exit.",
        Icon: MazeIcon,
    },
    {
        id: GameType.DialogueBuilder,
        title: "Dialogue Builder",
        description: "Reconstruct a scrambled conversation by arranging the dialogue in the correct order.",
        Icon: DialogueIcon,
    },
    {
        id: GameType.EmojiGuessChallenge,
        title: "Emoji Guess Challenge",
        description: "Decode emoji sequences to learn grammar concepts, tenses, idioms, and more.",
        Icon: EmojiIcon,
    },
    {
        id: GameType.Leaderboard,
        title: "Leaderboard",
        description: "See who's at the top of the Grammar Galaxy. Scores reset weekly!",
        Icon: LeaderboardIcon,
    }
];

export const TOTAL_QUESTIONS_PER_GAME = 5;

export const EMOJI_CATEGORIES: CategoryInfo[] = [
    {
        id: GameCategory.Tenses,
        title: "Tenses",
        emoji: "🕒",
        description: "Past, present, future. Master the timeline of actions.",
        prompt: "Create an emoji puzzle representing a specific English verb tense (e.g., past simple, present continuous, future perfect)."
    },
    {
        id: GameCategory.PartsOfSpeech,
        title: "Parts of Speech",
        emoji: "🧩",
        description: "Nouns, verbs, adjectives... The building blocks of language.",
        prompt: "Create an emoji puzzle representing a specific part of speech (noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection)."
    },
    {
        id: GameCategory.Punctuation,
        title: "Punctuation",
        emoji: "📍",
        description: "Commas, periods, question marks. The traffic signs of writing.",
        prompt: "Create an emoji puzzle representing a specific punctuation mark or its usage."
    },
    {
        id: GameCategory.IdiomsAndPhrases,
        title: "Idioms & Phrases",
        emoji: "🗣️",
        description: "Raining cats and dogs? Break a leg! Understand quirky expressions.",
        prompt: "Create an emoji puzzle representing a common English idiom or phrase."
    },
    {
        id: GameCategory.SentenceStructures,
        title: "Sentence Structures",
        emoji: "🏗️",
        description: "Simple, compound, complex. Build better sentences.",
        prompt: "Create an emoji puzzle representing a type of sentence structure (simple, compound, complex) or a grammatical concept like subject-verb agreement."
    },
];

export const MAX_LEVELS_PER_CATEGORY = 5;
export const HINTS_PER_CATEGORY = 3;
export const POINTS_PER_LEVEL = 10;