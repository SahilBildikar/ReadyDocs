import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Sparkles,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isInitializing } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(
    location.state?.justRegistered
      ? t('justRegisteredSuccess', 'Account created successfully! You can log in immediately.')
      : ''
  );

  // Password reset state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // If already logged in, redirect to dashboard immediately
  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(t('fillAllFieldsError', 'Please fill in both email and password.'));
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || t('loginFailedError', 'Login failed. Please check your credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError(t('fillAllFieldsError', 'Please fill in both email and password.'));
      return;
    }

    setIsResetting(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          setForgotError(t('rateLimitErrorDesc', 'Supabase free tier limits authentication emails to ~2 per hour. Please wait before retrying.'));
        } else {
          setForgotError(error.message);
        }
      } else {
        setForgotSuccess(t('resetLinkSentMsg', 'Password reset link sent! Please check your email inbox and Spam folder.'));
      }
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('loginTitle', 'Welcome Back')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {t('loginSubtitle', 'Log in to access your document checklists and files')}
            </p>
          </div>

          {/* Hackathon Demo Notice */}
          <div className="mb-5 p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2 text-teal-900 dark:text-teal-100 text-xs font-medium">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
            <p className="text-[11px] text-teal-800 dark:text-teal-200">
              {t('demoModeActiveDesc', 'Email verification is temporarily disabled for this demo. Anyone can register and log in immediately without waiting for an email.')}
            </p>
          </div>

          {successNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5 text-teal-800 dark:text-teal-200 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {t('emailLabel', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder', 'name@example.com')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('passwordLabel', 'Password')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotPassword(true);
                  }}
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {t('forgotPassword', 'Forgot Password?')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('loggingInBtn', 'Signing in...')}</span>
                </>
              ) : (
                <>
                  <span>{t('loginBtn', 'Log In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t('passwordSecurityNote', 'Passwords securely hashed with bcrypt')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">
              {t('dontHaveAccount', "Don't have an account?")}{' '}
              <Link to="/register" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                {t('registerHere', 'Register here')}
              </Link>
            </p>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 border border-teal-200 dark:border-teal-800">
                  <KeyRound className="w-6 h-6" />
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('resetPasswordTitle', 'Reset Your Password')}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {t('resetPasswordDesc', 'Enter your email address and we will send you a password reset link.')}
                </p>

                {forgotSuccess ? (
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-medium flex items-start gap-2.5 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{forgotSuccess}</span>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {forgotError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        {t('emailLabel', 'Email Address')}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder={t('emailPlaceholder', 'name@example.com')}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('sendingResetLinkBtn', 'Sending...')}</span>
                        </>
                      ) : (
                        <span>{t('sendResetLinkBtn', 'Send Reset Link')}</span>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {t('backToLoginBtn', 'Back to Login')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • {t('passwordSecurityNote', 'Secure Authentication with JWT & Bcrypt')}
      </footer>
    </div>
  );
}
