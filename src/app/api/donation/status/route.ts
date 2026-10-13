import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { getMockDonation } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref')?.trim();

    if (!ref) {
      return NextResponse.json(
        { success: false, message: 'Reference is required' },
        { status: 400 }
      );
    }

    if (isSupabaseAdminConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('payment_reference', ref)
          .single();

        if (data && !error) {
          return NextResponse.json({
            success: true,
            donation: data,
          });
        }
      }
    }

    const mockDonation = getMockDonation(ref);
    if (mockDonation) {
      return NextResponse.json({
        success: true,
        donation: mockDonation,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Donation not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
