"use client";

import type { QuizQuestion as QuizQuestionType } from "@uniflo/mock-data";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionIds: string[];
  onSelectOption: (optionId: string) => void;
  showResult?: boolean;
}

export function QuizQuestionComponent({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionIds,
  onSelectOption,
  showResult = false,
}: QuizQuestionProps) {
  const isMultiple = question.type === "multiple_choice";

  return (
    <div className="max-w-[640px] mx-auto">
      {/* Question label */}
      <p className="text-xs text-[var(--text-secondary)] mb-2">
        Question {questionIndex + 1} of {totalQuestions}
        {isMultiple && " — Select all that apply"}
      </p>

      {/* Question text */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
        {question.question_text}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const isCorrect = option.is_correct;
          const showCorrectness = showResult;

          let borderColor = "var(--border-default)";
          let bgColor = "var(--bg-secondary)";

          if (showCorrectness && isSelected && isCorrect) {
            borderColor = "var(--accent-green)";
            bgColor = "rgba(16, 185, 129, 0.08)";
          } else if (showCorrectness && isSelected && !isCorrect) {
            borderColor = "var(--accent-red)";
            bgColor = "rgba(239, 68, 68, 0.08)";
          } else if (showCorrectness && !isSelected && isCorrect) {
            borderColor = "var(--accent-green)";
            bgColor = "rgba(16, 185, 129, 0.05)";
          } else if (isSelected) {
            borderColor = "var(--accent-blue)";
            bgColor = "rgba(88, 166, 255, 0.08)";
          }

          return (
            <button
              key={option.id}
              onClick={() => !showResult && onSelectOption(option.id)}
              disabled={showResult}
              className="w-full min-h-[48px] p-4 rounded-sm text-left text-sm transition-all border flex items-center gap-3"
              style={{ borderColor, backgroundColor: bgColor }}
            >
              {/* Radio / Checkbox indicator */}
              <span
                className={`shrink-0 w-5 h-5 rounded-${isMultiple ? "sm" : "full"} border-2 flex items-center justify-center`}
                style={{
                  borderColor: isSelected ? "var(--accent-blue)" : "var(--border-default)",
                  backgroundColor: isSelected ? "var(--accent-blue)" : "transparent",
                }}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>

              <span className="text-[var(--text-primary)]">{option.label}</span>

              {showCorrectness && isCorrect && (
                <span className="ml-auto text-xs font-medium text-[var(--accent-green)]">Correct</span>
              )}
              {showCorrectness && isSelected && !isCorrect && (
                <span className="ml-auto text-xs font-medium text-[var(--accent-red)]">Incorrect</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submit) */}
      {showResult && question.explanation && (
        <div
          className="mt-4 p-3 rounded-sm border text-xs italic"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {question.explanation}
        </div>
      )}
    </div>
  );
}
