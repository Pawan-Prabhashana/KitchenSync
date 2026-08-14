import React, { useState } from 'react';
import { DEMO_USERS } from '../data/menu';
import { User } from '../types';
import { api, ApiError, DEMO_PASSWORD } from '../lib/api';

interface LoginPageProps {
  onAuthSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const doLogin = async (emailArg: string, passwordArg: string) => {
    setBusy(true);
    setError('');
    try {
      const { user } = await api.login(emailArg, passwordArg);
      onAuthSuccess(user);
    } catch (err) {
      if (err instanceof ApiError && err.isNetwork) {
        setError('Cannot reach the API. Is the server running on port 4000? (npm run server)');
      } else if (err instanceof ApiError && err.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to KitchenSync</h2>
        <p className="text-sm text-slate-500 mb-4">
          Use a demo account below, or sign in with a demo email (password <code className="font-mono text-slate-700">{DEMO_PASSWORD}</code>).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kitchensync.com"
              className="w-full mt-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={DEMO_PASSWORD}
              className="w-full mt-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            disabled={busy}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-sm">
          <div className="text-xs font-semibold text-slate-500 mb-2">Quick demo logins</div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.slice(0, 6).map(u => (
              <button
                key={u.id}
                disabled={busy}
                onClick={() => doLogin(u.email, DEMO_PASSWORD)}
                className="p-2 rounded-xl border border-slate-200 text-left flex items-center gap-2 hover:bg-slate-50 disabled:opacity-60"
              >
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="text-xs font-medium truncate">{u.name.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <a href="#/signup" className="text-emerald-600 font-medium">Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
