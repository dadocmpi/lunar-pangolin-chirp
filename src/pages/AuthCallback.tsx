"use client";

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params (OAuth flow)
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          return;
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) throw sessionError;
          
          if (data.user) {
            setStatus('success');
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
            return;
          }
        }

        // Fallback: Try to get hash fragment (old Supabase flow)
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1)); // Remove #
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) throw sessionError;
            
            if (data.user) {
              setStatus('success');
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 2000);
              return;
            }
          }
        }

        // No valid session found
        setStatus('error');
        setErrorMessage('Invalid or expired confirmation link');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to confirm email');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Confirming your account...</h2>
            <p className="text-slate-400">Please wait while we verify your email.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Confirmed!</h2>
            <p className="text-slate-400 mb-4">Your account has been successfully verified.</p>
            <p className="text-[#C5A059] text-sm">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h2>
            <p className="text-slate-400 mb-4">{errorMessage}</p>
            <button 
              onClick={() => navigate('/login', { replace: true })}
              className="px-6 py-3 bg-[#C5A059] text-white font-bold text-sm uppercase tracking-wider rounded-none hover:bg-[#B08D48] transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
