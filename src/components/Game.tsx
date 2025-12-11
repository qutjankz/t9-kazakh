import React, { useState } from 'react';
import { Dictionary } from '../types';
import './Game.css';

type GameState = 'start' | 'playing' | 'results';

interface Question {
    word: string;
    isCorrect: boolean;
}

interface Props {
    dictionary: Dictionary;
}

const Game: React.FC<Props> = ({ dictionary }) => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const generateQuestions = () => {
        const allWords: Question[] = [];

        // Add incorrect words from dictionary
        Object.keys(dictionary).forEach(incorrectWord => {
            allWords.push({ word: incorrectWord, isCorrect: false });
        });

        // Add correct words from dictionary
        Object.values(dictionary).forEach(correctWord => {
            allWords.push({ word: correctWord, isCorrect: true });
        });

        // Shuffle and take 10 questions
        const shuffled = allWords.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 10);
    };

    const startGame = () => {
        const newQuestions = generateQuestions();
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers([]);
        setGameState('playing');
    };

    const handleAnswer = (userAnswer: boolean) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrectAnswer = userAnswer === currentQuestion.isCorrect;

        if (isCorrectAnswer) {
            setScore(score + 1);
        }

        setAnswers([...answers, isCorrectAnswer]);

        // Move to next question or show results
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setGameState('results');
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const percentage = gameState === 'results' ? Math.round((score / questions.length) * 100) : 0;

    return (
        <div className="game-root">
            {gameState === 'start' && (
                <div className="game-start">
                    <h1 className="game-title">🎮 Ойын</h1>
                    <p className="game-description">
                        Сөздердің дұрыс немесе қате жазылғанын анықтаңыз
                    </p>
                    <button className="game-start-btn" onClick={startGame}>
                        Бастау
                    </button>
                </div>
            )}

            {gameState === 'playing' && currentQuestion && (
                <div className="game-playing">
                    <div className="game-progress">
                        Сұрақ {currentQuestionIndex + 1} / {questions.length}
                    </div>

                    <div className="game-word-display">
                        {currentQuestion.word}
                    </div>

                    <div className="game-question">
                        Бұл сөз дұрыс жазылған ба?
                    </div>

                    <div className="game-buttons">
                        <button
                            className="game-btn game-btn-correct"
                            onClick={() => handleAnswer(true)}
                        >
                            Дұрыс
                        </button>
                        <button
                            className="game-btn game-btn-incorrect"
                            onClick={() => handleAnswer(false)}
                        >
                            Қате
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'results' && (
                <div className="game-results">
                    <h2 className="results-title">🎉 Нәтижелер</h2>

                    <div className="results-stats">
                        <div className="stat-item">
                            <div className="stat-label">Жалпы сұрақтар:</div>
                            <div className="stat-value">{questions.length}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Дұрыс жауаптар:</div>
                            <div className="stat-value correct">{score}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Қате жауаптар:</div>
                            <div className="stat-value incorrect">{questions.length - score}</div>
                        </div>
                        <div className="stat-item highlight">
                            <div className="stat-label">Нәтиже:</div>
                            <div className="stat-value">{percentage}%</div>
                        </div>
                    </div>

                    {questions.length - score > 0 && (
                        <div className="errors-section">
                            <h3 className="errors-title">❌ Қателер:</h3>
                            <div className="errors-list">
                                {questions.map((question, index) => {
                                    if (!answers[index]) {
                                        return (
                                            <div key={index} className="error-item">
                                                <div className="error-word">{question.word}</div>
                                                <div className="error-info">
                                                    {question.isCorrect ? (
                                                        <span className="error-label correct-label">Дұрыс жазылған</span>
                                                    ) : (
                                                        <>
                                                            <span className="error-label incorrect-label">Қате жазылған</span>
                                                            <span className="error-correction"> → {dictionary[question.word]}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}

                    <button className="game-restart-btn" onClick={startGame}>
                        Қайта бастау
                    </button>
                </div>
            )}
        </div>
    );
};

export default Game;
