import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import {
  getNextMockUpi,
  saveMockDonation,
  MOCK_STUDENTS,
  getAllMockDonations,
} from '@/lib/mockData';
import { Donation } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rollNumber = (body?.roll_number || '').trim().toUpperCase();
    const amount = Number(body?.amount);

    if (!rollNumber) {
      return NextResponse.json(
        { success: false, message: 'Roll number is required.' },
        { status: 400 }
      );
    }

    if (!amount || isNaN(amount) || amount < 15) {
      return NextResponse.json(
        { success: false, message: 'Contribution amount cannot be less than ₹15.' },
        { status: 400 }
      );
    }

    // SINGLE DONATION ENFORCEMENT
    // Check if student already submitted a donation
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        try {
          const { data: existing } = await supabase
            .from('donations')
            .select('payment_reference, status, amount')
            .ilike('roll_number', rollNumber)
            .in('status', ['awaiting_verification', 'approved'])
            .limit(1)
            .maybeSingle();

          if (existing) {
            return NextResponse.json(
              {
                success: false,
                already_donated: true,
                message: `You have already made a contribution (Ref: ${existing.payment_reference}). Each student can only contribute once.`,
              },
              { status: 400 }
            );
          }
        } catch (checkErr) {
          console.warn('Error checking existing donations:', checkErr);
        }
      }
    }

    const mockExisting = getAllMockDonations().find(
      (d) =>
        d.roll_number.toUpperCase() === rollNumber &&
        ['awaiting_verification', 'approved'].includes(d.status)
    );
    if (mockExisting) {
      return NextResponse.json(
        {
          success: false,
          already_donated: true,
          message: `You have already made a contribution (Ref: ${mockExisting.payment_reference}). Each student can only contribute once.`,
        },
        { status: 400 }
      );
    }

    // Generate unique payment reference
    const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
    const paymentReference = `CMP-${uniqueSuffix}`;

    let studentName = 'Student';
    let studentEmail = `${rollNumber.toLowerCase()}@cmrcet.ac.in`;
    let upiId = '';
    let recipientName = 'Campus Contribution Fund';
    let upiAccountId = 1;

    const emailFromReq = (body?.email || body?.student_email || '').trim();
    if (emailFromReq) {
      studentEmail = emailFromReq;
    }

    // Call rotating UPI function from database
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        // Fetch student details from students table if email was not already custom
        if (!emailFromReq) {
          const { data: student } = await supabase
            .from('students')
            .select('student_name, email')
            .ilike('roll_number', rollNumber)
            .single();

          if (student && student.student_name) {
            studentName = student.student_name;
            studentEmail = student.email || studentEmail;
          } else {
            const matched = MOCK_STUDENTS.find(
              (s) => s.roll_number.toUpperCase() === rollNumber
            );
            if (matched) {
              studentName = matched.student_name;
              studentEmail = matched.email;
            }
          }
        }

        // Call rotating UPI function from database
        const { data: upiAccount, error: rpcError } = await supabase.rpc('get_next_rotating_upi');

        if (!rpcError && upiAccount) {
          const acc = Array.isArray(upiAccount) ? upiAccount[0] : upiAccount;
          if (acc && acc.upi_id) {
            upiId = acc.upi_id;
            recipientName = acc.account_name;
            upiAccountId = acc.id;
          }
        } else {
          // Fallback query if RPC isn't loaded yet
          const { data: accounts } = await supabase
            .from('upi_accounts')
            .select('*')
            .eq('is_active', true)
            .order('total_assigned', { ascending: true })
            .limit(1);

          if (accounts && accounts.length > 0) {
            upiId = accounts[0].upi_id;
            recipientName = accounts[0].account_name;
            upiAccountId = accounts[0].id;
            await supabase
              .from('upi_accounts')
              .update({ total_assigned: (accounts[0].total_assigned || 0) + 1 })
              .eq('id', accounts[0].id);
          }
        }
      }
    }

    // Fallback if Supabase not configured or no UPI returned
    if (!upiId) {
      const matched = MOCK_STUDENTS.find(
        (s) => s.roll_number.toUpperCase() === rollNumber
      );
      if (matched) {
        studentName = matched.student_name;
        studentEmail = matched.email;
      }

      // 4 UPI rotation
      const rotatingAccount = getNextMockUpi();
      upiId = rotatingAccount.upi_id;
      recipientName = rotatingAccount.account_name;
      upiAccountId = rotatingAccount.id;

      const newDonation: Donation = {
        id: `mock-don-${Date.now()}`,
        payment_reference: paymentReference,
        roll_number: rollNumber,
        student_name: studentName,
        student_email: studentEmail,
        amount,
        upi_account_id: upiAccountId,
        upi_id: upiId,
        recipient_name: recipientName,
        status: 'pending_payment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMockDonation(newDonation);
    }

    // Official UPI payment intent deep-link
    const cleanRecipientName = encodeURIComponent(recipientName.replace(/[^a-zA-Z0-9 ]/g, ''));
    const note = encodeURIComponent(`Contribution Ref ${paymentReference}`);
    const upiUri = `upi://pay?pa=${upiId}&pn=${cleanRecipientName}&am=${amount.toFixed(2)}&cu=INR&tn=${note}&tr=${paymentReference}`;

    return NextResponse.json({
      success: true,
      payment_reference: paymentReference,
      upi_id: upiId,
      recipient_name: recipientName,
      amount,
      upi_uri: upiUri,
      student: {
        name: studentName,
        student_name: studentName,
        roll_number: rollNumber,
        email: studentEmail,
      },
    });
  } catch (error) {
    console.error('Error initiating payment request:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while initiating payment.' },
      { status: 500 }
    );
  }
}
