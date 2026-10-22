import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Sliders,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  Eye,
  LogOut,
  UserCheck,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShieldLogo } from './ShieldLogo';
import { RoleType } from '../types';

export const Navbar: React.FC = () => {
  const { user, role, isExternal, logout, switchRole } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-[#2A2A2A]">
      {/* Top Demo Mode Banner */}
      <div className="bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#A3A3A3]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-ping" />
          <span className="font-semibold text-[#F5F5F5]">DEMO MODE ACTIVE</span>
          <span className="hidden sm:inline text-[#A3A3A3]">• Instant Role Switcher:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => switchRole('admin', false)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              role === 'admin'
                ? 'bg-[#BC0202] text-[#F5F5F5] font-semibold'
                : 'bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            Admin (Brand Mgr)
          </button>
          <button
            onClick={() => switchRole('creator', false)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              role === 'creator' && !isExternal
                ? 'bg-[#BC0202] text-[#F5F5F5] font-semibold'
                : 'bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            Creator (Internal)
          </button>
          <button
            onClick={() => switchRole('reviewer', false)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              role === 'reviewer'
                ? 'bg-[#BC0202] text-[#F5F5F5] font-semibold'
                : 'bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
          >
            Reviewer (Compliance)
          </button>
          <button
            onClick={() => switchRole('creator', true)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              role === 'creator' && isExternal
                ? 'bg-[#830000] text-[#F5F5F5] border border-[#BC0202]'
                : 'bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]'
            }`}
            title="External Agency Creator: Confidential brand docs hidden via RBAC"
          >
            <Lock size={10} />
            Agency (External)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-2.5 group">
            <ShieldLogo size={34} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-wider text-[#F5F5F5] group-hover:text-[#FF0000] transition-colors">
                  PLUMB
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#141414] text-[#A3A3A3] border border-[#2A2A2A]">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-[#A3A3A3] block -mt-0.5 font-medium tracking-wide">
                Every Detail. On Brand.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/app"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/app')
                ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/app/submissions"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/app/submissions')
                ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
            }`}
          >
            <FileText size={15} />
            <span>Submissions</span>
          </Link>

          {(role === 'reviewer' || role === 'admin') && (
            <Link
              to="/app/reviews"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/app/reviews')
                  ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
              }`}
            >
              <CheckSquare size={15} />
              <span>Review Queue</span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              to="/app/guidelines"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/app/guidelines')
                  ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
              }`}
            >
              <Sliders size={15} />
              <span>Guidelines</span>
            </Link>
          )}

          <Link
            to="/app/visual"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/app/visual')
                ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
            }`}
          >
            <Eye size={15} />
            <span>Visual & A11y</span>
          </Link>

          {(role === 'admin' || role === 'reviewer') && (
            <Link
              to="/app/analytics"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/app/analytics')
                  ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
              }`}
            >
              <BarChart3 size={15} />
              <span>Analytics</span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              to="/app/audit"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/app/audit')
                  ? 'bg-[#141414] text-[#FF0000] border-b-2 border-[#BC0202]'
                  : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Audit Log</span>
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <span className="block text-xs font-semibold text-[#F5F5F5]">
              {user?.full_name || 'Active User'}
            </span>
            <span className="block text-[11px] text-[#A3A3A3] capitalize">
              Role: <strong className="text-[#FF0000]">{role}</strong> {isExternal && '(External)'}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-md text-[#A3A3A3] hover:text-[#FF0000] hover:bg-[#141414] transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
