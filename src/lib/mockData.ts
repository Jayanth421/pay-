import { Student, UpiAccount, Donation } from './types';

// Pre-configured 4 UPI accounts rotated in order for each new payment request
export const CONFIGURED_UPI_ACCOUNTS: UpiAccount[] = [
  {
    id: 1,
    upi_id: 'campus.fund1@okhdfcbank',
    account_name: 'Campus Student Welfare Account A',
    slot_number: 1,
    is_active: true,
  },
  {
    id: 2,
    upi_id: 'campus.fund2@okaxis',
    account_name: 'Campus Cultural Welfare Account B',
    slot_number: 2,
    is_active: true,
  },
  {
    id: 3,
    upi_id: 'campus.fund3@paytm',
    account_name: 'Campus Fest & Charity Account C',
    slot_number: 3,
    is_active: true,
  },
  {
    id: 4,
    upi_id: 'campus.fund4@sbi',
    account_name: 'Campus Alumni & Development Fund D',
    slot_number: 4,
    is_active: true,
  },
];

// Student roster populated exactly from user's schema & data
export const MOCK_STUDENTS: Student[] = [
  { roll_number: '25H51A0465', student_name: 'A. Abhijeeth', email: '25h51a0465@cmrcet.ac.in' },
  { roll_number: '25H51A0466', student_name: 'ALASYAM TRINADH LAKSHMI REDDY', email: '25h51a0466@cmrcet.ac.in' },
  { roll_number: '25H51A0467', student_name: 'AMBATI HARI CHANDANA', email: '25h51a0467@cmrcet.ac.in' },
  { roll_number: '25H51A0468', student_name: 'BANDLA SAKETH', email: '25h51a0468@cmrcet.ac.in' },
  { roll_number: '25H51A0469', student_name: 'BAPANAPALLI RAKSHITHA', email: '25h51a0469@cmrcet.ac.in' },
  { roll_number: '25H51A0470', student_name: 'BATHUKU VAMSHI', email: '25h51a0470@cmrcet.ac.in' },
  { roll_number: '25H51A0471', student_name: 'BOINI ASHWITHA', email: '25h51a0471@cmrcet.ac.in' },
  { roll_number: '25H51A0472', student_name: 'BOLISETTY JASWANTH', email: '25h51a0472@cmrcet.ac.in' },
  { roll_number: '25H51A0473', student_name: 'BURUGU NITHYESH', email: '25h51a0473@cmrcet.ac.in' },
  { roll_number: '25H51A0474', student_name: 'C RAKESH', email: '25h51a0474@cmrcet.ac.in' },
  { roll_number: '25H51A0475', student_name: 'CHILUKURI VENKATA SAI VINESH', email: '25h51a0475@cmrcet.ac.in' },
  { roll_number: '25H51A0476', student_name: 'CHITTEPU MADHU KIRAN REDDY', email: '25h51a0476@cmrcet.ac.in' },
  { roll_number: '25H51A0477', student_name: 'DUGGIRALA SIVA VARDHAN', email: '25h51a0477@cmrcet.ac.in' },
  { roll_number: '25H51A0478', student_name: 'GANGI HARSHITHA', email: '25h51a0478@cmrcet.ac.in' },
  { roll_number: '25H51A0479', student_name: 'GANUPAKA JASHWANTH', email: '25h51a0479@cmrcet.ac.in' },
  { roll_number: '25H51A0480', student_name: 'GOPU SIDDARTH CHANDRA', email: '25h51a0480@cmrcet.ac.in' },
  { roll_number: '25H51A0481', student_name: 'GUDEPU RAGHUVARAN', email: '25h51a0481@cmrcet.ac.in' },
  { roll_number: '25H51A0482', student_name: 'GUNJI SRI LAXMI', email: '25h51a0482@cmrcet.ac.in' },
  { roll_number: '25H51A0483', student_name: 'GUNTAPALLI THARUN', email: '25h51a0483@cmrcet.ac.in' },
  { roll_number: '25H51A0484', student_name: 'HARSHIT SINGH', email: '25h51a0484@cmrcet.ac.in' },
  { roll_number: '25H51A0485', student_name: 'KARNATI JAYANTH', email: '25h51a0485@cmrcet.ac.in' },
  { roll_number: '25H51A0486', student_name: 'KATELLA BHARADWAJ', email: '25h51a0486@cmrcet.ac.in' },
  { roll_number: '25H51A0487', student_name: 'KATTA SAI TEJA REDDY', email: '25h51a0487@cmrcet.ac.in' },
  { roll_number: '25H51A0488', student_name: 'KATTHI MANESH', email: '25h51a0488@cmrcet.ac.in' },
  { roll_number: '25H51A0489', student_name: 'KOSANA SAMITHA', email: '25h51a0489@cmrcet.ac.in' },
  { roll_number: '25H51A0490', student_name: 'KOTHA KAMALAHASAN', email: '25h51a0490@cmrcet.ac.in' },
  { roll_number: '25H51A0491', student_name: 'KUMMARI AKSHAYA', email: '25h51a0491@cmrcet.ac.in' },
  { roll_number: '25H51A0492', student_name: 'KURUSAM VISHNU VARSHITH', email: '25h51a0492@cmrcet.ac.in' },
  { roll_number: '25H51A0493', student_name: 'LINGAM LALITH SAI ADITYA', email: '25h51a0493@cmrcet.ac.in' },
  { roll_number: '25H51A0494', student_name: 'M SWATHI', email: '25h51a0494@cmrcet.ac.in' },
  { roll_number: '25H51A0495', student_name: 'MACHKURI SANDEEP', email: '25h51a0495@cmrcet.ac.in' },
  { roll_number: '25H51A0496', student_name: 'MANTRARAJAM ABHIRAM', email: '25h51a0496@cmrcet.ac.in' },
  { roll_number: '25H51A0497', student_name: 'MARYALA SAMYUKTH', email: '25h51a0497@cmrcet.ac.in' },
  { roll_number: '25H51A0498', student_name: 'MEDISHETTI YASHWANTH', email: '25h51a0498@cmrcet.ac.in' },
  { roll_number: '25H51A0499', student_name: 'MOHAMMED AJMEERI', email: '25h51a0499@cmrcet.ac.in' },
  { roll_number: '25H51A04A0', student_name: 'MUDIREDDY YOGESWAR REDDY', email: '25h51a04a0@cmrcet.ac.in' },
  { roll_number: '25H51A04A1', student_name: 'MUTHYALA DRONA CHARY', email: '25h51a04a1@cmrcet.ac.in' },
  { roll_number: '25H51A04A2', student_name: 'MUTHYAMGARI RISHIKESH', email: '25h51a04a2@cmrcet.ac.in' },
  { roll_number: '25H51A04A3', student_name: 'MUTTUKURI SAMPATH MARUTHI', email: '25h51a04a3@cmrcet.ac.in' },
  { roll_number: '25H51A04A4', student_name: 'NANDIPATI SRUTHI', email: '25h51a04a4@cmrcet.ac.in' },
  { roll_number: '25H51A04A5', student_name: 'NEMLI VAISHNAVI', email: '25h51a04a5@cmrcet.ac.in' },
  { roll_number: '25H51A04A6', student_name: 'NETHI SAMEEKSHA', email: '25h51a04a6@cmrcet.ac.in' },
  { roll_number: '25H51A04A7', student_name: 'NUKALA VILAS', email: '25h51a04a7@cmrcet.ac.in' },
  { roll_number: '25H51A04A8', student_name: 'PINGILI SHASHIPRIYA', email: '25h51a04a8@cmrcet.ac.in' },
  { roll_number: '25H51A04A9', student_name: 'PODETI MEDHA MOULIK', email: '25h51a04a9@cmrcet.ac.in' },
  { roll_number: '25H51A04B0', student_name: 'POLEPALLY LAKSHMAN REDDY', email: '25h51a04b0@cmrcet.ac.in' },
  { roll_number: '25H51A04B1', student_name: 'PONNAPATI YOGITHA REDDY', email: '25h51a04b1@cmrcet.ac.in' },
  { roll_number: '25H51A04B2', student_name: 'PUNUGOTI SATHWIK RAO', email: '25h51a04b2@cmrcet.ac.in' },
  { roll_number: '25H51A04B3', student_name: 'PUTTA SHIVAMANI', email: '25h51a04b3@cmrcet.ac.in' },
  { roll_number: '25H51A04B4', student_name: 'RACHAVARAM SAI PRANEETH', email: '25h51a04b4@cmrcet.ac.in' },
  { roll_number: '25H51A04B5', student_name: 'REKULAPALLI ANYUTHA', email: '25h51a04b5@cmrcet.ac.in' },
  { roll_number: '25H51A04B6', student_name: 'RISHITHA P', email: '25h51a04b6@cmrcet.ac.in' },
  { roll_number: '25H51A04B7', student_name: 'SRUTHI K', email: '25h51a04b7@cmrcet.ac.in' },
  { roll_number: '25H51A04B8', student_name: 'SYED THAJMEEN', email: '25h51a04b8@cmrcet.ac.in' },
  { roll_number: '25H51A04B9', student_name: 'TALARI RAKESH', email: '25h51a04b9@cmrcet.ac.in' },
  { roll_number: '25H51A04C0', student_name: 'THADUR SIRI SAHASRA', email: '25h51a04c0@cmrcet.ac.in' },
  { roll_number: '25H51A04C1', student_name: 'THOKALA ASHRITHA', email: '25h51a04c1@cmrcet.ac.in' },
  { roll_number: '25H51A04C2', student_name: 'UTHKAM ANUDEEP', email: '25h51a04c2@cmrcet.ac.in' },
  { roll_number: '25H51A04C4', student_name: 'VEDURUVALASA MANASVI', email: '25h51a04c4@cmrcet.ac.in' },
  { roll_number: '25H51A04C5', student_name: 'VEERLAPATI SAI TRIVIKRAM', email: '25h51a04c5@cmrcet.ac.in' },
  { roll_number: '25H51A04C7', student_name: 'VODNALA VARSHINI', email: '25h51a04c7@cmrcet.ac.in' },
  { roll_number: '25H51A04C8', student_name: 'YELLAPRAGADA VENKATA NAGA SAI VAISHNAV', email: '25h51a04c8@cmrcet.ac.in' },
  { roll_number: '25H55A0409', student_name: 'POKALA DILIP', email: '25h55a0409@cmrcet.ac.in' },
  { roll_number: '26H55A0407', student_name: 'Sandupatla Abhiraj', email: '26h55a0407@cmrcet.ac.in' },
  { roll_number: '26H55A0408', student_name: 'KORABONI LASYA PRIYA', email: '26h55a0408@cmrcet.ac.in' },
  { roll_number: '26H55A0409', student_name: 'P.Dilip', email: '26h55a0409@cmrcet.ac.in' },
  { roll_number: '26H55A0410', student_name: 'BHUKYA SANTHOSH NAIK', email: '26h55a0410@cmrcet.ac.in' },
  { roll_number: '26H55A0411', student_name: 'JINDAM AKSHAYA', email: '26h55a0411@cmrcet.ac.in' },
  { roll_number: '26H55A0412', student_name: 'RANGU VYSHNAVI', email: '26h55a0412@cmrcet.ac.in' },
  { roll_number: '26H55A0413', student_name: 'SEEDARLA SHRUTHI', email: '26h55a0413@cmrcet.ac.in' },
  { roll_number: '26H55A0414', student_name: 'NARAMAN NAMITHA', email: '26h55a0414@cmrcet.ac.in' },
];

// Global in-memory storage for local demo fallback
declare global {
  // eslint-disable-next-line no-var
  var __mockRotationIndex: number | undefined;
  // eslint-disable-next-line no-var
  var __mockDonations: Map<string, Donation> | undefined;
  // eslint-disable-next-line no-var
  var __mockEmailLogs: Array<{
    to: string;
    type: string;
    subject: string;
    timestamp: string;
    details: Record<string, unknown>;
  }> | undefined;
}

if (!globalThis.__mockDonations) {
  globalThis.__mockDonations = new Map<string, Donation>();
}

if (!globalThis.__mockEmailLogs) {
  globalThis.__mockEmailLogs = [];
}

if (typeof globalThis.__mockRotationIndex === 'undefined') {
  globalThis.__mockRotationIndex = 0;
}

export function getNextMockUpi(): UpiAccount {
  const accounts = CONFIGURED_UPI_ACCOUNTS;
  const currentIndex = globalThis.__mockRotationIndex ?? 0;
  const selected = accounts[currentIndex % accounts.length];
  globalThis.__mockRotationIndex = (currentIndex + 1) % accounts.length;
  return selected;
}

export function saveMockDonation(donation: Donation): void {
  globalThis.__mockDonations?.set(donation.payment_reference, donation);
}

export function getMockDonation(ref: string): Donation | undefined {
  return globalThis.__mockDonations?.get(ref);
}

export function getAllMockDonations(): Donation[] {
  if (!globalThis.__mockDonations) return [];
  return Array.from(globalThis.__mockDonations.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function updateMockDonationStatus(
  ref: string,
  status: Donation['status'],
  rejectionReason?: string
): Donation | null {
  const donation = globalThis.__mockDonations?.get(ref);
  if (!donation) return null;
  donation.status = status;
  donation.updated_at = new Date().toISOString();
  if (rejectionReason) donation.rejection_reason = rejectionReason;
  if (status === 'approved') donation.verified_at = new Date().toISOString();
  return donation;
}

export function logMockEmail(
  to: string,
  type: string,
  subject: string,
  details: Record<string, unknown>
) {
  globalThis.__mockEmailLogs?.unshift({
    to,
    type,
    subject,
    timestamp: new Date().toISOString(),
    details,
  });
}

export function getMockEmailLogs() {
  return globalThis.__mockEmailLogs ?? [];
}
