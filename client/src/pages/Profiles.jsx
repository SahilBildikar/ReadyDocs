import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import ConfirmModal from '../components/ConfirmModal';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Star, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Globe, 
  FolderOpen, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';

export default function Profiles() {
  const { 
    profiles, 
    archivedProfiles, 
    activeProfile, 
    isLoading, 
    setActiveProfile, 
    createProfile, 
    updateProfile, 
    archiveProfile, 
    deleteProfile 
  } = useProfile();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger', // 'danger' | 'warning' | 'info'
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const handleOpenCreate = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingProfile) {
        await updateProfile(editingProfile.id, formData);
      } else {
        await createProfile(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await setActiveProfile(id);
    } catch (err) {
      console.error('Failed to set active profile', err);
    }
  };

  const handlePromptArchive = (profile) => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: t('confirmArchiveTitle', 'Archive Profile?'),
      message: `${t('confirmArchiveDesc', 'Are you sure you want to archive')} "${profile.profile_name}"?`,
      confirmText: t('archive', 'Archive'),
      onConfirm: async () => {
        try {
          await archiveProfile(profile.id, true);
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePromptRestore = (profile) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: t('confirmRestoreTitle', 'Restore Profile?'),
      message: `${t('confirmRestoreDesc', 'This profile will be moved back to your Active Profiles list:')} "${profile.profile_name}".`,
      confirmText: t('restore', 'Restore'),
      onConfirm: async () => {
        try {
          await archiveProfile(profile.id, false);
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePromptDelete = (profile) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: t('confirmDeleteTitle', 'Delete Profile?'),
      message: `${t('confirmDeleteDesc', 'Are you sure you want to permanently delete')} "${profile.profile_name}"?`,
      confirmText: t('deleteBtn', 'Delete Permanently'),
      onConfirm: async () => {
        try {
          await deleteProfile(profile.id);
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const currentList = activeTab === 'active' ? profiles : archivedProfiles;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
              <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t('profiles', 'Profiles')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('profilesTitle', 'Profile Management')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
              {t('profilesSubtitle', 'Manage multiple profiles for yourself, family members, or students. Set an active profile to auto-fill forms and verify document requirements.')}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewProfile', 'Add New Profile')}</span>
          </button>
        </div>

        {/* Tabs: Active / Archived */}
        <div className="flex items-center gap-2 mt-6 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <span>{t('activeTab', 'Active Profiles')}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300">
              {profiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'archived'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <span>{t('archivedTab', 'Archived Profiles')}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300">
              {archivedProfiles.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-semibold">Loading profiles...</p>
          </div>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FolderOpen className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {activeTab === 'active'
                ? t('noActiveProfilesTitle', 'No Active Profiles')
                : t('noArchivedProfilesTitle', 'No Archived Profiles')}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 font-medium">
              {activeTab === 'active'
                ? t('noActiveProfilesDesc', 'Create a profile first to start a document checklist.')
                : t('noArchivedProfilesDesc', 'Profiles you archive will appear here safely.')}
            </p>

            {activeTab === 'active' && (
              <button
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('createFirstProfileCTA', 'Create Your First Profile')}</span>
              </button>
            )}
          </div>
        ) : (
          /* Profiles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((item) => {
              const isActive = activeProfile?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition shadow-xs flex flex-col justify-between ${
                    isActive
                      ? 'border-2 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Row: Label & Active Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {item.profile_name}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {item.full_name}
                        </h3>
                      </div>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-600 text-white shadow-xs shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{t('activeNow', 'ACTIVE')}</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {item.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>DOB: {item.date_of_birth}</span>
                        </div>
                      )}

                      {item.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}

                      {item.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      )}

                      {(item.city || item.state) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{[item.city, item.state, item.pin_code].filter(Boolean).join(', ')}</span>
                        </div>
                      )}

                      {item.education_details && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.education_details}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="capitalize">{item.language || 'English'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    {/* Active toggle button (only on active tab) */}
                    {activeTab === 'active' && (
                      <button
                        onClick={() => handleSetActive(item.id)}
                        disabled={isActive}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 cursor-default'
                            : 'border border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-current text-teal-600' : ''}`} />
                        <span>{isActive ? t('activeTag', 'CURRENTLY ACTIVE') : t('setAsActive', 'Set as Active Profile')}</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t('edit', 'Edit')}</span>
                      </button>

                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handlePromptArchive(item)}
                          className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>{t('archive', 'Archive')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePromptRestore(item)}
                          className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('restore', 'Restore')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handlePromptDelete(item)}
                        className="p-2 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                        title={t('delete', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Profile Create/Edit Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        profile={editingProfile}
        isProcessing={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • “One visit is enough.”
      </footer>
    </div>
  );
}
