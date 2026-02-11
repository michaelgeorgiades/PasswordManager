import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import toast from 'react-hot-toast';

const LockIcon = () => (
  <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-200">
      {/* Theme toggle in corner */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2.5 rounded-full text-gray-500 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-400 transition-colors shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
              <LockIcon />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Pal
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Secure password management made simple
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!username || !password}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Default credentials: <strong className="text-gray-700 dark:text-gray-300">admin</strong> / <strong className="text-gray-700 dark:text-gray-300">Admin123!</strong>
          </p>
        </div>
      </Card>
    </div>
  );
};
