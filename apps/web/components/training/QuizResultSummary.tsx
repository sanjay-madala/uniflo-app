"use client";

import type { QuizAttempt, Quiz } from "@uniflo/mock-data";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizResultSummaryProps {
  attempt: QuizAttempt;
  quiz: Quiz;
}

export function QuizResultSummary({ attempt, quiz }: QuizResultSummaryProps) {
  const correctCount = attempt.answers.filter((a) => a.correct).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="max-w-[640px] mx-auto">
      {/* Score hero */}
      <div className="text-center py-8">
        <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">
          {attempt.score}%
        </div>
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-sm text-sm font-semibold"
          style={{
            backgroundColor: attempt.passed
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
            color: attempt.passed ? "var(--accent-green)" : "var(--accent-red)",
          }}
        >
          {attempt.passed ? "PASSED" : "FAILED"}
        </div>
        <div className="mt-2 text-sm text-[var(--text-secondary)]">
          {correctCount}/{totalQuestions} correct — Pass threshold: {quiz.pass_threshold}%
        </div>
      </div>

      {/* Question breakdown */}
      <div className="border border-[var(--border-default)] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-default)]" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Question Breakdown</h3>
        </div>
        <div className="divide-y divide-[var(--border-default)]">
          {quiz.questions.map((q, idx) => {
            const answer = attempt.answers.find((a) => a.question_id === q.id);
            const isCorrect = answer?.correct ?? false;

            return (
              <div key={q.id} className="px-4 py-3 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-[var(--accent-green)]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[var(--accent-red)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)]">
                    Q{idx + 1}. {q.question_text}
                  </div>
                  {!isCorrect && quiz.show_correct_answers && (
                    <div className="mt-1">
                      <div className="text-xs text-[var(--accent-red)]">
                        Your answer: {q.options.filter((o) => answer?.selected_option_ids.includes(o.id)).map((o) => o.label).join(", ") || "No answer"}
                      </div>
                      <div className="text-xs text-[var(--accent-green)]">
                        Correct: {q.options.filter((o) => o.is_correct).map((o) => o.label).join(", ")}
                      </div>
                      {q.explanation && (
                        <div className="mt-1 text-xs italic text-[var(--text-secondary)]">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
