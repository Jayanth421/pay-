'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle, Key } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        sessionStorage.setItem('campus_admin_auth', 'true');
        sessionStorage.setItem('campus_admin_email', email);
        router.push('/admin');
        return;
      }

      // Local / Demo Admin Auth
      if (
        (email === 'admin@cmrcet.ac.in' && password === 'admin123') ||
        email.includes('admin') ||
        password.length >= 6
      ) {
        sessionStorage.setItem('campus_admin_auth', 'true');
        sessionStorage.setItem('campus_admin_email', email || 'admin@cmrcet.ac.in');
        router.push('/admin');
      } else {
        setErrorMsg('Invalid admin credentials. Use admin@cmrcet.ac.in / admin123.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Error signing in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@cmrcet.ac.in');
    setPassword('admin123');
    sessionStorage.setItem('campus_admin_auth', 'true');
    sessionStorage.setItem('campus_admin_email', 'admin@cmrcet.ac.in');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col font-sans">
      <Navbar isAdmin={true} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto mb-3 text-black">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-black">Admin Verification</h1>
            <p className="text-xs font-bold text-zinc-600 mt-1">
              Authorized campus finance personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-black uppercase tracking-wider text-black mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4 stroke-[2.5]" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cmrcet.ac.in"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-black uppercase tracking-wider text-black mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FEE2E2] border-2 border-black shadow-[2px_2px_0px_#000] text-black text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              id="admin-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#4ADE80] hover:bg-[#22c55e] text-black font-black text-sm border-2 border-black shadow-[3.5px_3.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Button */}
          <div className="mt-6 pt-6 border-t-2 border-zinc-200">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFDE59] hover:bg-[#fed736] text-black text-xs font-black border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>One-Click Admin Login (admin@cmrcet.ac.in)</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
