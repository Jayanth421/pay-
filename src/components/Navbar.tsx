'use client';

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck, ExternalLink } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  return (
    <header className="w-full bg-white border-b-[2.5px] border-black sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#FFDE59] border-2 border-black shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center text-black font-extrabold group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <HeartHandshake className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-black text-xl leading-none tracking-tight block">
              CMR<span className="text-[#22c55e]">Give</span>
            </span>
            <span className="text-[11px] text-zinc-700 font-bold block">
              Campus Welfare Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-black px-3 py-1 rounded-full bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>4x Rotating UPI Nodes</span>
          </div>

          {isAdmin ? (
            <Link
              href="/"
              className="text-xs sm:text-sm font-black text-black bg-white hover:bg-zinc-100 transition flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
            >
              <span>Student Flow</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-black text-black bg-[#FFDE59] hover:bg-[#fed736] transition flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
