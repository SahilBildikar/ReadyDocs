import React, { useState, useEffect } from 'react';
import { fetchHelpGuide, updateChecklistItemStatus } from '../services/checklistApi';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Info, 
  FileText, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';

export default function DocumentHelpGuide({
  isOpen,
  onClose,
  helpGuideId,
  itemId,
  itemTitle,
  checklistId,
  onStatusUpdated
}) {
  const { isSeniorMode, language, t } = useLanguage();
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (isOpen && helpGuideId) {
      setIsLoading(true);
      setError(null);
      setActionSuccess(null);

      fetchHelpGuide(helpGuideId)
        .then((data) => {
          setGuide(data);
        })
        .catch((err) => {
          console.error('Failed to load help guide:', err);
          setError(err.message || 'Could not load official guide.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setGuide(null);
      setError(null);
      setActionSuccess(null);
    }
  }, [isOpen, helpGuideId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus) => {
    if (!checklistId || !itemId) {
      // Local preview state without saved ID
      if (onStatusUpdated) {
        onStatusUpdated(itemId, newStatus);
      }
      setActionSuccess(t('documentStatusUpdatedToast', 'Document status updated.'));
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const res = await updateChecklistItemStatus({
        checklistId,
        itemId,
        status: newStatus
      });

      setActionSuccess(t('documentStatusUpdatedToast', 'Document status updated.'));
      if (onStatusUpdated) {
        onStatusUpdated(res.updatedItem, res.checklist);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.message || 'Could not update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all ${
          isSeniorMode ? 'text-base' : 'text-xs'
        }`}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                {t('docHelpBadge', 'Official Document Assistance')}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {t('howDoIGetTitle', 'How do I get:')} {guide?.documentName?.[language] || guide?.documentName?.en || itemTitle}
              </h2>
              {guide?.documentName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {guide.documentName.hi} • {guide.documentName.mr}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title={t('closeBtn', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500">{t('loadingGuidelines', 'Loading official procedure guidelines...')}</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 inline mr-1.5" />
              <span>{error}</span>
            </div>
          ) : guide ? (
            <>
              {/* Success Notification */}
              {actionSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* 1. Why Needed */}
              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block mb-1">
                  {t('whyRequiredHeading', 'Why this document is required')}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {guide.whyNeeded?.[language] || guide.whyNeeded?.en}
                </p>
                {language === 'en' && guide.whyNeeded?.mr && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    {guide.whyNeeded.mr}
                  </p>
                )}
              </div>

              {/* 2. Eligibility */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('whoCanApplyHeading', 'Who can apply')}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {guide.eligibility}
                </p>
              </div>

              {/* 3. Prerequisites (Required vs Optional) */}
              {guide.prerequisites && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1.5">
                      {t('requiredSupportingPapers', 'Required supporting papers')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {guide.prerequisites.required?.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-medium">
                          <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      {t('optionalSupportingPapers', 'Optional alternative papers')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {guide.prerequisites.optional?.map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-medium">
                          <span className="text-slate-400">•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 4. Step-by-Step Procedure */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('stepByStepProcedure', 'Step-by-Step Procedure')}</span>
                </h4>
                <div className="space-y-2.5">
                  {guide.steps?.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Where to apply & Official Link */}
              {guide.officialPortal && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('officialGovAuthority', 'Official Government Authority')}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {guide.officialPortal.name}
                    </h5>
                  </div>

                  <a
                    href={guide.officialPortal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition shrink-0"
                  >
                    <span>{guide.officialPortal.buttonText || t('officialPortalBtn', 'Open Official Application Portal')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* 6. Fees and Processing Timeline */}
              {guide.feeAndTimeline && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      {t('officialFeesLabel', 'Official Fees')}:
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {guide.feeAndTimeline.feeText}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      {t('estimatedTimeLabel', 'Estimated Time')}:
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {guide.feeAndTimeline.timelineText}
                    </span>
                  </div>
                </div>
              )}

              {/* 7. Alternatives */}
              {guide.alternatives && guide.alternatives.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {t('acceptedAlternativesHeading', 'Accepted alternatives')}
                  </h4>
                  <div className="space-y-2">
                    {guide.alternatives.map((alt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {alt.name}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                          {alt.description}
                        </p>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-1">
                          * {alt.acceptedWhere}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                <strong>Disclaimer:</strong> {guide.disclaimer || 'Rules, fees, and processing times can change. Please verify on the official portal.'}
                <span className="block mt-0.5 text-slate-500">Verified: {guide.lastVerified}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No guide content available for this document.</p>
          )}
        </div>

        {/* Modal Footer: Action Buttons to update checklist status */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            {t('updateStatusLabel', 'Update Checklist Status:')}
          </span>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('application_in_progress')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 ${
                isSeniorMode ? 'min-h-[52px]' : ''
              }`}
            >
              {t('iHaveStartedApplying', 'I have started applying')}
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('ready_to_upload')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-xs ${
                isSeniorMode ? 'min-h-[52px]' : ''
              }`}
            >
              {t('iHaveThisDocNow', 'I have this document now')}
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('not_applicable')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer ${
                isSeniorMode ? 'min-h-[52px]' : ''
              }`}
            >
              {t('statusNotApplicable', 'Not applicable')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
