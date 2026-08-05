import React, { useState } from 'react';
import { DEMO_USERS } from '../data/menu';
import { User } from '../types';

interface LoginPageProps {
  onAuthSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      onAuthSuccess(existing);
      window.location.hash = '';
      return;
    }
    setError('No demo user with that email. Try a demo email or sign up.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to KitchenSync</h2>
        <p className="text-sm text-slate-500 mb-4">Use a demo account or enter a demo email (see Quick Links)</p>

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

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Sign in</button>
        </form>

        <div className="mt-6 text-sm">
          <div className="text-xs font-semibold text-slate-500 mb-2">Quick demo logins</div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.slice(0, 6).map(u => (
              <button
                key={u.id}
                onClick={() => { onAuthSuccess(u); window.location.hash = ''; }}
                className="p-2 rounded-xl border border-slate-200 text-left flex items-center gap-2 hover:bg-slate-50"
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
