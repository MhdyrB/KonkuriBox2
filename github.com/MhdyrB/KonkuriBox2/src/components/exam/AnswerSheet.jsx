import React from 'react';
import { getOptionLabels, toPersianNum } from '@/lib/examUtils';

export default function AnswerSheet({ questions, answers, onAnswer, optionCount, optionReversed, mandatory, readOnly, correctAnswers }) {
  const options = getOptionLabels(optionCount, optionReversed);

  return (
    <div className="space-y-1">
      {questions.map((qNum) => {
        const selected = answers[qNum];
        const correct = correctAnswers ? correctAnswers[qNum] : null;
        const isCorrect = correct && selected === correct;
        const isWrong = correct && selected && selected !== correct;

        return (
          <div
            key={qNum}
            className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-colors ${
              isCorrect ? 'bg-green-500/10' : isWrong ? 'bg-red-500/10' : selected ? 'bg-primary/5' : ''
            }`}
          >
            <span className="w-8 text-sm font-bold text-muted-foreground shrink-0">
              {toPersianNum(qNum)}
            </span>
            <div className="flex gap-2 flex-1" dir="ltr">
              {options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrectOpt = correct === opt;

                let btnClass = 'w-10 h-10 rounded-xl text-sm font-bold transition-all border-2 ';
                if (readOnly && correctAnswers) {
                  if (isCorrectOpt) {
                    btnClass += 'bg-green-500 border-green-500 text-white';
                  } else if (isSelected && !isCorrectOpt) {
                    btnClass += 'bg-red-500 border-red-500 text-white';
                  } else {
                    btnClass += 'border-border text-muted-foreground';
                  }
                } else if (isSelected) {
                  btnClass += 'bg-primary border-primary text-primary-foreground scale-105';
                } else {
                  btnClass += 'border-border text-muted-foreground hover:border-primary/50 active:scale-95';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (readOnly) return;
                      onAnswer(qNum, isSelected ? null : opt);
                    }}
                    disabled={readOnly}
                    className={btnClass}
                  >
                    {toPersianNum(opt)}
                  </button>
                );
              })}
            </div>
            {readOnly && correctAnswers && (
              <span className="text-xs shrink-0">
                {!selected ? (
                  <span className="text-muted-foreground">نزده</span>
                ) : isCorrect ? (
                  <span className="text-green-600 dark:text-green-400">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}