import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { getMockDonation, saveMockDonation, MOCK_STUDENTS } from '@/lib/mockData';
import { sendReceiptEmail } from '@/lib/email';
import { Donation } from '@/lib/types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('screenshot') as File | null;
    const paymentReference = (formData.get('payment_reference') as string || '').trim();

    if (!paymentReference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Please select a screenshot file to upload.' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file type. Only JPG, PNG, and WebP formats are accepted.',
        },
        { status: 400 }
      );
    }

    // Validate File Size (up to 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'File size exceeds the 5 MB limit. Please upload a smaller image.',
        },
        { status: 400 }
      );
    }

    let filePath = '';
    let studentEmail = '';
    let studentName = '';
    let rollNumber = '';
    let amount = 0;
    let upiId = '';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Check Supabase if configured
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        // Fetch existing donation
        const { data: donation } = await supabase
          .from('donations')
          .select('*')
          .eq('payment_reference', paymentReference)
          .single();

        if (donation) {
          studentEmail = donation.student_email;
          studentName = donation.student_name;
          rollNumber = donation.roll_number;
          amount = donation.amount;
          upiId = donation.upi_id;
        }

        if (!studentName || studentName === 'Student') {
          const matched = MOCK_STUDENTS.find(
            (s) => s.roll_number.toUpperCase() === rollNumber
          );
          if (matched) {
            studentName = matched.student_name;
            if (!studentEmail) studentEmail = matched.email;
          }
        }

        // Try uploading to Supabase Storage bucket
        const fileExt = file.name.split('.').pop() || 'png';
        const storagePath = `proofs/${paymentReference}-${Date.now()}.${fileExt}`;

        const { data: storageUpload, error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && storageUpload) {
          filePath = storagePath;
        } else {
          console.warn(
            'Supabase storage upload notice:',
            uploadError?.message,
            '— Using data preview fallback.'
          );
          filePath = dataUri;
        }

        // Update database record with screenshot
        const { data: updateData, error: updateError } = await supabase
          .from('donations')
          .update({
            screenshot_url: filePath,
            status: 'awaiting_verification',
            receipt_email_sent: true,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_reference', paymentReference)
          .select();

        if (updateError || !updateData || updateData.length === 0) {
          console.warn(
            'Supabase donations update blocked by RLS policy. Saving fallback copy locally.'
          );
        }

        // Always save a synchronized copy in memory so Admin Dashboard can view it
        const syncDonation: Donation = {
          id: donation?.id || `don-${Date.now()}`,
          payment_reference: paymentReference,
          roll_number: rollNumber || 'UNKNOWN',
          student_name: studentName || 'Student',
          student_email: studentEmail,
          amount: amount || 30,
          upi_id: upiId || 'Campus Fund',
          recipient_name: 'Campus Donation',
          screenshot_url: dataUri,
          status: 'awaiting_verification',
          created_at: donation?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          receipt_email_sent: true,
        };
        saveMockDonation(syncDonation);

        // Send email confirming receipt of screenshot
        if (studentEmail) {
          await sendReceiptEmail({
            to: studentEmail,
            studentName,
            rollNumber,
            amount,
            paymentReference,
            upiId,
          });
        }

        return NextResponse.json({
          success: true,
          payment_reference: paymentReference,
          status: 'awaiting_verification',
          message:
            'Thank you for your contribution! Your payment screenshot has been submitted and is awaiting verification.',
        });
      }
    }

    // Mock / Local Fallback handling
    const mockDonation = getMockDonation(paymentReference);
    if (mockDonation) {
      mockDonation.screenshot_url = dataUri;
      mockDonation.status = 'awaiting_verification';
      mockDonation.updated_at = new Date().toISOString();
      mockDonation.receipt_email_sent = true;
      saveMockDonation(mockDonation);

      await sendReceiptEmail({
        to: mockDonation.student_email,
        studentName: mockDonation.student_name,
        rollNumber: mockDonation.roll_number,
        amount: mockDonation.amount,
        paymentReference,
        upiId: mockDonation.upi_id,
      });

      return NextResponse.json({
        success: true,
        payment_reference: paymentReference,
        status: 'awaiting_verification',
        message:
          'Thank you for your contribution! Your payment screenshot has been submitted and is awaiting verification.',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Payment record not found.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error handling screenshot upload:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while uploading screenshot.' },
      { status: 500 }
    );
  }
}
