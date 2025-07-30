
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameComponentProps, PlayerProgress, CategoryInfo, EmojiQuestion, GameCategory, GrammarValidationResult } from '../../types';
import { EMOJI_CATEGORIES, MAX_LEVELS_PER_CATEGORY, POINTS_PER_LEVEL } from '../../constants';
import { generateEmojiQuestion, validateSentenceGrammar } from '../../services/geminiService';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

const INITIAL_PROGRESS: PlayerProgress = {
    completedLevels: {},
    scores: {},
    totalScore: 0,
    hintsUsed: {},
};

const LOCAL_STORAGE_KEY = 'emojiGuessChallengeProgress';

const FeedbackModal: React.FC<{
    isCorrect: boolean;
    feedbackText: string;
    correctExample?: string;
    onNext: () => void;
    onTryAgain: () => void;
    onBackToLevels: () => void;
}> = ({ isCorrect, feedbackText, correctExample, onNext, onTryAgain, onBackToLevels }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className={`bg-slate-800 p-8 rounded-lg max-w-lg w-full border-t-4 ${isCorrect ? 'border-green-500' : 'border-red-500'} text-center`}>
            <h2 className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✅ Excellent!' : '🤔 Let\'s Review!'}
            </h2>
             <div className="bg-slate-900/50 p-4 rounded-md mb-6 text-left">
                <p className="font-semibold text-cyan-300 mb-1">Feedback</p>
                <p className="text-slate-300">{feedbackText}</p>
                 {!isCorrect && correctExample && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="font-semibold text-amber-300 mb-1">Here's one possible answer:</p>
                        <p className="text-slate-300 italic">"{correctExample}"</p>
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-4">
                 {isCorrect ? (
                    <>
                        <Button onClick={onBackToLevels} variant="secondary">Back to Levels</Button>
                        <Button onClick={onNext} variant="primary">Next Level</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={onBackToLevels} variant="secondary">Change Level</Button>
                        <Button onClick={onTryAgain} variant="primary">Try Again</Button>
                    </>
                )}
            </div>
        </div>
    </div>
);


export const EmojiGuessChallenge: React.FC<GameComponentProps> = ({ onBack, onGameComplete }) => {
    const [progress, setProgress] = useState<PlayerProgress>(INITIAL_PROGRESS);
    const [view, setView] = useState<'categories' | 'levels' | 'game'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    
    const [currentQuestion, setCurrentQuestion] = useState<EmojiQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidaing, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [correctExample, setCorrectExample] = useState('');
    
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedProgress) {
                setProgress(JSON.parse(savedProgress));
            }
        } catch (e) {
            console.error("Failed to parse progress from localStorage", e);
            setProgress(INITIAL_PROGRESS);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    }, [progress]);

    const fetchQuestion = useCallback(async (category: CategoryInfo, level: number) => {
        setIsLoading(true);
        setError(null);
        setCurrentQuestion(null);
        try {
            const questionData = await generateEmojiQuestion(category.prompt, level);
            setCurrentQuestion(questionData);
        } catch (err) {
            setError("Oops! Couldn't generate a question. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectCategory = (category: CategoryInfo) => {
        setSelectedCategory(category);
        setView('levels');
    };

    const handleSelectLevel = (level: number) => {
        if (!selectedCategory) return;
        setSelectedLevel(level);
        setUserAnswer('');
        setIsAnswered(false);
        setFeedbackText('');
        setCorrectExample('');
        setView('game');
        fetchQuestion(selectedCategory, level);
    };
    
    const handleSubmit = async () => {
        if (!userAnswer || !currentQuestion || isValidaing) return;
        
        setIsValidating(true);
        setError(null);

        try {
            const validationResult = await validateSentenceGrammar(currentQuestion.emojis, userAnswer);
            
            setIsCorrect(validationResult.isCorrect);
            setFeedbackText(validationResult.feedback);
            setCorrectExample(validationResult.correctExample || '');
            setIsAnswered(true);

            if (validationResult.isCorrect && selectedCategory && selectedLevel) {
                const categoryId = selectedCategory.id;
                const currentCompleted = progress.completedLevels[categoryId] || 0;
                
                if (selectedLevel > currentCompleted) {
                     setProgress(prev => {
                        const newScore = (prev.scores[categoryId] || 0) + POINTS_PER_LEVEL;
                        onGameComplete?.(POINTS_PER_LEVEL);
                        return {
                            ...prev,
                            completedLevels: { ...prev.completedLevels, [categoryId]: selectedLevel },
                            scores: { ...prev.scores, [categoryId]: newScore },
                            totalScore: prev.totalScore + POINTS_PER_LEVEL,
                        };
                    });
                }
            }

        } catch (err) {
            console.error("Validation API call failed:", err);
            setError("Sorry, we couldn't check your answer right now. Please try again.");
            setFeedbackText("An error occurred while validating your answer.");
            setIsAnswered(true);
            setIsCorrect(false);
        } finally {
            setIsValidating(false);
        }
    };

    const handleNextLevel = () => {
        if (selectedLevel && selectedLevel < MAX_LEVELS_PER_CATEGORY) {
            handleSelectLevel(selectedLevel + 1);
        } else {
            setView('levels');
        }
    };
    
    const handleTryAgain = () => {
        setIsAnswered(false);
        setFeedbackText('');
        setCorrectExample('');
    };
    
    const backToCategories = () => {
        setSelectedCategory(null);
        setView('categories');
    };
    
    const backToLevels = () => {
        setCurrentQuestion(null);
        setView('levels');
    };

    // Category View
    if (view === 'categories') {
        return (
            <div className="animate-fade-in">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <Button onClick={onBack} variant="secondary" className="inline-flex items-center gap-2 mb-2">
                           <ArrowLeftIcon className="w-5 h-5" /> Back to Menu
                        </Button>
                        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Emoji Guess Challenge</h1>
                        <p className="text-slate-400">Convert emoji sequences into grammatically correct sentences.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 uppercase">Total Score</p>
                        <p className="text-3xl font-bold text-yellow-400">{progress.totalScore}</p>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {EMOJI_CATEGORIES.map(cat => {
                         const completed = progress.completedLevels[cat.id] || 0;
                         const progressPercent = (completed / MAX_LEVELS_PER_CATEGORY) * 100;
                         return (
                            <div key={cat.id} onClick={() => handleSelectCategory(cat)} className="category-card p-6 rounded-lg border border-slate-700 cursor-pointer transition-all duration-300 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-2xl font-bold mb-1 text-white">{cat.title}</h2>
                                    <p className="text-5xl">{cat.emoji}</p>
                                </div>
                                <p className="text-slate-400 mb-4 flex-grow">{cat.description}</p>
                                <div className="mt-auto">
                                    <p className="text-sm text-slate-400">{completed} / {MAX_LEVELS_PER_CATEGORY} Levels Completed</p>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${progressPercent}%`}}></div>
                                    </div>
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>
        );
    }
    
    // Level View
    if (view === 'levels' && selectedCategory) {
        const completedCount = progress.completedLevels[selectedCategory.id] || 0;
        return (
            <div className="animate-fade-in">
                <header className="mb-8">
                    <Button onClick={backToCategories} variant="secondary" className="inline-flex items-center gap-2 mb-4">
                        <ArrowLeftIcon className="w-5 h-5" /> Back to Categories
                    </Button>
                    <div className="flex items-center gap-4">
                        <p className="text-6xl">{selectedCategory.emoji}</p>
                        <div>
                            <h1 className="text-4xl font-bold text-cyan-400">{selectedCategory.title}</h1>
                            <p className="text-slate-400">Score: {progress.scores[selectedCategory.id] || 0}</p>
                        </div>
                    </div>
                </header>
                <div className="grid grid-cols-5 gap-4">
                    {Array.from({ length: MAX_LEVELS_PER_CATEGORY }, (_, i) => i + 1).map(level => {
                        const isCompleted = level <= completedCount;
                        const isUnlocked = level <= completedCount + 1;
                        
                        let levelClass = 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60';
                        if (isUnlocked) levelClass = 'bg-cyan-600 text-white level-btn-unlocked transition-all duration-200';
                        if (isCompleted) levelClass = 'bg-green-600 text-white';

                        return (
                            <button key={level} onClick={() => isUnlocked && handleSelectLevel(level)} disabled={!isUnlocked} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg text-2xl font-bold flex items-center justify-center relative ${levelClass}`}>
                                {isCompleted ? '✓' : level}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Game View
    if (view === 'game' && selectedCategory && selectedLevel) {
        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                 {isAnswered && (
                    <FeedbackModal 
                        isCorrect={isCorrect} 
                        feedbackText={feedbackText} 
                        correctExample={correctExample}
                        onNext={handleNextLevel} 
                        onBackToLevels={backToLevels}
                        onTryAgain={handleTryAgain}
                    />
                )}
                <Button onClick={backToLevels} variant="secondary" className="inline-flex items-center gap-2 mb-4">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Levels
                </Button>
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-cyan-400">{selectedCategory.title}: Level {selectedLevel}</h2>
                        <div className="text-right">
                             <p className="text-sm text-slate-400">Task</p>
                             <p className="text-lg font-bold text-yellow-300">Write a sentence</p>
                        </div>
                    </header>
                    {isLoading && <LoadingSpinner message="Generating your challenge..." />}
                    {error && !isAnswered && <p className="text-red-400 text-center">{error}</p>}
                    {currentQuestion && (
                        <div className="text-center">
                            <div className="bg-slate-900 p-6 rounded-lg mb-6">
                                <p className="text-5xl md:text-6xl tracking-widest">{currentQuestion.emojis}</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your creative sentence here..."
                                    disabled={isAnswered || isValidaing}
                                    className={`w-full p-4 bg-slate-700 text-white text-lg rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all border-slate-600`}
                                />
                                <div className="flex gap-4 mt-6 justify-center">
                                    <Button type="submit" variant="primary" disabled={isAnswered || !userAnswer || isValidaing} className="min-w-[160px]">
                                        {isValidaing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Checking...</span>
                                            </span>
                                        ) : (
                                            'Check Sentence'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
};