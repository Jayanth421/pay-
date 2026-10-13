import { NextResponse } from 'next/server';
import { getMockEmailLogs } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    emails: getMockEmailLogs(),
  });
}
