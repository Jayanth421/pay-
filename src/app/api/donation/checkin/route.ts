import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { saveMockDonation, getAllMockDonations, MOCK_STUDENTS } from '@/lib/mockData';
import { sendReceiptEmail } from '@/lib/email';
import { Donation } from '@/lib/types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const paymentReference = (formData.get('payment_reference') as string || '').trim();
    const rollNumber = (formData.get('roll_number') as string || '').trim().toUpperCase();
    const amount = Number(formData.get('amount'));
    const studentNameInput = (formData.get('student_name') as string || '').trim();
    const emailInput = (formData.get('email') as string || formData.get('student_email') as string || '').trim();
    const upiId = (formData.get('upi_id') as string || '').trim();
    const recipientName = (formData.get('recipient_name') as string || 'Campus Contribution Fund').trim();
    const upiAccountId = Number(formData.get('upi_account_id')) || 1;
    const file = formData.get('screenshot') as File | null;

    if (!paymentReference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required.' },
        { status: 400 }
      );
    }

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

    // Resolve student name and email
    let studentName = studentNameInput;
    let studentEmail = emailInput || `${rollNumber.toLowerCase()}@cmrcet.ac.in`;

    if (!studentName || studentName === 'Student') {
      const matched = MOCK_STUDENTS.find(
        (s) => s.roll_number.toUpperCase() === rollNumber
      );
      if (matched) {
        studentName = matched.student_name;
        if (!studentEmail || studentEmail.includes('@cmrcet.ac.in')) {
          studentEmail = emailInput || matched.email;
        }
      } else {
        studentName = 'Student';
      }
    }

    // Single donation enforcement check
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        try {
          const { data: existing } = await supabase
            .from('donations')
            .select('payment_reference, status')
            .ilike('roll_number', rollNumber)
            .in('status', ['awaiting_verification', 'approved'])
            .limit(1)
            .maybeSingle();

          if (existing && existing.payment_reference !== paymentReference) {
            return NextResponse.json(
              {
                success: false,
                already_donated: true,
                message: `You have already made a contribution (Ref: ${existing.payment_reference}). Each student can only donate once.`,
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
        d.payment_reference !== paymentReference &&
        ['awaiting_verification', 'approved'].includes(d.status)
    );
    if (mockExisting) {
      return NextResponse.json(
        {
          success: false,
          already_donated: true,
          message: `You have already made a contribution (Ref: ${mockExisting.payment_reference}). Each student can only donate once.`,
        },
        { status: 400 }
      );
    }

    let screenshotUrl: string | null = null;
    let dataUri: string | null = null;

    // Handle image file upload if provided
    if (file && file.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid file format. Please upload JPG, PNG, or WebP screenshot.',
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: 'Screenshot file size exceeds 5 MB.',
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Upload to Supabase Storage
      if (isSupabaseAdminConfigured()) {
        const supabase = getServiceSupabase();
        if (supabase) {
          try {
            const fileExt = file.name.split('.').pop() || 'png';
            const storagePath = `proofs/${paymentReference}-${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('payment-screenshots')
              .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: true,
              });

            if (!uploadErr && uploadData) {
              const { data: pubData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(storagePath);

              screenshotUrl = pubData?.publicUrl || storagePath;
            } else {
              console.warn('Storage upload error, using dataUri fallback:', uploadErr);
              screenshotUrl = dataUri;
            }
          } catch (storageException) {
            console.warn('Storage exception, using dataUri fallback:', storageException);
            screenshotUrl = dataUri;
          }
        }
      }

      if (!screenshotUrl) {
        screenshotUrl = dataUri;
      }
    }

    // Persist donation record to Supabase
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        try {
          // Check if record was already initiated
          const { data: existingRecord } = await supabase
            .from('donations')
            .select('id, payment_reference')
            .eq('payment_reference', paymentReference)
            .maybeSingle();

          if (existingRecord) {
            // Update existing record
            const { error: updateErr } = await supabase
              .from('donations')
              .update({
                student_name: studentName,
                student_email: studentEmail,
                amount,
                screenshot_url: screenshotUrl,
                status: 'awaiting_verification',
                receipt_email_sent: true,
                updated_at: new Date().toISOString(),
              })
              .eq('payment_reference', paymentReference);

            if (updateErr) {
              console.warn('Notice updating existing record:', updateErr);
            }
          } else {
            // Insert new verified check-in record
            const { error: insertErr } = await supabase.from('donations').insert({
              payment_reference: paymentReference,
              roll_number: rollNumber,
              student_name: studentName,
              student_email: studentEmail,
              amount,
              upi_account_id: upiAccountId,
              upi_id: upiId || 'campus.fund1@okhdfcbank',
              screenshot_url: screenshotUrl,
              status: 'awaiting_verification',
              receipt_email_sent: true,
            });

            if (insertErr) {
              console.error('Error inserting check-in to Supabase:', insertErr);
            }
          }
        } catch (dbErr) {
          console.error('Database check-in error:', dbErr);
        }
      }
    }

    // Always synchronize in-memory mock store
    const syncDonation: Donation = {
      id: `don-${Date.now()}`,
      payment_reference: paymentReference,
      roll_number: rollNumber,
      student_name: studentName,
      student_email: studentEmail,
      amount,
      upi_id: upiId || 'Campus Fund',
      recipient_name: recipientName,
      screenshot_url: screenshotUrl || dataUri || undefined,
      status: 'awaiting_verification',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      receipt_email_sent: true,
    };
    saveMockDonation(syncDonation);

    // Send receipt email in background without blocking check-in response
    if (studentEmail) {
      sendReceiptEmail({
        to: studentEmail,
        studentName,
        rollNumber,
        amount,
        paymentReference,
        upiId,
      }).catch((err) => console.warn('Background email dispatch notice:', err));
    }

    return NextResponse.json({
      success: true,
      payment_reference: paymentReference,
      status: 'awaiting_verification',
      message: 'Check-in successful! Your contribution has been registered.',
      screenshot_url: screenshotUrl,
      student_email: studentEmail,
    });
  } catch (error) {
    console.error('Error handling check-in:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing check-in.' },
      { status: 500 }
    );
  }
}
