import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldCheck, User, Calendar, MapPin, Phone, Mail, GraduationCap, Globe, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  onSubmit,
  profile = null, // null for create, object for edit
  isProcessing = false
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    profile_name: '',
    full_name: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    education_details: '',
    language: 'english',
    is_active: false
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        profile_name: profile.profile_name || '',
        full_name: profile.full_name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'prefer_not_to_say',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pin_code: profile.pin_code || '',
        education_details: profile.education_details || '',
        language: profile.language || 'english',
        is_active: Boolean(profile.is_active)
      });
    } else {
      setFormData({
        profile_name: '',
        full_name: '',
        date_of_birth: '',
        gender: 'prefer_not_to_say',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pin_code: '',
        education_details: '',
        language: 'english',
        is_active: false
      });
    }
    setErrorMessage('');
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.profile_name.trim() || formData.profile_name.trim().length < 2) {
      setErrorMessage(t('profileNameLabel') + ' must be at least 2 characters.');
      return;
    }

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setErrorMessage(t('fullNameLabel') + ' must be at least 2 characters.');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 transition-all max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {profile ? t('editProfileTitle', 'Edit Profile') : t('createProfileTitle', 'Create New Profile')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              ReadyDocs Intelligent Document Processing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t('privacyBanner', 'Zero-Knowledge Privacy: We never ask for or store Aadhaar, PAN, Bank Accounts, OTPs, or Passwords.')}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profile Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('profileNameLabel', 'Profile Label / Role')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="profile_name"
                value={formData.profile_name}
                onChange={handleChange}
                placeholder={t('profileNamePlaceholder', 'e.g. My Profile, Father\'s Profile')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('fullNameLabel', 'Full Legal Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder', 'As shown on official ID')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('dobLabel', 'Date of Birth')}
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('genderLabel', 'Gender')}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              >
                <option value="male">{t('male', 'Male')}</option>
                <option value="female">{t('female', 'Female')}</option>
                <option value="other">{t('other', 'Other')}</option>
                <option value="prefer_not_to_say">{t('preferNotToSay', 'Prefer not to say')}</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('emailLabel', 'Email Address (Optional)')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('phoneLabel', 'Phone Number (Optional)')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('phonePlaceholder', 'e.g. 9876543210')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('cityLabel', 'City (Optional)')}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Pune, Mumbai, Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('stateLabel', 'State (Optional)')}
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('pinCodeLabel', 'PIN Code (Optional)')}
              </label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                placeholder="e.g. 411007"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t('languagePrefLabel', 'Preferred Language')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी (Hindi)</option>
                <option value="marathi">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* Education Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t('educationLabel', 'Education Details (Optional)')}
            </label>
            <input
              type="text"
              name="education_details"
              value={formData.education_details}
              onChange={handleChange}
              placeholder={t('educationPlaceholder', 'e.g. 10th / 12th / B.E. / M.Sc.')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Residential Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t('addressLabel', 'Address (Optional)')}
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat / Building, Street, Area"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
            />
          </div>

          {/* Set as Active Checkbox */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active_checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="is_active_checkbox"
              className="text-xs font-bold text-teal-950 dark:text-teal-200 cursor-pointer select-none"
            >
              {t('makeActiveLabel', 'Set as Active Profile for checklists')}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isProcessing ? t('saving', 'Saving...') : t('saveProfile', 'Save Profile')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
