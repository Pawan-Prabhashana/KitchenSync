import React, { useState } from 'react';
import { User, Role } from '../types';

interface SignupPageProps {
  onAuthSuccess: (user: User) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('waiter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name || email.split('@')[0] || 'User',
      email: email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    } as User;
    onAuthSuccess(newUser);
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

          <button className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Create account</button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          <a href="#/login" className="text-emerald-600 font-medium">Have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
