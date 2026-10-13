'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Donation } from '@/lib/types';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Mail,
  X,
  AlertTriangle,
  LogOut,
  IndianRupee,
  Layers,
} from 'lucide-react';

interface EmailLogItem {
  to: string;
  type: string;
  subject: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'emails'>('submissions');

  // Modal state for screenshot viewer
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    ref: string;
    studentName: string;
    amount: number;
  } | null>(null);

  // Reject confirmation modal
  const [rejectModal, setRejectModal] = useState<{
    ref: string;
    reason: string;
  } | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/donations');
      const data = await res.json();
      if (data.success) {
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails');
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.emails || []);
      }
    } catch (err) {
      console.error('Error fetching email logs:', err);
    }
  }, []);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('campus_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }

    fetchDonations();
    fetchEmailLogs();
  }, [router, fetchDonations, fetchEmailLogs]);

  const handleLogout = () => {
    sessionStorage.removeItem('campus_admin_auth');
    sessionStorage.removeItem('campus_admin_email');
    router.push('/admin/login');
  };

  const handleApprove = async (ref: string) => {
    const confirmed = window.confirm(
      `Confirm Verification: Have you verified the bank transaction for reference ${ref}?\n\nThis will mark the donation as Approved and send the official confirmation receipt email to the student.`
    );
    if (!confirmed) return;

    setActionLoading(ref);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_reference: ref,
          action: 'approve',
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchDonations();
        await fetchEmailLogs();
      } else {
        alert(data.message || 'Failed to approve submission');
      }
    } catch (err) {
      console.error('Error approving donation:', err);
      alert('Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    const ref = rejectModal.ref;
    const reason = rejectModal.reason.trim() || 'Payment screenshot could not be reconciled with campus bank statements.';

    setActionLoading(ref);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_reference: ref,
          action: 'reject',
          rejection_reason: reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRejectModal(null);
        await fetchDonations();
        await fetchEmailLogs();
      } else {
        alert(data.message || 'Failed to reject submission');
      }
    } catch (err) {
      console.error('Error rejecting donation:', err);
      alert('Error rejecting submission');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    const matchesFilter =
      statusFilter === 'all'
        ? true
        : statusFilter === 'awaiting'
        ? d.status === 'awaiting_verification'
        : d.status === statusFilter;

    const matchesSearch =
      d.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Calculate Metrics
  const totalSubmissions = donations.length;
  const pendingCount = donations.filter(
    (d) => d.status === 'awaiting_verification'
  ).length;
  const approvedCount = donations.filter((d) => d.status === 'approved').length;
  const totalRaised = donations
    .filter((d) => d.status === 'approved')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col font-sans">
      <Navbar isAdmin={true} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFDE59] border-2 border-black shadow-[2px_2px_0px_#000] text-black">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Finance Verification Panel
              </h1>
            </div>
            <p className="text-xs font-bold text-zinc-600 mt-1">
              Verify transactions against official bank records before approving.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                fetchDonations();
                fetchEmailLogs();
              }}
              className="py-2.5 px-3.5 rounded-xl bg-white border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:bg-zinc-100 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2.5 px-3.5 rounded-xl bg-[#FEE2E2] border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:bg-[#fca5a5] text-black text-xs font-black flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_#000]">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
              Total Submissions
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-black">
                {totalSubmissions}
              </span>
              <span className="p-1.5 rounded-lg bg-zinc-100 border border-black text-black">
                <Layers className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_#000]">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
              Awaiting Verification
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-black">
                {pendingCount}
              </span>
              <span className="p-1.5 rounded-lg bg-[#FFDE59] border border-black text-black">
                <Clock className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_#000]">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
              Approved Donations
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-black">
                {approvedCount}
              </span>
              <span className="p-1.5 rounded-lg bg-[#4ADE80] border border-black text-black">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-[2.5px] border-black shadow-[4px_4px_0px_#000]">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
              Verified Raised
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-black flex items-center">
                <IndianRupee className="w-6 h-6 inline stroke-[3]" />
                {totalRaised}
              </span>
              <span className="p-1.5 rounded-lg bg-[#C084FC] border border-black text-black">
                <IndianRupee className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector & Filter Box */}
        <div className="bg-white rounded-2xl border-[2.5px] border-black shadow-[5px_5px_0px_#000] overflow-hidden mb-8">
          <div className="p-4 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-2 px-3.5 rounded-xl text-xs font-black border-2 border-black transition cursor-pointer ${
                  activeTab === 'submissions'
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                Submissions ({filteredDonations.length})
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`py-2 px-3.5 rounded-xl text-xs font-black border-2 border-black transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'emails'
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Audit Log ({emailLogs.length})</span>
              </button>
            </div>

            {activeTab === 'submissions' && (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roll, name, ref..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border-2 border-black rounded-xl font-bold focus:outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-white border-2 border-black rounded-xl text-black font-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="awaiting">Awaiting Verification</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending_payment">Pending Payment</option>
                </select>
              </div>
            )}
          </div>

          {/* Submissions Table */}
          {activeTab === 'submissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b-2 border-black text-black font-black uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Amount & Ref</th>
                    <th className="py-3 px-4">Recipient UPI</th>
                    <th className="py-3 px-4 text-center">Screenshot Proof</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-100">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 font-bold">
                        {loading ? 'Loading submissions...' : 'No donations match your filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((d) => {
                      const proofUrl = d.screenshot_signed_url || d.screenshot_url;

                      return (
                        <tr
                          key={d.payment_reference}
                          className="hover:bg-[#FEFCE8]/50 transition-colors"
                        >
                          {/* Student Details */}
                          <td className="py-3.5 px-4">
                            <span className="font-black text-black block text-sm">
                              {d.student_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-zinc-600 mt-0.5 font-bold">
                              <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded border border-black text-black font-black text-[11px]">
                                {d.roll_number}
                              </span>
                              <span className="text-[11px] truncate max-w-[150px]">
                                {d.student_email}
                              </span>
                            </div>
                          </td>

                          {/* Amount & Ref */}
                          <td className="py-3.5 px-4">
                            <span className="font-black text-black text-base block">
                              ₹{d.amount}
                            </span>
                            <span className="font-mono text-black font-black text-[11px] block">
                              {d.payment_reference}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold block">
                              {new Date(d.created_at).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Recipient UPI */}
                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-black">
                            <span className="block truncate max-w-[170px]" title={d.upi_id}>
                              {d.upi_id}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-sans block truncate max-w-[170px]">
                              {d.recipient_name}
                            </span>
                          </td>

                          {/* Screenshot Proof */}
                          <td className="py-3.5 px-4 text-center">
                            {proofUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    url: proofUrl,
                                    ref: d.payment_reference,
                                    studentName: d.student_name,
                                    amount: d.amount,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black font-black text-[11px] hover:bg-[#FFDE59] transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                              >
                                <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>View Proof</span>
                              </button>
                            ) : (
                              <span className="text-zinc-400 text-[11px] font-bold italic">
                                Not uploaded
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {d.status === 'awaiting_verification' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFDE59] border-2 border-black text-black font-black text-[10px] shadow-[1.5px_1.5px_0px_#000]">
                                <Clock className="w-3 h-3 animate-spin stroke-[2.5]" />
                                <span>Awaiting Verification</span>
                              </span>
                            )}
                            {d.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4ADE80] border-2 border-black text-black font-black text-[10px] shadow-[1.5px_1.5px_0px_#000]">
                                <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                                <span>Approved</span>
                              </span>
                            )}
                            {d.status === 'rejected' && (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FB7185] border-2 border-black text-black font-black text-[10px] shadow-[1.5px_1.5px_0px_#000]"
                                title={d.rejection_reason || ''}
                              >
                                <XCircle className="w-3 h-3 stroke-[2.5]" />
                                <span>Rejected</span>
                              </span>
                            )}
                            {d.status === 'pending_payment' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 border-2 border-black text-black font-black text-[10px] shadow-[1.5px_1.5px_0px_#000]">
                                <span>QR Generated</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {d.status === 'awaiting_verification' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(d.payment_reference)}
                                    disabled={actionLoading === d.payment_reference}
                                    className="py-1.5 px-3 rounded-xl bg-[#4ADE80] hover:bg-[#22c55e] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectModal({
                                        ref: d.payment_reference,
                                        reason: '',
                                      })
                                    }
                                    disabled={actionLoading === d.payment_reference}
                                    className="py-1.5 px-2.5 rounded-xl bg-[#FB7185] hover:bg-[#f43f5e] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-zinc-500 font-bold text-[11px]">
                                  {d.status === 'approved' ? 'Verified' : 'Processed'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Email Audit Log Tab */}
          {activeTab === 'emails' && (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  Transactional Emails Dispatched Via Resend
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  {process.env.NEXT_PUBLIC_APP_URL || 'Live delivery status'}
                </span>
              </div>
              <div className="space-y-2.5">
                {emailLogs.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-6 text-center font-bold">
                    No emails logged yet. Emails are sent via Resend upon screenshot upload and approval.
                  </p>
                ) : (
                  emailLogs.map((log, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl bg-[#FAF9F6] border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-black ${
                              log.type.includes('approval')
                                ? 'bg-[#4ADE80] text-black'
                                : log.type.includes('reject')
                                ? 'bg-[#FB7185] text-black'
                                : 'bg-[#BAE6FD] text-black'
                            }`}
                          >
                            {log.type.includes('approval')
                              ? 'Verified Receipt'
                              : log.type.includes('reject')
                              ? 'Rejection Notice'
                              : 'Screenshot Acknowledged'}
                          </span>
                          <span className="font-black text-black">
                            {log.to}
                          </span>
                        </div>
                        <p className="text-zinc-700 mt-1 font-mono font-bold text-[11px]">
                          {log.subject}
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border-[3px] border-black shadow-[8px_8px_0px_#000] animate-fadeIn">
            <div className="p-4 bg-[#FFDE59] border-b-2 border-black flex items-center justify-between text-black">
              <div>
                <span className="text-xs font-mono font-black">
                  Ref: {previewImage.ref}
                </span>
                <p className="text-sm font-black">
                  {previewImage.studentName} — ₹{previewImage.amount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl bg-white border-2 border-black hover:bg-zinc-100 text-black transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 bg-zinc-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={`Proof for ${previewImage.ref}`}
                className="max-h-[65vh] object-contain rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]"
              />
            </div>

            <div className="p-3 bg-white border-t-2 border-black flex items-center justify-between text-xs font-bold text-black">
              <span className="text-[11px] text-zinc-600">
                Private Supabase Storage Secure Viewer
              </span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                className="font-black underline flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-[3px] border-black shadow-[8px_8px_0px_#000]">
            <div className="flex items-center gap-2.5 text-black mb-3">
              <span className="p-2 bg-[#FB7185] border-2 border-black rounded-xl">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h3 className="font-black text-lg text-black">
                Reject Submission (Ref: {rejectModal.ref})
              </h3>
            </div>
            <p className="text-xs font-bold text-zinc-700 mb-4">
              Enter reason for rejection. An email notification will be dispatched to the student.
            </p>

            <textarea
              rows={3}
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              placeholder="e.g. Transaction UTR does not appear in college bank statement."
              className="w-full p-3 text-xs bg-[#FAF9F6] border-2 border-black rounded-xl font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000] mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="py-2 px-3.5 rounded-xl bg-white border-2 border-black text-xs font-black text-black hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectModal.ref}
                className="py-2 px-4 rounded-xl bg-[#FB7185] hover:bg-[#f43f5e] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
