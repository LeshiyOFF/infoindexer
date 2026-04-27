"use client";

import { useEffect, useState } from 'react';
import { Lock, Key } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password');
    if (saved) {
      verifyPassword(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPassword = async (pwd: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': pwd
        }
      });
      if (res.ok) {
        sessionStorage.setItem('admin_password', pwd);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        setError('Неверный пароль');
        sessionStorage.removeItem('admin_password');
      }
    } catch {
      setError('Ошибка сети');
      setIsAuthorized(false);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      verifyPassword(password);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center space-y-6 max-w-md w-full">
          <div className="mx-auto w-20 h-20 bg-gray-100 text-gray-600 rounded-3xl flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Авторизация</h3>
            <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">
              Введите пароль администратора для доступа к панели LBS
            </p>
          </div>
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm font-bold transition-colors bg-gray-50/50 text-gray-900"
                placeholder="Введите пароль..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-gray-700 text-sm font-medium">{error}</p>}
            <button 
              type="submit"
              disabled={!password || loading}
              className="w-full bg-gray-800 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
