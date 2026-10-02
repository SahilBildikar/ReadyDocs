import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchChecklists, deleteChecklist } from '../services/checklistApi';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Trash2,
  Filter,
  Calendar,
  User
} from 'lucide-react';

export default function ChecklistHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, token, isInitializing, isAuthenticated } = useAuth();
  const [checklists, setChecklists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete Confirmation Modal & Toast states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    checklistId: null,
    isProcessing: false
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadChecklists = async () => {
    if (!isAuthenticated || !user?.id) {
      setChecklists([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchChecklists({
        serviceType: selectedService,
        status: selectedStatus,
        search: searchTerm
      });

      // Strict user isolation verification: ensure all items belong to this user
      const userScoped = (data || []).filter((c) => !c.user_id || c.user_id === user.id);
      setChecklists(userScoped);
    } catch (err) {
      console.error('Failed to load checklists:', err);
      setError(err.message || 'Failed to load checklists');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear state on account switch or pending auth initialization
    if (isInitializing) {
      setIsLoading(true);
      return;
    }
    if (!isAuthenticated || !user?.id) {
      setChecklists([]);
      setIsLoading(false);
      return;
    }

    loadChecklists();
  }, [user?.id, token, isInitializing, isAuthenticated, selectedService, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadChecklists();
  };

  const handlePromptDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setDeleteModal({
      isOpen: true,
      checklistId: id,
      isProcessing: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.checklistId) return;

    setDeleteModal((prev) => ({ ...prev, isProcessing: true }));
    setError(null);

    try {
      await deleteChecklist(deleteModal.checklistId);
      setChecklists((prev) => prev.filter((c) => c.id !== deleteModal.checklistId));
      showToast(t('checklistDeletedToast', 'Checklist deleted successfully.'));
      setDeleteModal({ isOpen: false, checklistId: null, isProcessing: false });
    } catch (err) {
      console.error('Failed to delete checklist:', err);
      setError(err.message || 'Failed to delete checklist');
      setDeleteModal((prev) => ({ ...prev, isProcessing: false, isOpen: false }));
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'sbi_savings': return <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'sppu_admission': return <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'insurance_claim': return <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default: return <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> {t('readyForVisit', 'Ready')}
          </span>
        );
      case 'needs_attention':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3 h-3" /> {t('needsAttention', 'Needs Attention')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3" /> {t('incomplete', 'Incomplete')}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        {/* Header with New Checklist CTA */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('myChecklistsTitle', 'My Document Checklists')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {t('myChecklistsSubtitle', 'Review and manage your document readiness packages across all services.')}
            </p>
          </div>

          <Link
            to="/checklists/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newChecklistBtn', 'New Checklist')}</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchChecklistPlaceholder', 'Search by institution, service, or profile name...')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Service filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">{t('allServicesOption', 'All Services')}</option>
              <option value="sbi_savings">{t('guidedCard1Title', 'SBI Savings Account')}</option>
              <option value="sppu_admission">{t('guidedCard2Title', 'SPPU Admission')}</option>
              <option value="insurance_claim">{t('guidedCard3Title', 'Health Insurance Claim')}</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">{t('allStatusesOption', 'All Statuses')}</option>
              <option value="ready">{t('readyForVisit', 'Ready')}</option>
              <option value="needs_attention">{t('needsAttention', 'Needs Attention')}</option>
              <option value="incomplete">{t('incomplete', 'Incomplete')}</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition cursor-pointer"
            >
              {t('searchBtn', 'Search')}
            </button>
          </form>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">{t('loadingChecklistHistory', 'Loading checklist history...')}</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center text-xs text-rose-800 dark:text-rose-200">
            {error}
          </div>
        ) : checklists.length === 0 ? (
          /* Empty state */
          <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('noChecklistsFoundTitle', 'No Checklists Found')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              {t('noChecklistsFoundDesc', 'Start your first document checklist for SBI Savings Account, SPPU University Admission, or Health Insurance.')}
            </p>
            <div className="mt-6">
              <Link
                to="/checklists/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('createChecklistCTA', 'Create New Checklist')}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Checklists Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklists.map((c) => {
              const items = c.result_json?.items || [];
              const matchedCount = items.filter(i => i.status === 'matched').length;

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/checklists/${c.id}`)}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 transition shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Service info and status badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getServiceIcon(c.service_type)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {c.institution_name}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {c.result_json?.serviceTitle || c.institution_name}
                          </h3>
                        </div>
                      </div>

                      {getStatusBadge(c.status)}
                    </div>

                    {/* Profile & Date info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {c.profile?.profile_name || 'Profile'} ({c.profile?.full_name || 'Holder'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t('docsMatchedCount', '{matched} / {total} Documents Matched', { matched: matchedCount, total: items.length })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handlePromptDelete(e, c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title={t('delete', 'Delete')}
                        aria-label={t('delete', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                        <span>{t('openChecklistBtn', 'Open')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        type="danger"
        title={t('deleteChecklistTitle', 'Delete Checklist?')}
        message={t('deleteChecklistConfirm', 'Are you sure you want to delete this checklist? All uploaded document associations will also be removed.')}
        confirmText={t('optYes', 'Yes')}
        cancelText={t('cancel', 'Cancel')}
        isProcessing={deleteModal.isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, checklistId: null, isProcessing: false })}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-teal-600 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-teal-400 dark:text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • “One visit is enough.”
      </footer>
    </div>
  );
}
