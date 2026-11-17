'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle,
  ChefHat,
} from 'lucide-react';
import { adminAuthApi } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('ops@zapeat.online');
  const [password, setPassword] = useState('ZapeatAdmin@2025');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminAuthApi.login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check network connection.');
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('ZapeatAdmin@2025');
    setError(null);
  };

  return (
    <div className="w-full max-w-md z-10">
      {/* Header Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3FA366] to-[#5BBF7F] text-3xl shadow-xl shadow-emerald-950/60 mb-4">
          🌿
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          Zapeat Operations
        </h1>
        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#3FA366]" /> Bengaluru Central Operations Console
        </p>
      </div>

      {/* Card Body */}
      <div className="bg-[#161B22] rounded-[22px] border border-[#30363D] p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Sign In</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Enter your operations credentials to access the live dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zapeat.online"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3FA366] focus:ring-1 focus:ring-[#3FA366] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-gray-400 cursor-not-allowed">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3FA366] focus:ring-1 focus:ring-[#3FA366] transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#30363D] text-[#3FA366] focus:ring-[#3FA366] bg-[#0D1117]"
              />
              <span>Keep session active</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-[#3FA366] hover:bg-[#2E7D4F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Credentials for Dev/Demo */}
        <div className="mt-6 pt-5 border-t border-[#30363D]/80">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2 text-center">
            Quick Test Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ops@zapeat.online')}
              className="p-2 rounded-xl bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-left transition-colors"
            >
              <p className="text-xs font-semibold text-white">Ops Lead</p>
              <p className="text-[10px] text-gray-400 truncate">ops@zapeat.online</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@zapeat.online')}
              className="p-2 rounded-xl bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-left transition-colors"
            >
              <p className="text-xs font-semibold text-white">Super Admin</p>
              <p className="text-[10px] text-gray-400 truncate">admin@zapeat.online</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-gray-400 mt-6 font-mono">
        Zapeat Operations System • Internal Bengaluru Dispatch Only
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#3FA366]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <Suspense
        fallback={
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
