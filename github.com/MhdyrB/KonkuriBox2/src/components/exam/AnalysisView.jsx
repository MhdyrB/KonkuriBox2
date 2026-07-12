import React from 'react';
import { calculateScore, toPersianNum, getOptionLabels } from '@/lib/examUtils';

export default function AnalysisView({ exam }) {
  const { answers, correctAnswers, negativeMarking, optionCount, subjects, optionReversed } = exam;
  const questions = Object.keys(correctAnswers).map(Number).sort((a, b) => a - b);
  const overall = calculateScore(answers, correctAnswers, negativeMarking, optionCount);
  const overallNoNeg = calculateScore(answers, correctAnswers, false, optionCount);
  const options = getOptionLabels(optionCount, optionReversed);

  // Per-subject analysis
  const subjectStats = [];
  if (subjects && subjects.length > 0) {
    subjects.forEach(sub => {
      const subCorrectAnswers = {};
      for (let i = sub.from; i <= sub.to; i++) {
        if (correctAnswers[i] !== undefined) subCorrectAnswers[i] = correctAnswers[i];
      }
      const stats = calculateScore(answers, subCorrectAnswers, negativeMarking, optionCount);
      const statsNoNeg = calculateScore(answers, subCorrectAnswers, false, optionCount);
      subjectStats.push({ name: sub.name, stats, statsNoNeg });
    });
  }

  const StatBox = ({ label, value, sub }) => (
    <div className="bg-muted/50 rounded-xl p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div>
        <h3 className="font-bold text-base mb-3">نتیجه کلی</h3>
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="درست" value={toPersianNum(overall.correct)} />
          <StatBox label="غلط" value={toPersianNum(overall.wrong)} />
          <StatBox label="نزده" value={toPersianNum(overall.blank)} />
          <StatBox label="کل" value={toPersianNum(overall.total)} />
        </div>
      </div>

      {/* Percentage */}
      <div className="bg-card border rounded-2xl p-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {toPersianNum(overall.percentage.toFixed(1))}٪
          </div>
          <div className="text-sm text-muted-foreground">
            {negativeMarking ? 'با نمره منفی' : 'درصد کل'}
          </div>
          {negativeMarking && (
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">بدون نمره منفی: </span>
              <span className="font-bold">{toPersianNum(overall.percentageNoNeg.toFixed(1))}٪</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, overall.percentage)}%` }}
          />
        </div>
      </div>

      {/* Subject Stats */}
      {subjectStats.length > 0 && (
        <div>
          <h3 className="font-bold text-base mb-3">درصد به تفکیک درس</h3>
          <div className="space-y-2">
            {subjectStats.map((sub, i) => (
              <div key={i} className="bg-card border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{sub.name}</span>
                  <span className="font-bold text-primary">
                    {toPersianNum(sub.stats.percentage.toFixed(1))}٪
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, sub.stats.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                  <span>درست: {toPersianNum(sub.stats.correct)}</span>
                  <span>غلط: {toPersianNum(sub.stats.wrong)}</span>
                  <span>نزده: {toPersianNum(sub.stats.blank)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Key Legend */}
      <div>
        <h3 className="font-bold text-base mb-3">راهنمای رنگها</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>پاسخ صحیح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>پاسخ غلط شما</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">نزده = بدون پاسخ</span>
          </div>
        </div>
      </div>

      {/* Detailed answers */}
      <div>
        <h3 className="font-bold text-base mb-3">جزئیات پاسخها</h3>
        <div className="space-y-1">
          {questions.map(qNum => {
            const userAns = answers[qNum];
            const correctAns = correctAnswers[qNum];
            const isCorrect = userAns === correctAns;
            const isBlank = !userAns;

            return (
              <div key={qNum} className={`flex items-center gap-3 py-2 px-3 rounded-xl text-sm ${
                isBlank ? '' : isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <span className="w-8 font-bold text-muted-foreground">{toPersianNum(qNum)}</span>
                <div className="flex gap-2 flex-1" dir="ltr">
                  {options.map(opt => {
                    let cls = 'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ';
                    if (opt === correctAns) cls += 'bg-green-500 text-white ';
                    else if (opt === userAns && !isCorrect) cls += 'bg-red-500 text-white ';
                    else cls += 'bg-muted text-muted-foreground ';
                    return <div key={opt} className={cls}>{toPersianNum(opt)}</div>;
                  })}
                </div>
                <span className="text-xs shrink-0">
                  {isBlank ? <span className="text-muted-foreground">نزده</span>
                    : isCorrect ? <span className="text-green-600 dark:text-green-400">✓</span>
                    : <span className="text-red-500">✗</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}