'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    // For demo/development - sign up or sign in with demo account
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'demo@magayamining.co.zw',
      password: 'demo123456',
      options: { data: { full_name: 'Tatenda Moyo', role: 'super_admin' } }
    });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@magayamining.co.zw',
      password: 'demo123456',
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A0A0A', fontFamily: "'Neuton', serif" }}>
      {/* Left panel - branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: '#D4AF37', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36, fontWeight: 800, color: '#0A0A0A' }}>
            M
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>Magaya Mining</h1>
          <p style={{ fontSize: 14, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 48 }}>IT Asset Management</p>
          <div style={{ maxWidth: 360, color: '#737373', fontSize: 16, lineHeight: 1.7 }}>
            Enterprise-grade asset tracking, lifecycle management, and compliance reporting across all mining operations.
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60, background: '#FFFFFF' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#0A0A0A' }}>Welcome back</h2>
        <p style={{ fontSize: 15, color: '#737373', marginBottom: 36 }}>Sign in to your account to continue</p>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: '#737373', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@magayamining.co.zw"
              required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 15, fontFamily: "'Neuton', serif", outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: '#737373', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 15, fontFamily: "'Neuton', serif", outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#0A0A0A', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: "'Neuton', serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 12 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'transparent', color: '#525252', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 15, fontWeight: 700, fontFamily: "'Neuton', serif", cursor: 'pointer' }}
          >
            Try Demo Account
          </button>
        </form>

        <p style={{ marginTop: 32, fontSize: 13, color: '#a3a3a3', textAlign: 'center' }}>
          SSO available via Microsoft Entra ID
        </p>
      </div>
    </div>
  );
}
