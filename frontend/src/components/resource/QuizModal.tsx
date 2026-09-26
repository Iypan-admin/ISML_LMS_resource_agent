"use client";

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/discovery';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Award, 
  Eye, 
  EyeOff, 
  RotateCcw,
  PlusCircle
} from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  language: string;
  level: string;
  skill: string;
  topic?: string;
  questions: QuizQuestion[];
  onSaveToQueue?: () => void;
  isSaved?: boolean;
}

export default function QuizModal({
  isOpen,
  onClose,
  title,
  language,
  level,
  skill,
  topic,
  questions,
  onSaveToQueue,
  isSaved = false,
}: QuizModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, option: string) => {
    if (showResults) return; // Freeze once submitted
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) {
        score++;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
  };

  const handleCopyQuiz = () => {
    let text = `====================================\n`;
    text += `📖 QUIZ & ASSIGNMENT: ${title}\n`;
    text += `Target Language: ${language} | Level: ${level} | Skill: ${skill}\n`;
    if (topic) text += `Topic: ${topic}\n`;
    text += `====================================\n\n`;

    questions.forEach((q, idx) => {
      text += `Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        text += `   [${letter}] ${opt}\n`;
      });
      text += `\n✓ Correct Answer: ${q.answer}\n`;
      if (q.explanation) {
        text += `💡 Explanation: ${q.explanation}\n`;
      }
      text += `\n------------------------------------\n`;
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0B2447] to-[#19376D] text-white flex items-start justify-between gap-4 relative">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-bold">
                {language}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold">
                Level {level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[11px] font-bold">
                {skill}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Interactive Assignment
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{title}</h2>
            {topic && (
              <p className="text-xs text-blue-200/80 font-medium">
                Topic: <strong className="text-white">{topic}</strong>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#0052CC]" /> {questions.length} Questions
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              Answered: <strong className="text-slate-800">{answeredCount}/{questions.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {showAnswerKey ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" /> Hide Answer Key
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#0052CC]" /> Reveal Answer Key
                </>
              )}
            </button>

            <button
              onClick={handleCopyQuiz}
              className="px-3 py-1.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Quiz & Answers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Score Banner if Submitted */}
        {showResults && (
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Quiz Completed!</h4>
                <p className="text-xs text-emerald-100 font-medium">
                  You scored <strong>{score} out of {questions.length}</strong> ({percentage}%)
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
            </button>
          </div>
        )}

        {/* Questions Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {questions.map((q, qIdx) => {
            const userChoice = selectedAnswers[q.id];
            const isCorrect = userChoice === q.answer;

            return (
              <div 
                key={q.id || `q-${qIdx}`} 
                className={`p-5 rounded-2xl border transition-all ${
                  showResults
                    ? isCorrect
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-rose-50/60 border-rose-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#0052CC]/10 text-[#0052CC] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-sm font-extrabold text-[#0B2447] leading-relaxed">
                      {q.question}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isSelected = userChoice === opt;
                        const isAnswer = q.answer === opt;

                        let buttonStyle = "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300";

                        if (showResults || showAnswerKey) {
                          if (isAnswer) {
                            buttonStyle = "border-emerald-500 bg-emerald-500 text-white font-extrabold shadow-sm";
                          } else if (isSelected && !isAnswer) {
                            buttonStyle = "border-rose-500 bg-rose-500 text-white font-extrabold";
                          } else {
                            buttonStyle = "border-slate-200 bg-slate-100 text-slate-400 opacity-60";
                          }
                        } else if (isSelected) {
                          buttonStyle = "border-[#0052CC] bg-[#0052CC] text-white font-extrabold shadow-sm";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, opt)}
                            disabled={showResults}
                            className={`p-3 rounded-xl border text-xs text-left font-medium transition-all flex items-center gap-2.5 cursor-pointer ${buttonStyle}`}
                          >
                            <span className={`w-5 h-5 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${
                              (showResults || showAnswerKey) && isAnswer
                                ? 'bg-white/30 text-white'
                                : isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {(showResults || showAnswerKey) && isAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                            )}
                            {showResults && isSelected && !isAnswer && (
                              <XCircle className="w-4 h-4 text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Callout */}
                    {(showResults || showAnswerKey) && (
                      <div className="mt-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs space-y-1 animate-fade-in">
                        <div className="flex items-center gap-1.5 text-[#0052CC] font-extrabold">
                          <HelpCircle className="w-4 h-4" /> Explanation & Solution Key:
                        </div>
                        <p className="text-slate-700 font-medium">
                          <strong>Correct Answer:</strong> {q.answer}
                        </p>
                        {q.explanation && (
                          <p className="text-slate-600 font-normal">{q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={answeredCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Answers & Score
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            )}
          </div>

          {onSaveToQueue && (
            <button
              onClick={onSaveToQueue}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                isSaved 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-[#0052CC] hover:bg-blue-700 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved to Review Queue
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Save Quiz to Resource Library
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
