'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  UserCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Hash,
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { StudentInfo } from '@/lib/types';

interface ExistingDonationInfo {
  payment_reference: string;
  amount: number;
  status: string;
  created_at: string;
}

interface StepRollNumberProps {
  onVerified: (student: StudentInfo) => void;
  onViewExisting?: (ref: string) => void;
}

export function StepRollNumber({ onVerified, onViewExisting }: StepRollNumberProps) {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState<StudentInfo | null>(null);
  const [existingDonation, setExistingDonation] = useState<ExistingDonationInfo | null>(null);

  const [studentEmailInput, setStudentEmailInput] = useState('');

  // CMRCET roster sample roll numbers for instant 1-click testing
  const sampleRolls = ['25H51A0465', '25H51A0485', '25H51A0496', '26H55A0407', '26H55A0414'];

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRoll = rollNumber.trim().toUpperCase();

    if (!cleanRoll) {
      setErrorMessage('Please enter your roll number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setVerifiedStudent(null);
    setExistingDonation(null);

    try {
      const res = await fetch('/api/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_number: cleanRoll }),
      });

      const data = await res.json();

      if (data.success && data.student) {
        setVerifiedStudent(data.student);
        setStudentEmailInput(data.student.email || `${cleanRoll.toLowerCase()}@cmrcet.ac.in`);
        if (data.already_donated && data.existing_donation) {
          setExistingDonation(data.existing_donation);
        }
      } else {
        setErrorMessage(
          data.message || 'No student record was found for that roll number.'
        );
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage('Unable to verify roll number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (verifiedStudent && !existingDonation) {
      onVerified({
        ...verifiedStudent,
        email: studentEmailInput.trim() || verifiedStudent.email,
      });
    }
  };

  const displayName = verifiedStudent?.student_name || verifiedStudent?.name;

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 transition-all">
      {/* Neo-Brutalist Heading */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFDE59] border-2 border-black text-xs font-black mb-3 shadow-[2px_2px_0px_#000]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official CMRCET Drive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
          Contribute now.<br />
          Verify anytime.
        </h1>
        <p className="text-sm font-bold text-zinc-600 mt-2">
          Enter your university roll number. <span className="text-black font-black underline decoration-2">Single contribution only</span> per student.
        </p>
      </div>

      {/* Input Field styled like search/paste bar */}
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 relative flex items-center bg-white border-[2.5px] border-black rounded-2xl shadow-[3.5px_3.5px_0px_#000] px-3.5 py-3 focus-within:shadow-[5px_5px_0px_#000] transition-all">
            <Hash className="w-5 h-5 text-zinc-500 shrink-0 mr-2 stroke-[2.5]" />
            <input
              id="roll-number-input"
              type="text"
              value={rollNumber}
              onChange={(e) => {
                setRollNumber(e.target.value.toUpperCase());
                setErrorMessage('');
                setVerifiedStudent(null);
                setExistingDonation(null);
              }}
              placeholder="e.g. 25H51A0485"
              className="w-full bg-transparent text-black font-mono font-bold text-base sm:text-lg uppercase placeholder:text-zinc-400 focus:outline-none"
              autoFocus
            />
          </div>

          <button
            id="verify-continue-btn"
            type="submit"
            disabled={loading || !rollNumber.trim()}
            className="h-[52px] w-[56px] rounded-2xl bg-[#FFDE59] hover:bg-[#fed736] disabled:bg-zinc-200 border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center text-black font-black transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            title="Continue"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            )}
          </button>
        </div>

        {/* Quick Sample Roll Numbers as Neo-Brutalist Tags */}
        <div className="pt-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-2">
            Quick Pick Roll Numbers:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleRolls.map((roll) => (
              <button
                key={roll}
                type="button"
                onClick={() => {
                  setRollNumber(roll);
                  setErrorMessage('');
                  setVerifiedStudent(null);
                  setExistingDonation(null);
                }}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#FFDE59] text-black font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                {roll}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            id="roll-error-alert"
            className="p-3.5 rounded-2xl bg-[#FEE2E2] border-[2.5px] border-black shadow-[3px_3px_0px_#000] text-black text-xs font-bold flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ALREADY DONATED NOTICE (Single Donation Enforcement) */}
        {verifiedStudent && existingDonation && (
          <div
            id="already-donated-card"
            className="relative mt-4 pt-3"
          >
            {/* Top Folder Tab */}
            <div className="absolute top-0 left-6 px-3 py-1 bg-[#FFDE59] border-2 border-black rounded-t-xl text-[10px] font-black uppercase tracking-wider shadow-[2px_-2px_0px_#000] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Single Contribution Policy</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEFCE8] border-[2.5px] border-black shadow-[4px_4px_0px_#000] pt-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFDE59] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                  <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-black truncate">
                    {displayName}
                  </p>
                  <p className="text-xs font-bold text-zinc-700 mt-0.5">
                    A contribution submission is already registered for roll{' '}
                    <span className="font-mono font-black">{verifiedStudent.roll_number}</span>.
                  </p>
                </div>
              </div>

              {/* Existing Donation Details Box */}
              <div className="mt-3 p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-500 uppercase text-[10px]">Reference</span>
                  <span className="font-mono font-black text-black">{existingDonation.payment_reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-500 uppercase text-[10px]">Contributed</span>
                  <span className="font-black text-black">₹{existingDonation.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-500 uppercase text-[10px]">Current Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFDE59] border border-black font-black text-[10px]">
                    {existingDonation.status === 'approved' ? 'Approved' : 'Awaiting Verification'}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-bold text-zinc-600">
                To keep contributions fair, each student can only contribute one time.
              </div>

              {onViewExisting && (
                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onViewExisting(existingDonation.payment_reference)}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 stroke-[2.5]" />
                    <span>View Submission Status Slip</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verified Student Card (When NOT yet donated) */}
        {verifiedStudent && !existingDonation && (
          <div
            id="verified-student-card"
            className="relative mt-4 pt-3"
          >
            {/* Top Folder Tab */}
            <div className="absolute top-0 left-6 px-3 py-1 bg-[#4ADE80] border-2 border-black rounded-t-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_-2px_0px_#000]">
              Verified Student
            </div>

            <div className="p-4 rounded-2xl bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] pt-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4ADE80] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                  <UserCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-black truncate">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 mt-1">
                    <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded-lg border border-black text-black font-black">
                      {verifiedStudent.roll_number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Email Field */}
              <div className="mt-3.5 pt-3 border-t-2 border-zinc-200">
                <label
                  htmlFor="verified-student-email"
                  className="block text-[11px] font-black uppercase tracking-wider text-black mb-1.5"
                >
                  Receipt & Notification Email:
                </label>
                <input
                  id="verified-student-email"
                  type="email"
                  value={studentEmailInput}
                  onChange={(e) => setStudentEmailInput(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3 py-2.5 bg-[#FAF9F6] border-2 border-black rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
                  required
                />
                <p className="text-[10px] text-zinc-500 font-bold mt-1">
                  Payment confirmation & receipts will be stored in Supabase and sent to this email.
                </p>
              </div>

              <div className="mt-4 pt-1">
                <button
                  id="proceed-donation-btn"
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#4ADE80] hover:bg-[#22c55e] text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Proceed to Contribution</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
