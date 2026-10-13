'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StepTracker } from '@/components/StepTracker';
import { StepRollNumber } from '@/components/StepRollNumber';
import { StepAmount } from '@/components/StepAmount';
import { StepPaymentQR } from '@/components/StepPaymentQR';
import { StepConfirmation } from '@/components/StepConfirmation';
import { StudentInfo } from '@/lib/types';
import { ShieldCheck } from 'lucide-react';

interface PaymentDetails {
  payment_reference: string;
  upi_id: string;
  recipient_name: string;
  amount: number;
  upi_uri: string;
}

export default function StudentFlowPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [verifiedStudent, setVerifiedStudent] = useState<StudentInfo | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string>('');
  const [initiatingPayment, setInitiatingPayment] = useState<boolean>(false);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);

  // Step 1: Student Verified
  const handleStudentVerified = (student: StudentInfo) => {
    setVerifiedStudent(student);
    setCurrentStep(2);
  };

  // Step 2: Amount Chosen -> Call API to rotate UPI & generate intent
  const handleAmountProceed = async (amount: number) => {
    if (!verifiedStudent) return;
    setInitiatingPayment(true);

    try {
      const res = await fetch('/api/donation/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roll_number: verifiedStudent.roll_number,
          email: verifiedStudent.email,
          amount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentDetails({
          payment_reference: data.payment_reference,
          upi_id: data.upi_id,
          recipient_name: data.recipient_name,
          amount: data.amount,
          upi_uri: data.upi_uri,
        });
        setCurrentStep(3);
      } else {
        alert(data.message || 'Failed to initiate payment.');
      }
    } catch (err) {
      console.error('Error initiating donation:', err);
      alert('Network error while creating payment request.');
    } finally {
      setInitiatingPayment(false);
    }
  };

  // Step 3: Click to Check In (Button 3) -> Stores email in Supabase
  const handleCheckIn = async () => {
    if (!verifiedStudent || !paymentDetails) return;
    setCheckingIn(true);

    try {
      const formData = new FormData();
      formData.append('payment_reference', paymentDetails.payment_reference);
      formData.append('roll_number', verifiedStudent.roll_number);
      formData.append(
        'student_name',
        verifiedStudent.student_name || verifiedStudent.name || 'Student'
      );
      formData.append('email', verifiedStudent.email || '');
      formData.append('student_email', verifiedStudent.email || '');
      formData.append('amount', String(paymentDetails.amount));
      formData.append('upi_id', paymentDetails.upi_id);
      formData.append('recipient_name', paymentDetails.recipient_name);

      const res = await fetch('/api/donation/checkin', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setConfirmedRef(paymentDetails.payment_reference);
        setCurrentStep(4);
      } else {
        alert(data.message || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during check-in:', err);
      alert('Network error while processing check-in. Please retry.');
    } finally {
      setCheckingIn(false);
    }
  };

  // View Existing Donation Slip
  const handleViewExisting = (ref: string) => {
    setConfirmedRef(ref);
    setCurrentStep(4);
  };

  // Reset Flow
  const handleReset = () => {
    setVerifiedStudent(null);
    setPaymentDetails(null);
    setConfirmedRef('');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[#FEFCE8] text-black flex flex-col justify-center font-sans relative overflow-x-hidden py-8 sm:py-12">
      {/* Playful Neo-Brutalism geometric background elements */}
      <div className="absolute top-12 -left-12 w-48 h-48 rounded-full bg-[#FB7185] border-[3px] border-black -z-0 opacity-80 pointer-events-none" />
      <div className="absolute top-96 -right-16 w-60 h-60 rounded-3xl rotate-12 bg-[#818CF8] border-[3px] border-black -z-0 opacity-80 pointer-events-none" />
      <div className="absolute bottom-12 left-8 w-24 h-24 rounded-2xl -rotate-12 bg-[#4ADE80] border-[3px] border-black -z-0 opacity-70 pointer-events-none" />

      {/* Main Flow Container — No Header, No Footer */}
      <main className="max-w-xl w-full mx-auto px-4 relative z-10">
        {/* Step Progress Tracker */}
        <StepTracker currentStep={currentStep} />

        {/* Step Views */}
        <div className="transition-all duration-300">
          {currentStep === 1 && (
            <StepRollNumber
              onVerified={handleStudentVerified}
              onViewExisting={handleViewExisting}
            />
          )}

          {currentStep === 2 && verifiedStudent && (
            <StepAmount
              student={verifiedStudent}
              onBack={() => setCurrentStep(1)}
              onProceed={handleAmountProceed}
              loading={initiatingPayment}
            />
          )}

          {currentStep === 3 && paymentDetails && (
            <StepPaymentQR
              details={paymentDetails}
              onBack={() => setCurrentStep(2)}
              onCheckIn={handleCheckIn}
              checkingIn={checkingIn}
            />
          )}

          {currentStep === 4 && confirmedRef && (
            <StepConfirmation
              paymentReference={confirmedRef}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Discreet floating admin link in bottom corner */}
      <div className="fixed bottom-3 right-3 z-20">
        <Link
          href="/admin/login"
          title="Admin Login"
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border-2 border-black/40 hover:border-black shadow-sm flex items-center justify-center text-zinc-500 hover:text-black transition"
        >
          <ShieldCheck className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
