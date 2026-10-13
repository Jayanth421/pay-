import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { MOCK_STUDENTS, getAllMockDonations } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rollNumber = (body?.roll_number || '').trim().toUpperCase();

    if (!rollNumber) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid roll number.' },
        { status: 400 }
      );
    }

    let foundStudent: {
      name: string;
      student_name: string;
      roll_number: string;
      email: string;
    } | null = null;

    // Check live Supabase students table
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('students')
            .select('student_name, roll_number, email')
            .ilike('roll_number', rollNumber)
            .maybeSingle();

          if (!error && data) {
            foundStudent = {
              name: data.student_name,
              student_name: data.student_name,
              roll_number: data.roll_number,
              email: data.email,
            };
          }
        } catch (supabaseErr) {
          console.warn('Supabase query issue, checking fallback roster:', supabaseErr);
        }
      }
    }

    // Fallback to CMRCET roster if not returned from Supabase
    if (!foundStudent) {
      const matched = MOCK_STUDENTS.find(
        (s) => s.roll_number.toUpperCase() === rollNumber
      );
      if (matched) {
        foundStudent = {
          name: matched.student_name,
          student_name: matched.student_name,
          roll_number: matched.roll_number,
          email: matched.email,
        };
      }
    }

    if (!foundStudent) {
      return NextResponse.json({
        success: false,
        message: 'No student record was found for that roll number.',
      });
    }

    // SINGLE DONATION ENFORCEMENT:
    // Check if student has already made a donation
    let existingDonation: {
      payment_reference: string;
      amount: number;
      status: string;
      created_at: string;
    } | null = null;

    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        try {
          const { data: don } = await supabase
            .from('donations')
            .select('payment_reference, amount, status, created_at')
            .ilike('roll_number', rollNumber)
            .in('status', ['awaiting_verification', 'approved'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (don) {
            existingDonation = don;
          }
        } catch (err) {
          console.warn('Error checking existing donations in Supabase:', err);
        }
      }
    }

    // Also check local mock store
    if (!existingDonation) {
      const mockDon = getAllMockDonations().find(
        (d) =>
          d.roll_number.toUpperCase() === rollNumber &&
          ['awaiting_verification', 'approved'].includes(d.status)
      );
      if (mockDon) {
        existingDonation = {
          payment_reference: mockDon.payment_reference,
          amount: mockDon.amount,
          status: mockDon.status,
          created_at: mockDon.created_at,
        };
      }
    }

    if (existingDonation) {
      return NextResponse.json({
        success: true,
        already_donated: true,
        message: `A contribution has already been submitted for this roll number (Ref: ${existingDonation.payment_reference}). Each student can only contribute once.`,
        student: foundStudent,
        existing_donation: existingDonation,
      });
    }

    // Student is eligible to contribute
    return NextResponse.json({
      success: true,
      already_donated: false,
      student: foundStudent,
    });
  } catch (error) {
    console.error('Error verifying roll number:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while verifying roll number.' },
      { status: 500 }
    );
  }
}
