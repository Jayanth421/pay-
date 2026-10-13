import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { getAllMockDonations, getMockDonation } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase admin donations error:', error);
          return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        // Generate signed URLs or check fallback screenshots
        const donationsWithSignedUrls = await Promise.all(
          (data || []).map(async (donation) => {
            const mock = getMockDonation(donation.payment_reference);
            let screenshot = donation.screenshot_url || mock?.screenshot_url || null;
            let currentStatus = donation.status;

            if (mock && mock.status !== 'pending_payment' && donation.status === 'pending_payment') {
              currentStatus = mock.status;
            }

            if (screenshot && !screenshot.startsWith('data:') && !screenshot.startsWith('http')) {
              try {
                const { data: signed } = await supabase.storage
                  .from('payment-screenshots')
                  .createSignedUrl(screenshot, 3600);

                if (signed?.signedUrl) {
                  return {
                    ...donation,
                    status: currentStatus,
                    screenshot_url: screenshot,
                    screenshot_signed_url: signed.signedUrl,
                  };
                }
              } catch {
                // ignore
              }
            }

            return {
              ...donation,
              status: currentStatus,
              screenshot_url: screenshot,
              screenshot_signed_url: screenshot,
            };
          })
        );

        return NextResponse.json({
          success: true,
          donations: donationsWithSignedUrls,
          isLiveSupabase: true,
        });
      }
    }

    // Local / Mock fallback
    const mockList = getAllMockDonations().map((d) => ({
      ...d,
      screenshot_signed_url: d.screenshot_url,
    }));

    return NextResponse.json({
      success: true,
      donations: mockList,
      isLiveSupabase: false,
    });
  } catch (error) {
    console.error('Error in admin donations list:', error);
    return NextResponse.json(
      { success: false, message: 'Server error loading donations' },
      { status: 500 }
    );
  }
}
