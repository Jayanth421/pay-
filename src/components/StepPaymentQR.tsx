'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface PaymentDetails {
  payment_reference: string;
  upi_id: string;
  recipient_name: string;
  amount: number;
  upi_uri: string;
}

interface StepPaymentQRProps {
  details: PaymentDetails;
  onBack: () => void;
  onCheckIn: () => Promise<void>;
  checkingIn?: boolean;
}

export function StepPaymentQR({
  details,
  onBack,
  onCheckIn,
  checkingIn = false,
}: StepPaymentQRProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [hasPaidConfirmed, setHasPaidConfirmed] = useState(false);

  const copyToClipboard = (text: string, type: 'upi' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handlePayWithApp = () => {
    window.location.href = details.upi_uri;
  };

  const handleClickCheckIn = async () => {
    if (!hasPaidConfirmed) return;
    await onCheckIn();
  };

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 transition-all">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDE59] border-2 border-black text-xs font-black mb-2 shadow-[2px_2px_0px_#000]">
          <span>Rotated Node Payment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
          Scan & Pay with UPI
        </h2>
        <p className="text-xs sm:text-sm font-bold text-zinc-600 mt-1">
          Scan the QR code below with any UPI app or tap the button to pay directly.
        </p>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center">
        <div className="relative pt-3 mb-5">
          {/* Top Folder Tab */}
          <div className="absolute top-0 left-6 px-3 py-1 bg-[#4ADE80] border-2 border-black rounded-t-xl text-[10px] font-black uppercase tracking-wider shadow-[2px_-2px_0px_#000]">
            Contribution: ₹{details.amount}.00
          </div>

          <div className="p-4 bg-white rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_#000] text-center">
            <div className="p-2.5 bg-[#FAF9F6] rounded-xl border-2 border-black">
              <QRCodeSVG
                value={details.upi_uri}
                size={200}
                level="H"
                includeMargin={true}
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Pay with UPI App Direct Button */}
        <button
          id="pay-upi-app-btn"
          type="button"
          onClick={handlePayWithApp}
          className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-[#FFDE59] hover:bg-[#fed736] text-black font-black text-sm sm:text-base border-[2.5px] border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 mb-5 cursor-pointer transition-all"
        >
          <Smartphone className="w-5 h-5 stroke-[2.5]" />
          <span>Pay with UPI App</span>
          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Payment Metadata Cards */}
        <div className="w-full max-w-sm space-y-2.5 mb-5">
          {/* Recipient UPI ID */}
          <div className="p-3 rounded-2xl bg-[#FAF9F6] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Recipient UPI ID (Rotated Account)
              </span>
              <span
                id="recipient-upi-display"
                className="text-xs sm:text-sm font-mono font-black text-black block truncate"
              >
                {details.upi_id}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold block truncate">
                {details.recipient_name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(details.upi_id, 'upi')}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black hover:bg-zinc-100 transition shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Copy UPI ID"
            >
              {copiedUpi ? (
                <Check className="w-4 h-4 text-[#16a34a] stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Payment Reference */}
          <div className="p-3 rounded-2xl bg-[#FAF9F6] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Payment Reference ID
              </span>
              <span
                id="payment-ref-display"
                className="text-xs sm:text-sm font-mono font-black text-[#15803d] block truncate"
              >
                {details.payment_reference}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(details.payment_reference, 'ref')}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black hover:bg-zinc-100 transition shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Copy Reference"
            >
              {copiedRef ? (
                <Check className="w-4 h-4 text-[#16a34a] stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Check Button Card: "You Paid" Confirmation (Replacing image upload) */}
        <div
          onClick={() => setHasPaidConfirmed(!hasPaidConfirmed)}
          className={`w-full max-w-sm p-4 rounded-2xl border-[2.5px] border-black transition-all cursor-pointer select-none mb-5 ${
            hasPaidConfirmed
              ? 'bg-[#DCFCE7] shadow-[4px_4px_0px_#000]'
              : 'bg-[#FAF9F6] hover:bg-[#FEFCE8] shadow-[2.5px_2.5px_0px_#000]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-xl border-2 border-black flex items-center justify-center transition-all shrink-0 ${
                hasPaidConfirmed
                  ? 'bg-[#22C55E] text-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'bg-white text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-black text-black">
                {hasPaidConfirmed ? '✓ I Have Paid (Payment Completed)' : 'Click to Confirm Payment'}
              </p>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-600 mt-0.5">
                Confirmed transfer of ₹{details.amount} to {details.upi_id}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Policy Disclaimer */}
        <div className="w-full max-w-sm p-3 rounded-2xl bg-[#FEFCE8] border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs flex items-start gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
          <p className="text-[11px] font-bold text-zinc-700 leading-snug">
            Clicking the Check In button records your roll number, verified email, and contribution in the campus portal.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={checkingIn}
            className="py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back</span>
          </button>

          {/* Requested "You Paid / Check In" Button 3 */}
          <button
            id="click-to-check-in-btn"
            type="button"
            onClick={handleClickCheckIn}
            disabled={checkingIn || !hasPaidConfirmed}
            className={`flex-1 py-3.5 px-5 rounded-xl border-[2.5px] border-black transition ${
              hasPaidConfirmed
                ? 'bg-[#4ADE80] hover:bg-[#22c55e] text-black font-black text-sm sm:text-base shadow-[3.5px_3.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#000] cursor-pointer'
                : 'bg-zinc-200 text-zinc-500 font-bold text-xs sm:text-sm shadow-none cursor-not-allowed opacity-80'
            }`}
          >
            {checkingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking In...</span>
              </>
            ) : hasPaidConfirmed ? (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>You Paid — Click to Check In</span>
              </>
            ) : (
              <span>Confirm Payment Above to Check In</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
