'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { StudentInfo } from '@/lib/types';

interface StepAmountProps {
  student: StudentInfo;
  onBack: () => void;
  onProceed: (amount: number) => Promise<void>;
  loading?: boolean;
}

export function StepAmount({
  student,
  onBack,
  onProceed,
  loading = false,
}: StepAmountProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(30); // Default to ₹30
  const [customAmount, setCustomAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const presetOptions = [
    { amt: 15, tabColor: 'bg-[#4ADE80]', label: 'Supporter' },
    { amt: 20, tabColor: 'bg-[#FFDE59]', label: 'Popular', badge: 'POPULAR' },
    { amt: 30, tabColor: 'bg-[#FB7185]', label: 'Champion' },
  ];

  const handlePresetSelect = (amt: number) => {
    setSelectedPreset(amt);
    setErrorMsg('');
  };

  const handleCustomSelect = () => {
    setSelectedPreset('custom');
    if (customAmount && Number(customAmount) < 15) {
      setErrorMsg('Contribution .');
    } else {
      setErrorMsg('');
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);

    if (!val) {
      setErrorMsg('Please enter an amount.');
      return;
    }

    const num = Number(val);
    if (isNaN(num) || num < 15) {
      setErrorMsg('Contribution amount must not be below ₹15 (minimum 15).');
    } else {
      setErrorMsg('');
    }
  };

  const handleDonateNow = async () => {
    if (selectedPreset === 'custom') {
      const num = Number(customAmount);
      if (!customAmount || isNaN(num) || num < 15) {
        setErrorMsg('Contribution amount must not be below ₹15 (minimum 15).');
        return;
      }
      await onProceed(num);
    } else {
      await onProceed(selectedPreset);
    }
  };

  const displayName = student.student_name || student.name || 'Student';

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 transition-all">
      {/* Student Badge Bar */}
      <div className="bg-[#FAF9F6] border-2 border-black rounded-2xl p-3.5 mb-6 flex items-center justify-between shadow-[3px_3px_0px_#000]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFDE59] border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
            <User className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase">Student</p>
            <p className="text-sm font-black text-black">{displayName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] inline-block">
            {student.roll_number}
          </span>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
          Select Contribution Amount
        </h2>

      </div>

      {/* Preset Folder Cards (styled like the collection cards in the mockup) */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {presetOptions.map((item) => {
            const isSelected = selectedPreset === item.amt;

            return (
              <div key={item.amt} className="relative pt-3">
                {/* Folder Tab */}
                <div
                  className={`absolute top-0 left-3 px-2 py-0.5 rounded-t-lg border-2 border-b-0 border-black text-[9px] font-black uppercase tracking-wider ${item.tabColor}`}
                >
                  {item.badge || item.label}
                </div>

                {/* Card Body */}
                <button
                  type="button"
                  id={`amount-btn-${item.amt}`}
                  onClick={() => handlePresetSelect(item.amt)}
                  className={`w-full py-4 px-2 rounded-2xl border-[2.5px] border-black flex flex-col items-center justify-center transition-all cursor-pointer ${isSelected
                    ? `${item.tabColor} shadow-[4px_4px_0px_#000] scale-[1.03] -translate-y-0.5`
                    : 'bg-white hover:bg-zinc-50 shadow-[3px_3px_0px_#000]'
                    }`}
                >
                  <span className="text-2xl sm:text-3xl font-black text-black">
                    ₹{item.amt}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tight text-zinc-700 mt-0.5">
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Amount Option (styled like the purple collection card in mockup) */}
      <div className="mb-6">
        <div className="relative pt-3">
          {/* Top Tab */}
          <div className="absolute top-0 left-3 px-2.5 py-0.5 rounded-t-lg border-2 border-b-0 border-black text-[9px] font-black uppercase tracking-wider bg-[#C084FC] flex items-center gap-1">
            <span>Custom Amount</span>
            <span className="bg-black text-white px-1 rounded text-[8px]">MIN ₹15</span>
          </div>

          {/* Card Body */}
          <div
            onClick={handleCustomSelect}
            className={`p-4 rounded-2xl border-[2.5px] border-black transition-all cursor-pointer ${selectedPreset === 'custom'
              ? 'bg-[#FAF5FF] shadow-[4px_4px_0px_#000]'
              : 'bg-white shadow-[3px_3px_0px_#000]'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-black">
                Or Enter Your Own Amount
              </span>
              {selectedPreset === 'custom' && (
                <span className="text-xs font-black text-black bg-[#C084FC] border border-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              )}
            </div>

            <div className="relative flex items-center bg-white border-2 border-black rounded-xl px-3 py-2.5 shadow-[2px_2px_0px_#000]">
              <IndianRupee className="w-5 h-5 text-black shrink-0 mr-1 stroke-[2.5]" />
              <input
                id="custom-amount-input"
                type="number"
                min="15"
                step="1"
                value={customAmount}
                onFocus={handleCustomSelect}
                onChange={handleCustomInputChange}
                placeholder="Enter amount "
                className="w-full bg-transparent text-black font-black text-lg focus:outline-none placeholder:text-zinc-400 placeholder:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Validation Warning */}
        {errorMsg && (
          <div
            id="amount-error-alert"
            className="mt-3 p-3 rounded-2xl bg-[#FEE2E2] border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>



      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back</span>
        </button>

        <button
          id="donate-now-btn"
          type="button"
          onClick={handleDonateNow}
          disabled={
            loading ||
            (selectedPreset === 'custom' && (!customAmount || Number(customAmount) < 15)) ||
            (typeof selectedPreset === 'number' && selectedPreset < 15)
          }
          className="flex-1 py-3.5 px-6 rounded-xl bg-[#FFDE59] hover:bg-[#fed736] disabled:bg-zinc-200 text-black font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating UPI QR...</span>
            </>
          ) : (
            <>
              <span>
                Proceed to Pay (₹
                {selectedPreset === 'custom'
                  ? customAmount || '15+'
                  : selectedPreset}
                )
              </span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
