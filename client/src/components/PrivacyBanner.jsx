import React from 'react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyBanner({ compact = false }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-medium">
          {t('privacyBanner', 'Zero-Knowledge Privacy: We never ask for or store Aadhaar numbers, PAN numbers, bank account numbers, OTPs, or passwords.')}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs mb-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100">
              {t('privacyNoticeTitle', 'Mandatory Privacy & Document Security Notice')}
            </h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
              <Lock className="w-3 h-3" /> {t('privacyNoticeBadge', 'Zero-Knowledge Policy')}
            </span>
          </div>

          <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
            {t('privacyNoticeDesc', 'For this evaluation, please use sample or dummy files only. Do not upload real Aadhaar cards, PAN numbers, bank account numbers, passwords, OTPs, or debit/credit card credentials.')}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
            <span>{t('inMemoryProcessing', '✓ In-memory processing only')}</span>
            <span>{t('noRawFilesSaved', '✓ No raw files saved in database')}</span>
            <span>{t('maxFileSizeNotice', '✓ Max file size 10 MB (PDF, JPG, PNG)')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
