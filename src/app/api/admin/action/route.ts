import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { updateMockDonationStatus, getMockDonation } from '@/lib/mockData';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_reference, action, rejection_reason } = body;

    if (!payment_reference || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action or missing payment reference.' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        // Fetch donation record
        const { data: donation, error: fetchError } = await supabase
          .from('donations')
          .select('*')
          .eq('payment_reference', payment_reference)
          .single();

        if (fetchError || !donation) {
          return NextResponse.json(
            { success: false, message: 'Donation not found' },
            { status: 404 }
          );
        }

        // Update donation
        const updateData: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (action === 'approve') {
          updateData.verified_at = new Date().toISOString();
          updateData.confirmation_email_sent = true;
        } else {
          updateData.rejection_reason = rejection_reason || 'Screenshot or transaction verification failed.';
        }

        const { error: updateError } = await supabase
          .from('donations')
          .update(updateData)
          .eq('payment_reference', payment_reference);

        if (updateError) {
          return NextResponse.json(
            { success: false, message: updateError.message },
            { status: 500 }
          );
        }

        // Send payment confirmation email ONLY after admin verifies and approves
        if (action === 'approve') {
          await sendApprovalEmail({
            to: donation.student_email,
            studentName: donation.student_name,
            rollNumber: donation.roll_number,
            amount: donation.amount,
            paymentReference: donation.payment_reference,
            upiId: donation.upi_id,
          });
        } else {
          await sendRejectionEmail({
            to: donation.student_email,
            studentName: donation.student_name,
            rollNumber: donation.roll_number,
            amount: donation.amount,
            paymentReference: donation.payment_reference,
            rejectionReason: rejection_reason,
          });
        }

        return NextResponse.json({
          success: true,
          status: newStatus,
          message: action === 'approve' ? 'Donation approved & confirmation email sent' : 'Donation rejected',
        });
      }
    }

    // Mock fallback
    const updated = updateMockDonationStatus(payment_reference, newStatus, rejection_reason);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Donation not found in mock store' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      await sendApprovalEmail({
        to: updated.student_email,
        studentName: updated.student_name,
        rollNumber: updated.roll_number,
        amount: updated.amount,
        paymentReference: updated.payment_reference,
        upiId: updated.upi_id,
      });
    } else {
      await sendRejectionEmail({
        to: updated.student_email,
        studentName: updated.student_name,
        rollNumber: updated.roll_number,
        amount: updated.amount,
        paymentReference: updated.payment_reference,
        rejectionReason: rejection_reason,
      });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: action === 'approve' ? 'Donation approved & confirmation email sent' : 'Donation rejected',
    });
  } catch (error) {
    console.error('Error handling admin action:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
