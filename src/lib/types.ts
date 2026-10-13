export interface Student {
  roll_number: string;
  student_name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  // compatibility alias
  name?: string;
}

export interface StudentInfo {
  name?: string;
  student_name?: string;
  roll_number: string;
  email?: string;
  department?: string;
}

export interface UpiAccount {
  id: number;
  upi_id: string;
  account_name: string;
  slot_number: number;
  total_assigned?: number;
  is_active: boolean;
}

export type DonationStatus = 'pending_payment' | 'awaiting_verification' | 'approved' | 'rejected';

export interface Donation {
  id: string;
  payment_reference: string;
  roll_number: string;
  student_name: string;
  student_email: string;
  amount: number;
  upi_account_id?: number;
  upi_id: string;
  recipient_name: string;
  screenshot_url?: string;
  screenshot_signed_url?: string;
  status: DonationStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  receipt_email_sent?: boolean;
  confirmation_email_sent?: boolean;
}

export interface VerifyStudentResponse {
  success: boolean;
  message?: string;
  already_donated?: boolean;
  existing_donation?: {
    payment_reference: string;
    amount: number;
    status: DonationStatus;
    created_at: string;
  } | null;
  student?: {
    name: string;
    student_name: string;
    roll_number: string;
    email: string;
  };
}

export interface InitiatePaymentResponse {
  success: boolean;
  payment_reference: string;
  upi_id: string;
  recipient_name: string;
  amount: number;
  upi_uri: string;
}
