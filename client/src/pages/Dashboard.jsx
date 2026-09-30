import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { 
  User, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Star, 
  FileText, 
  Building2, 
  GraduationCap, 
  HeartHandshake,
  CheckSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { profiles, activeProfile, setActiveProfile, isLoading } = useProfile();
  const { t } = useLanguage();

  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL = import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_BASE_URL || "/api");

    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Server returned non-200 status');
      })
      .then((data) => {
        if (isMounted) {
          setBackendStatus(data.message || t('allSystemsGo', 'Operational'));
          setIsHealthy(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendStatus(t('serverNotRunningError', 'Backend server is not running. Please start the backend server and try again.'));
          setIsHealthy(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  const hasProfiles = profiles.length > 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>ReadyDocs Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('welcomeBack', 'Welcome back')}, {user?.name || 'User'}!
              </h1>
              <p className="text-teal-50 text-xs sm:text-sm mt-1 max-w-xl font-medium">
                {t('dashboardSubtitle', 'Your AI-powered document verification and readiness hub.')}
              </p>
            </div>

            {/* Active Profile Pill on Hero */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">
                {t('activeProfileBadge', 'Active Profile')}
              </span>
              {activeProfile ? (
                <div className="mt-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="text-sm font-bold text-white">
                    {activeProfile.profile_name} ({activeProfile.full_name})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-amber-200 font-semibold mt-1 block">
                  {t('noActiveProfile', 'No active profile selected')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Missing Profile Warning Banner */}
        {!hasProfiles && !isLoading && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                  {t('noProfilesWarning', 'Create a profile first to start a document checklist.')}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                  {t('noProfilesSubtitle', "Adding your profile (or a family member's profile) enables safe auto-fill, eligibility validation, and checklist creation.")}
                </p>
              </div>
            </div>

            <Link
              to="/profiles"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createFirstProfileCTA', 'Create Your First Profile')}</span>
            </Link>
          </div>
        )}

        {/* Active Profile Selection Bar (when profiles exist) */}
        {hasProfiles && (
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('switchProfile', 'Current Active Profile')}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeProfile?.profile_name || 'None'} — <span className="font-medium text-slate-600 dark:text-slate-400">{activeProfile?.full_name || 'Please select'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {profiles.length > 1 && (
                <select
                  value={activeProfile?.id || ''}
                  onChange={(e) => setActiveProfile(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.profile_name} ({p.full_name})
                    </option>
                  ))}
                </select>
              )}

              <Link
                to="/profiles"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition"
              >
                {t('manageProfilesBtn', 'Manage Profiles')} →
              </Link>
            </div>
          </div>
        )}

        {/* Guided "What do you want to do?" Hero Section */}
        <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t('guidedAssistantBadge', 'Guided Document Assistant')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('whatDoYouWantToDo', 'What do you want to do?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-xl">
              {t('whatDoYouWantToDoSubtitle', 'Select your goal below. Our intelligent assistant will ask a few short questions to prepare your personalized, verified document checklist.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Bank Account */}
            <Link
              to={hasProfiles ? "/checklists/new?action=bank" : "/profiles"}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('actionBankTitle', 'Open a bank account')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {t('actionBankDesc', 'Savings, current, or minor accounts for SBI and other major banks.')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>{t('startGuideBtn', 'Start Guide')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 2: College Admission */}
            <Link
              to={hasProfiles ? "/checklists/new?action=college" : "/profiles"}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('actionCollegeTitle', 'Apply for college admission')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {t('actionCollegeDesc', 'UG, PG, diploma eligibility verification for SPPU and universities.')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>{t('startGuideBtn', 'Start Guide')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 3: Insurance Claim */}
            <Link
              to={hasProfiles ? "/checklists/new?action=insurance" : "/profiles"}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('actionInsuranceTitle', 'Make an insurance claim')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {t('actionInsuranceDesc', 'Health hospitalization reimbursement, accidental, or vehicle claim papers.')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>{t('startGuideBtn', 'Start Guide')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Action 4: Direct Upload & Check */}
            <Link
              to={hasProfiles ? "/checklists/new?action=upload" : "/profiles"}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/70 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('actionUploadTitle', 'Upload & check my documents')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {t('actionUploadDesc', 'Instant Gemini AI document classification, clarity check, and matching.')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>{t('startGuideBtn', 'Start Guide')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {t('activeProfilesCount', 'Active Profiles')}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {profiles.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeProfile ? `Active: ${activeProfile.profile_name}` : t('noActiveProfile', 'No active profile')}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {t('totalChecklists', 'Document Checklists')}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              3 Supported
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SBI, SPPU, Health Insurance
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <Server className="w-5 h-5" />
              <span className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {t('readyStatus', 'Platform Status')}
              </span>
            </div>
            <div className={`text-sm font-bold mt-1 ${isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {backendStatus}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JWT Authentication Active
            </p>
          </div>
        </div>

        {/* Security & Privacy Banner */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t('privacyNoticeBadge', 'Zero-Knowledge Policy')}:</span>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              {t('privacyBanner', 'Zero-Knowledge Privacy: We never ask for or store Aadhaar numbers, PAN numbers, bank account numbers, OTPs, or passwords.')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • “{t('tagline', 'One visit is enough.')}”
      </footer>
    </div>
  );
}
