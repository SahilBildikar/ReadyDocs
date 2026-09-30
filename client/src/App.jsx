import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ChecklistGenerator from './pages/ChecklistGenerator';
import ChecklistDetail from './pages/ChecklistDetail';
import ChecklistHistory from './pages/ChecklistHistory';
import { 
  ShieldCheck, 
  Server, 
  Database, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  LogIn,
  Users
} from 'lucide-react';

function HomeLanding() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [isServerHealthy, setIsServerHealthy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL = import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_BASE_URL || "/api");
    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (res.ok) {
          if (isMounted) setIsServerHealthy(true);
          return res.json();
        }
        throw new Error('Server error');
      })
      .then((data) => {
        if (isMounted) setServerStatus(data.message || 'Connected to Backend');
      })
      .catch(() => {
        if (isMounted) {
          setServerStatus(t('serverNotRunningError', 'Backend server is not running. Please start the backend server and try again.'));
          setIsServerHealthy(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Main Hero Card */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>ReadyDocs Intelligence</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            ReadyDocs Platform Architecture
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed font-medium">
            AI-powered Intelligent Document Processing to verify requirements, classify documents, and prevent wasted visits to banks, universities, and insurance offices.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow transition cursor-pointer"
                >
                  <span>{t('dashboard', 'Go to Dashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/profiles"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('profiles', 'Manage Profiles')}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow transition cursor-pointer"
                >
                  <span>{t('register', 'Register')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('logIn', 'Log In')}</span>
                </Link>
              </>
            )}
          </div>

          {/* System Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Frontend Client</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">React + Vite + Router</p>
              <div className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400">Active & Routing</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Server className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Backend Auth API</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">JWT + Bcrypt + Zod</p>
              <div className={`mt-2 text-xs font-bold ${isServerHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                {serverStatus}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Database className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">User & Profile Store</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supabase PostgreSQL</p>
              <div className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">Ready & Integrated</div>
            </div>
          </div>

          {/* Privacy & Safe Storage Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero-Knowledge Credentials Policy:</span>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Passwords are salted and hashed with 10 rounds of bcrypt before being stored. Plain passwords and password hashes are never returned by any API endpoint.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • Tagline: “One visit is enough.”
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <Routes>
                <Route path="/" element={<HomeLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profiles" 
                  element={
                    <ProtectedRoute>
                      <Profiles />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checklists" 
                  element={
                    <ProtectedRoute>
                      <ChecklistHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checklists/new" 
                  element={
                    <ProtectedRoute>
                      <ChecklistGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checklists/:id" 
                  element={
                    <ProtectedRoute>
                      <ChecklistDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
