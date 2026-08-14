import React, { useState } from 'react';
import { X, Shield, Sparkles } from 'lucide-react';
import { User, Role } from '../types';
import { DEMO_USERS, DEMO_RIDERS } from '../data/menu';
import { api, ApiError, DEMO_PASSWORD } from '../lib/api';

interface AuthModalProps {
  currentUser: User | null;
  onClose: () => void;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onUserChanged
}) => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<Role>('chef');
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  const describeError = (err: unknown): string => {
    if (err instanceof ApiError && err.isNetwork) return 'Cannot reach the API (start it with npm run server).';
    if (err instanceof ApiError && err.status === 401) return 'Invalid email or password.';
    if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') return 'That email is already registered.';
    return err instanceof Error ? err.message : 'Authentication failed.';
  };

  // Quick-login switches persona by logging in through the API with the seeded demo password.
  const handleQuickLogin = async (user: User) => {
    setBusy(true);
    setError('');
    try {
      const { user: authed } = await api.login(user.email, DEMO_PASSWORD);
      onUserChanged(authed);
      onClose();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = isRegistering
        ? await api.register({ name: name || 'Staff Member', email, password, role })
        : await api.login(email, password);
      onUserChanged(user);
      onClose();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const chefs = DEMO_USERS.filter(u => u.role === 'chef');
  const waiters = DEMO_USERS.filter(u => u.role === 'waiter');
  const riders = DEMO_RIDERS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">KitchenSync Account & Roles</h2>
              <p className="text-xs text-slate-500">JWT Authenticated Role Switcher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Demo Login Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Quick Login
              </span>
              <span className="text-[11px] text-slate-400">Click to switch persona</span>
            </div>

            {/* Chefs */}
            <div className="mb-3">
              <div className="text-[11px] font-bold text-emerald-800 uppercase mb-1">Chefs (Advances orders, Cooks)</div>
              <div className="grid grid-cols-3 gap-2">
                {chefs.map(chef => (
                  <button
                    key={chef.id}
                    onClick={() => handleQuickLogin(chef)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      currentUser?.id === chef.id
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <img src={chef.avatar} alt={chef.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{chef.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">Chef</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Waiters */}
            <div className="mb-3">
              <div className="text-[11px] font-bold text-blue-800 uppercase mb-1">Waiters (Creates orders, Serves)</div>
              <div className="grid grid-cols-3 gap-2">
                {waiters.map(waiter => (
                  <button
                    key={waiter.id}
                    onClick={() => handleQuickLogin(waiter)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      currentUser?.id === waiter.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <img src={waiter.avatar} alt={waiter.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{waiter.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">Waiter</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Riders */}
            <div>
              <div className="text-[11px] font-bold text-indigo-800 uppercase mb-1">Riders (Delivery dispatch)</div>
              <div className="grid grid-cols-3 gap-2">
                {riders.map(rider => (
                  <button
                    key={rider.id}
                    onClick={() => handleQuickLogin(rider)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      currentUser?.id === rider.id
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <img src={rider.avatar} alt={rider.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{rider.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">Rider</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-semibold">Or Custom Auth</span></div>
          </div>

          {/* Custom Credentials Form */}
          <form onSubmit={handleCustomAuth} className="space-y-3">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@kitchensync.com"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? 'Choose a password' : `Demo: ${DEMO_PASSWORD}`}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Role</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="role"
                      value="chef"
                      checked={role === 'chef'}
                      onChange={() => setRole('chef')}
                    />
                    Chef
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="role"
                      value="waiter"
                      checked={role === 'waiter'}
                      onChange={() => setRole('waiter')}
                    />
                    Waiter
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="role"
                      value="rider"
                      checked={role === 'rider'}
                      onChange={() => setRole('rider')}
                    />
                    Rider
                  </label>
                </div>
              </div>
            )}

            {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {busy ? 'Please wait…' : isRegistering ? 'Register Staff Account' : 'Sign in as this user'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-emerald-600 font-medium hover:underline"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register new staff"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
