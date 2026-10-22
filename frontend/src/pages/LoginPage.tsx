import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShieldLogo } from '../components/ShieldLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('creator@plumb.brand');
  const [password, setPassword] = useState('creator123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (uEmail: string, uPass: string) => {
    setEmail(uEmail);
    setPassword(uPass);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #BC0202 0%, #830000 60%, transparent 80%)',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <ShieldLogo size={56} className="mx-auto mb-3" />
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
          Sign in to <span className="text-[#FF0000]">PLUMB</span>
        </h1>
        <p className="mt-1 text-xs text-[#A3A3A3] font-medium tracking-wide">
          "Every Detail. On Brand." · Pre-Publication Governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0A0A0A] py-8 px-6 sm:px-10 rounded-xl border border-[#830000]/60 glow-card shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-[#830000]/40 border border-[#BC0202] text-xs text-[#F5F5F5] flex items-center gap-2">
              <AlertCircle size={16} className="text-[#FF0000] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] placeholder-[#A3A3A3]/50 text-sm focus:border-[#BC0202] focus:ring-1 focus:ring-[#FF0000] transition-colors"
                  placeholder="name@plumb.brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] placeholder-[#A3A3A3]/50 text-sm focus:border-[#BC0202] focus:ring-1 focus:ring-[#FF0000] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(188,2,2,0.4)] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo Credentials & Quick Switch Buttons */}
          <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
            <span className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider text-center mb-3">
              1-Click Demo Accounts (Local Mode)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect('creator@plumb.brand', 'creator123')}
                className={`p-2 rounded text-left border transition-all ${
                  email === 'creator@plumb.brand'
                    ? 'border-[#BC0202] bg-[#141414] text-[#F5F5F5]'
                    : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3] hover:border-[#830000]'
                }`}
              >
                <span className="font-bold text-[#F5F5F5] block">Creator (Internal)</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono">creator123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('reviewer@plumb.brand', 'reviewer123')}
                className={`p-2 rounded text-left border transition-all ${
                  email === 'reviewer@plumb.brand'
                    ? 'border-[#BC0202] bg-[#141414] text-[#F5F5F5]'
                    : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3] hover:border-[#830000]'
                }`}
              >
                <span className="font-bold text-[#F5F5F5] block">Reviewer (Lead)</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono">reviewer123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('admin@plumb.brand', 'admin123')}
                className={`p-2 rounded text-left border transition-all ${
                  email === 'admin@plumb.brand'
                    ? 'border-[#BC0202] bg-[#141414] text-[#F5F5F5]'
                    : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3] hover:border-[#830000]'
                }`}
              >
                <span className="font-bold text-[#F5F5F5] block">Admin (Brand Mgr)</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('agency@partner.agency', 'agency123')}
                className={`p-2 rounded text-left border transition-all ${
                  email === 'agency@partner.agency'
                    ? 'border-[#BC0202] bg-[#141414] text-[#F5F5F5]'
                    : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3] hover:border-[#830000]'
                }`}
              >
                <span className="font-bold text-[#F5F5F5] block">Agency (External)</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono">agency123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
