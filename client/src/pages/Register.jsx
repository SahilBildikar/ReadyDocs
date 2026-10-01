import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Info,
  MailCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, login, isAuthenticated, isInitializing } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [confirmationNeeded, setConfirmationNeeded] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // If already logged in, redirect to dashboard immediately
  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsRateLimited(false);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(t('fillAllFieldsError', 'Please fill in all required fields.'));
      return;
    }

    if (name.trim().length < 2) {
      setErrorMessage(t('nameTooShortError', 'Name must be at least 2 characters long.'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('passwordTooShortError', 'Password must be at least 6 characters long.'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatchError', 'Passwords do not match. Please re-enter.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(name.trim(), email.trim(), password);

      if (result?.session) {
        // Logged in immediately!
        navigate('/dashboard', { replace: true });
      } else if (!result?.requiresEmailConfirmation) {
        // Direct to login with email pre-filled and immediate login notice
        navigate('/login', { replace: true, state: { justRegistered: true, email: email.trim() } });
      } else {
        setRegisteredEmail(email.trim());
        setConfirmationNeeded(true);
      }
    } catch (err) {
      const errMsg = (err.message || '').toLowerCase();
      if (err.code === 'USER_ALREADY_EXISTS' || errMsg.includes('already exists') || errMsg.includes('already registered')) {
        setErrorMessage(t('userAlreadyExistsError', 'An account with this email already exists. Please log in instead.'));
      } else if (
        errMsg.includes('rate limit') ||
        errMsg.includes('error sending confirmation email') ||
        errMsg.includes('rate_limit') ||
        errMsg.includes('over_email_send_rate_limit')
      ) {
        // Never block registration if email rate limit/error occurs; attempt direct password login
        try {
          await login(email.trim(), password);
          navigate('/dashboard', { replace: true });
          return;
        } catch (_) {}
        navigate('/login', { replace: true, state: { justRegistered: true, email: email.trim() } });
      } else if (err.details && Array.isArray(err.details)) {
        setErrorMessage(err.details.map((d) => d.message).join('. '));
      } else {
        setErrorMessage(err.message || t('loginFailedError', 'Registration failed. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
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

      {/* Main Register Card */}
      <main className="max-w-md w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          {confirmationNeeded ? (
            /* SUCCESS CONFIRMATION SCREEN (When Supabase email confirmation is required) */
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-800 shadow-xs">
                <MailCheck className="w-8 h-8" />
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('regSuccessTitle', 'Account Created Successfully')}
              </h1>

              <div className="mt-3 p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-left">
                <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 font-medium leading-relaxed">
                  {t('regSuccessMsg', 'Account created successfully. Please check your email inbox and click the confirmation link before logging in.')}
                </p>
                {registeredEmail && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-100/70 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-semibold">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{registeredEmail}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-left flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                    {t('regSpamHint', 'If you do not see the email, check your Spam or Promotions folder.')}
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    {t('regDemoNotice', 'Demo Notice: Please submit registration only once and avoid spamming to prevent triggering Supabase hourly email limits.')}
                  </p>
                </div>
              </div>

              {/* Action Button: Go to Login (shown only after confirmation screen is displayed) */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2"
                >
                  <span>{t('goToLoginBtn', 'Go to Login')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t('registerTitle', 'Create an Account')}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {t('registerSubtitle', 'Start managing and verifying your official documents safely')}
                </p>
              </div>

              {/* Hackathon Demo Mode Active Banner */}
              <div className="mb-5 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5 text-teal-900 dark:text-teal-100 text-xs font-medium">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                <div className="space-y-0.5">
                  <p className="font-bold text-teal-950 dark:text-teal-200">
                    {t('demoModeActiveTitle', 'Hackathon Demo Mode Active')}
                  </p>
                  <p className="text-teal-800/90 dark:text-teal-300/90 leading-relaxed text-[11px]">
                    {t('demoModeActiveDesc', 'Email verification is temporarily disabled for this demo. Anyone can register and log in immediately without waiting for an email.')}
                  </p>
                </div>
              </div>

              {isRateLimited ? (
                <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-left">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">
                        {t('rateLimitErrorTitle', 'Email Rate Limit Exceeded')}
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                        {errorMessage}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                        <span className="text-[11px] text-amber-700 dark:text-amber-400">
                          {t('rateLimitDemoAction', 'If you already created an account previously, you can log in directly.')}
                        </span>
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline shrink-0 ml-2"
                        >
                          <span>{t('goToLoginBtn', 'Go to Login')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t('fullNameLabel', 'Full Name')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('fullNamePlaceholder', 'e.g. Sahil Sharma')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
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

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t('passwordLabel', 'Password')}{' '}
                    <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                      ({t('passwordMinChars', 'min. 6 characters')})
                    </span>
                  </label>
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    {t('confirmPasswordLabel', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
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
                      <span>{t('creatingAccountBtn', 'Creating Account...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('createAccountBtn', 'Create Account')}</span>
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
                  {t('alreadyHaveAccount', 'Already have an account?')}{' '}
                  <Link to="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    {t('signInHere', 'Sign in here')}
                  </Link>
                </p>
              </div>
            </>
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
