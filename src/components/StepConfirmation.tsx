'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Mail,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Donation } from '@/lib/types';

interface StepConfirmationProps {
  paymentReference: string;
  onReset: () => void;
}

export function StepConfirmation({
  paymentReference,
  onReset,
}: StepConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Fetch updated donation record
    fetch(`/api/donation/status?ref=${paymentReference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.donation) {
          setDonation(data.donation);
        }
      })
      .catch((err) => console.error('Error fetching donation status:', err));
  }, [paymentReference]);

  const copyReference = () => {
    navigator.clipboard.writeText(paymentReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 transition-all max-w-lg mx-auto">
      {/* Success Badge */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#4ADE80] border-2 border-black text-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000]">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDE59] border-2 border-black text-xs font-black mb-3 shadow-[2px_2px_0px_#000]">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Status: Awaiting Verification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-snug">
          Thank you for your contribution!
        </h2>
        <p className="text-sm font-bold text-zinc-700 mt-2">
          Your contribution check-in has been submitted and is awaiting verification.
        </p>
      </div>

      {/* Details Box */}
      <div className="bg-[#FAF9F6] border-2 border-black rounded-2xl p-4 mb-6 space-y-3 shadow-[3px_3px_0px_#000]">
        <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-200">
          <span className="text-xs font-black text-zinc-500 uppercase">
            Payment Reference
          </span>
          <div className="flex items-center space-x-2">
            <span
              id="confirmed-payment-ref"
              className="text-xs sm:text-sm font-mono font-black text-black"
            >
              {paymentReference}
            </span>
            <button
              type="button"
              onClick={copyReference}
              className="p-1 rounded-lg bg-white border border-black shadow-[1.5px_1.5px_0px_#000] text-black transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Copy"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[3]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {donation && (
          <>
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-200 text-xs">
              <span className="font-black text-zinc-500 uppercase">Student</span>
              <span className="font-black text-black">
                {donation.student_name} ({donation.roll_number})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-200 text-xs">
              <span className="font-black text-zinc-500 uppercase">Amount</span>
              <span className="font-black text-black text-sm">₹{donation.amount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-zinc-500 uppercase">UPI Account</span>
              <span className="font-mono font-bold text-black truncate max-w-[180px]">
                {donation.upi_id}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Email Dispatch Notice */}
      <div className="p-4 rounded-2xl bg-[#E0F2FE] border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs mb-6 flex items-start gap-3">
        <Mail className="w-5 h-5 text-sky-700 shrink-0 mt-0.5 stroke-[2.5]" />
        <div className="space-y-1">
          <p className="font-black">
            Receipt Acknowledgment Email Dispatched
          </p>
          <p className="text-[11px] font-bold text-zinc-800 leading-relaxed">
            An email acknowledging your contribution has been sent to your registered email address.
            <span className="block mt-1 text-sky-900 font-extrabold underline decoration-1">
              Note: This acknowledges receipt of your check-in, not official payment approval. Approval requires verification by campus administrators.
            </span>
          </p>
        </div>
      </div>

      {/* Trust & Next Steps */}
      <div className="p-3 bg-[#FAF9F6] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-bold text-zinc-600 flex items-center gap-2 mb-6">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
        <span>
          Verification usually completes within 24 hours. A verified receipt email will follow once approved.
        </span>
      </div>

      {/* Actions */}
      <div>
        <button
          id="make-another-donation-btn"
          type="button"
          onClick={onReset}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#FFDE59] hover:bg-[#fed736] text-black font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Return to Campus Home</span>
        </button>
      </div>
    </div>
  );
}
