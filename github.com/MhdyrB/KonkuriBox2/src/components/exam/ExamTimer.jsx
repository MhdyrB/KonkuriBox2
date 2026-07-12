import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/lib/examUtils';
import { storageSet, storageGet } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ExamTimer({ exam, onExamUpdate, onTimeUp }) {
  const [timeRemaining, setTimeRemaining] = useState(exam.timeRemaining);
  const [showAlert, setShowAlert] = useState(false);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (timeRemaining === null || timeRemaining === undefined) return;
    if (exam.phase !== 'answer') return;

    lastTickRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      setTimeRemaining(prev => {
        const next = Math.max(0, prev - elapsed);
        // Auto-save timer state
        storageGet('kb_active_exam').then(e => {
          if (e) storageSet('kb_active_exam', { ...e, timeRemaining: next });
        });
        if (next <= 0) {
          clearInterval(intervalRef.current);
          setShowAlert(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [exam.phase]);

  // Recover time on mount (handles page close/reopen)
  useEffect(() => {
    if (!exam.timerStartedAt || timeRemaining === null) return;
    const elapsed = Math.floor((Date.now() - new Date(exam.timerStartedAt).getTime()) / 1000);
    const totalTime = exam.timeSeconds || exam.timeRemaining;
    const remaining = Math.max(0, totalTime - elapsed);
    setTimeRemaining(remaining);
    if (remaining <= 0) setShowAlert(true);
  }, []);

  const handleAddTime = () => {
    setTimeRemaining(prev => prev + 300); // 5 minutes
    setShowAlert(false);
    // restart interval
    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      setTimeRemaining(prev => {
        const next = Math.max(0, prev - elapsed);
        storageGet('kb_active_exam').then(e => {
          if (e) storageSet('kb_active_exam', { ...e, timeRemaining: next });
        });
        if (next <= 0) {
          clearInterval(intervalRef.current);
          setShowAlert(true);
        }
        return next;
      });
    }, 1000);
  };

  const handleFreeTime = () => {
    setTimeRemaining(null);
    setShowAlert(false);
    clearInterval(intervalRef.current);
    onExamUpdate({ ...exam, timeRemaining: null, timeSeconds: null });
  };

  const handleEndExam = () => {
    setShowAlert(false);
    clearInterval(intervalRef.current);
    onTimeUp();
  };

  if (timeRemaining === null) return null;

  const isLow = timeRemaining <= 60;

  return (
    <>
      <div className={`font-mono text-lg font-bold tabular-nums ${isLow ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
        {formatTime(timeRemaining)}
      </div>

      <AlertDialog open={showAlert}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>زمان آزمون تمام شد!</AlertDialogTitle>
            <AlertDialogDescription>
              میتوانید ۵ دقیقه اضافه کنید، زمان را آزاد کنید یا آزمون را ببندید.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogAction onClick={handleAddTime} className="bg-primary">
              +۵ دقیقه
            </AlertDialogAction>
            <AlertDialogAction onClick={handleFreeTime} className="bg-secondary text-secondary-foreground">
              زمان آزاد
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleEndExam} className="bg-destructive text-destructive-foreground">
              پایان آزمون
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}