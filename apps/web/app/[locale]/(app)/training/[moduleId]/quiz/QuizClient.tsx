"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  trainingModules,
  trainingQuizzes,
} from "@uniflo/mock-data";
import type {
  TrainingModule,
  Quiz,
  QuizAttempt,
} from "@uniflo/mock-data";
import { Button } from "@uniflo/ui";
import { ArrowLeft, ArrowRight, X, CheckCircle, AlertTriangle } from "lucide-react";
import { QuizQuestionComponent } from "@/components/training/QuizQuestion";
import { QuizProgressBar } from "@/components/training/QuizProgressBar";
import { QuizResultSummary } from "@/components/training/QuizResultSummary";

const CURRENT_USER = "user_001";

export default function QuizClient() {
  const { locale, moduleId } = useParams<{ locale: string; moduleId: string }>();

  const module = (trainingModules as TrainingModule[]).find((m) => m.id === moduleId);
  const quiz = module?.quiz_id
    ? (trainingQuizzes as Quiz[]).find((q) => q.id === module.quiz_id)
    : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showReview, setShowReview] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz?.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );

  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || quizResult) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, quizResult]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeRemaining === 0 && !quizResult) {
      handleSubmit();
    }
  }, [timeRemaining, quizResult]);

  function handleSelectOption(optionId: string) {
    if (!currentQuestion || quizResult) return;

    const isMultiple = currentQuestion.type === "multiple_choice";
    setAnswers((prev) => {
      const current = prev[currentQuestion.id] ?? [];
      if (isMultiple) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [currentQuestion.id]: next };
      }
      return { ...prev, [currentQuestion.id]: [optionId] };
    });
  }

  function handleSubmit() {
    if (!quiz) return;

    const attemptAnswers = quiz.questions.map((q) => {
      const selected = answers[q.id] ?? [];
      const correctIds = q.options.filter((o) => o.is_correct).map((o) => o.id);
      const isCorrect =
        selected.length === correctIds.length &&
        selected.every((id) => correctIds.includes(id));
      return {
        question_id: q.id,
        selected_option_ids: selected,
        correct: isCorrect,
        points_earned: isCorrect ? q.points : 0,
      };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = attemptAnswers.reduce((sum, a) => sum + a.points_earned, 0);
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const attempt: QuizAttempt = {
      id: `qa_new_${Date.now()}`,
      quiz_id: quiz.id,
      user_id: CURRENT_USER,
      answers: attemptAnswers,
      score,
      passed: score >= quiz.pass_threshold,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      attempt_number: 1,
    };

    setQuizResult(attempt);
    setShowReview(false);
  }

  if (!module || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Quiz not found</h2>
        <Link href={`/${locale}/training/`}>
          <Button variant="secondary">Back to Training Library</Button>
        </Link>
      </div>
    );
  }

  // Result view
  if (quizResult) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)]">
          <Link
            href={`/${locale}/training/${moduleId}/`}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Module
          </Link>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {quiz.title}
          </span>
          <Link href={`/${locale}/training/${moduleId}/`}>
            <X className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          </Link>
        </div>

        <div className="flex-1 p-6">
          {/* CSS confetti for pass */}
          {quizResult.passed && (
            <div className="text-center mb-4 text-4xl motion-reduce:hidden" aria-hidden="true">
              🎉
            </div>
          )}

          <QuizResultSummary attempt={quizResult} quiz={quiz} />

          <div className="flex items-center justify-center gap-3 mt-8">
            {quizResult.passed && (
              <Link href={`/${locale}/training/${moduleId}/certificate/`}>
                <Button size="sm">View Certificate</Button>
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuizResult(null);
                setAnswers({});
                setCurrentIndex(0);
                setShowReview(false);
                setTimeRemaining(quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null);
              }}
            >
              Retake Quiz
            </Button>
            <Link href={`/${locale}/training/${moduleId}/`}>
              <Button variant="secondary" size="sm">Back to Module</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Review view
  if (showReview) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)]">
          <Link
            href={`/${locale}/training/${moduleId}/`}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Module
          </Link>
          <span className="text-sm font-medium text-[var(--text-primary)]">{quiz.title}</span>
          <Link href={`/${locale}/training/${moduleId}/`}>
            <X className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          </Link>
        </div>

        <div className="flex-1 p-6 max-w-[640px] mx-auto w-full">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Review Your Answers</h2>

          <div className="border border-[var(--border-default)] rounded-sm divide-y divide-[var(--border-default)]">
            {questions.map((q, idx) => {
              const answered = answers[q.id] && answers[q.id].length > 0;
              const selectedLabels = answered
                ? q.options.filter((o) => answers[q.id].includes(o.id)).map((o) => o.label).join(", ")
                : null;

              return (
                <div key={q.id} className="p-3 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {answered ? (
                      <CheckCircle className="h-4 w-4 text-[var(--accent-green)]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" style={{ color: "var(--accent-yellow, #EAB308)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">
                      Q{idx + 1}. {q.question_text}
                    </p>
                    {answered ? (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Your answer: {selectedLabels}
                      </p>
                    ) : (
                      <button
                        onClick={() => { setCurrentIndex(idx); setShowReview(false); }}
                        className="text-xs text-[var(--accent-blue)] mt-1 hover:underline"
                      >
                        Answer this question
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            Answered: {answeredCount}/{questions.length}
            {answeredCount < questions.length && (
              <span className="ml-2" style={{ color: "var(--accent-yellow, #EAB308)" }}>
                Unanswered: {questions.length - answeredCount}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button variant="secondary" size="sm" onClick={() => setShowReview(false)}>
              <ArrowLeft className="h-4 w-4" /> Back to Questions
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={answeredCount === 0}>
              Submit Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Question view
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)]">
        <Link
          href={`/${locale}/training/${moduleId}/`}
          className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Module
        </Link>
        <span className="text-sm font-medium text-[var(--text-primary)]">{quiz.title}</span>
        <Link href={`/${locale}/training/${moduleId}/`}>
          <X className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        </Link>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <QuizProgressBar
          current={currentIndex}
          total={questions.length}
          timeRemaining={timeRemaining}
        />
      </div>

      {/* Question */}
      <div className="flex-1 p-6">
        {currentQuestion && (
          <QuizQuestionComponent
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOptionIds={answers[currentQuestion.id] ?? []}
            onSelectOption={handleSelectOption}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between max-w-[640px] mx-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>

          {isLastQuestion ? (
            <Button size="sm" onClick={() => setShowReview(true)}>
              Review & Submit
            </Button>
          ) : (
            <Button
              variant={answers[currentQuestion?.id]?.length ? "default" : "secondary"}
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] && answers[q.id].length > 0;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className="rounded-full transition-all"
                style={{
                  width: isCurrent ? 10 : 8,
                  height: isCurrent ? 10 : 8,
                  backgroundColor: isAnswered || isCurrent ? "var(--accent-blue)" : "transparent",
                  border: isAnswered || isCurrent
                    ? "2px solid var(--accent-blue)"
                    : "2px solid var(--border-default)",
                  boxShadow: isCurrent ? "0 0 0 2px rgba(88, 166, 255, 0.3)" : "none",
                }}
                aria-label={`Go to question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
