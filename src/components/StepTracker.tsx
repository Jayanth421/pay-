'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepTrackerProps {
  currentStep: number;
}

const STEPS = [
  { step: 1, label: 'Roll No', color: 'bg-[#E2E8F0]' },
  { step: 2, label: 'Amount', color: 'bg-[#4ADE80]' },
  { step: 3, label: 'Pay & Check In', color: 'bg-[#FFDE59]' },
  { step: 4, label: 'Confirmed', color: 'bg-[#4ADE80]' },
];

export function StepTracker({ currentStep }: StepTrackerProps) {
  return (
    <div className="w-full max-w-lg mx-auto mb-6 px-2">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {STEPS.map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div key={item.step} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full py-2 px-1 rounded-xl border-2 border-black flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? `${item.color} shadow-[3.5px_3.5px_0px_#000] scale-105 -translate-y-0.5`
                    : isDone
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-zinc-400 border-zinc-300 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-black ${isDone ? 'text-white' : 'text-black'}`}>
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : `0${item.step}`}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-tight hidden sm:block truncate ${
                    isDone ? 'text-white' : 'text-black'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
