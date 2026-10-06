import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getToken } from '../../services/session';

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1c38] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/logo.jpg" alt="Lucky MotorCars 13" className="h-28 w-auto object-contain mx-auto mb-4 brightness-0 invert" />
        <h2 className="text-xl font-bold text-slate-300 tracking-wider uppercase">Admin Panel</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl sm:rounded-3xl border border-slate-200">
          <h3 className="text-2xl font-black text-[#1a2744] mb-8 text-center">Masuk ke Dashboard</h3>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-[#1a2744] hover:bg-[#243460] px-4 py-3 text-sm font-bold text-white transition-colors mt-2 disabled:opacity-60"
            >
              {loading ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Kembali ke Website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
