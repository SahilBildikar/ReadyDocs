import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';
import { 
  FileCheck2, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  ArrowRight, 
  Globe, 
  Eye, 
  Users, 
  LayoutDashboard,
  Menu,
  X,
  Star,
  CheckSquare
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isSeniorMode, toggleSeniorMode, t } = useLanguage();
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-teal-600 text-white p-2 rounded-xl shadow-xs group-hover:bg-teal-700 transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Ready<span className="text-teal-600 dark:text-teal-400">Docs</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('tagline', 'One visit is enough.')}
              </p>
            </div>
          </Link>

          {/* Navigation Links for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive('/dashboard')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('dashboard', 'Dashboard')}</span>
              </Link>

              <Link
                to="/checklists"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  location.pathname.startsWith('/checklists')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{t('checklistsNav', 'Checklists')}</span>
              </Link>

              <Link
                to="/profiles"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive('/profiles')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('profiles', 'Profiles')}</span>
                {activeProfile && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-600 text-white truncate max-w-[90px]">
                    {activeProfile.profile_name}
                  </span>
                )}
              </Link>
            </nav>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              aria-label="Language Selector"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Senior Citizen Mode Toggle */}
          <button
            onClick={toggleSeniorMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer shadow-xs ${
              isSeniorMode
                ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Senior Citizen High Readability Mode"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isSeniorMode ? t('standardMode', 'Normal') : t('seniorMode', 'Senior')}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('light', 'Light')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>{t('dark', 'Dark')}</span>
              </>
            )}
          </button>

          {/* Auth Action Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logOut', 'Log Out')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('logIn', 'Log In')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <span>{t('register', 'Register')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
          {isAuthenticated && (
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  isActive('/dashboard')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('dashboard', 'Dashboard')}</span>
              </Link>

              <Link
                to="/checklists"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  location.pathname.startsWith('/checklists')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{t('checklistsNav', 'Checklists')}</span>
              </Link>

              <Link
                to="/profiles"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  isActive('/profiles')
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{t('profiles', 'Profiles')}</span>
                </div>
                {activeProfile && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-600 text-white">
                    {activeProfile.profile_name}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Controls: Language, Senior, Theme */}
          <div className="grid grid-cols-3 gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="py-1.5 px-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>

            <button
              onClick={toggleSeniorMode}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 ${
                isSeniorMode
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isSeniorMode ? t('standardMode', 'Normal') : t('seniorMode', 'Senior')}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="py-1.5 px-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{isDark ? t('light', 'Light') : t('dark', 'Dark')}</span>
            </button>
          </div>

          {/* Auth Action */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logOut', 'Log Out')}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  {t('logIn', 'Log In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold rounded-xl bg-teal-600 text-white"
                >
                  {t('register', 'Register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
