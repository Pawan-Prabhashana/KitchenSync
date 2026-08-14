import React, { useState } from 'react';
import { User, Role } from '../types';
import { api, ApiError } from '../lib/api';

interface SignupPageProps {
  onAuthSuccess: (user: User) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('waiter');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await api.register({ name, email, password, role });
      onAuthSuccess(user);
    } catch (err) {
      if (err instanceof ApiError && err.isNetwork) {
        setError('Cannot reach the API. Is the server running on port 4000? (npm run server)');
      } else if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') {
        setError('An account with that email already exists. Try signing in.');
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create an account</h2>
        <p className="text-sm text-slate-500 mb-4">Register a staff persona for demo/testing.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Mercer"
              className="w-full mt-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

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
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              className="w-full mt-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Role</label>
            <div className="flex gap-3 mt-2 flex-wrap">
              <label className="text-sm">
                <input type="radio" name="role" value="waiter" checked={role === 'waiter'} onChange={() => setRole('waiter')} />{' '}
                Waiter
              </label>
              <label className="text-sm">
                <input type="radio" name="role" value="chef" checked={role === 'chef'} onChange={() => setRole('chef')} />{' '}
                Chef
              </label>
              <label className="text-sm">
                <input type="radio" name="role" value="rider" checked={role === 'rider'} onChange={() => setRole('rider')} />{' '}
                Rider
              </label>
            </div>
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            disabled={busy}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          <a href="#/login" className="text-emerald-600 font-medium">Have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
