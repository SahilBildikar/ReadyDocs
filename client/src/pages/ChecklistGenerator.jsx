import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import PrivacyBanner from '../components/PrivacyBanner';
import DocumentHelpGuide from '../components/DocumentHelpGuide';
import { 
  fetchServices, 
  generateChecklist, 
  saveChecklist,
  updateChecklistItemStatus
} from '../services/checklistApi';
import { generateChecklistPDF } from '../utils/pdfGenerator';
import { shareOnWhatsApp, copyChecklistToClipboard } from '../utils/shareUtils';
import { 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  CheckSquare, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  Star, 
  Users, 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  Clock, 
  Compass,
  RotateCcw,
  Loader2
} from 'lucide-react';

const GENERATION_TEXTS = {
  en: {
    loadingTitle: 'Preparing your personalized checklist…',
    loadingSubtitle: 'Checking document requirements for your answers.',
    failedTitle: 'Failed to generate personalized checklist',
    failedMessage: 'Unable to generate checklist right now. Please check your connection and try again.',
    retryBtn: 'Retry'
  },
  hi: {
    loadingTitle: 'आपकी व्यक्तिगत चेकलिस्ट तैयार की जा रही है…',
    loadingSubtitle: 'आपके उत्तरों के अनुसार दस्तावेज़ आवश्यकताओं की जाँच की जा रही है।',
    failedTitle: 'व्यक्तिगत चेकलिस्ट बनाने में विफल',
    failedMessage: 'चेकलिस्ट तैयार करने में असमर्थ। कृपया पुनः प्रयास करें।',
    retryBtn: 'पुनः प्रयास करें'
  },
  mr: {
    loadingTitle: 'तुमची वैयक्तिकृत चेकलिस्ट तयार केली जात आहे…',
    loadingSubtitle: 'तुमच्या उत्तरांनुसार कागदपत्रांच्या आवश्यकता तपासत आहे.',
    failedTitle: 'वैयक्तिकृत चेकलिस्ट तयार करण्यात अयशस्वी',
    failedMessage: 'चेकलिस्ट तयार करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    retryBtn: 'पुन्हा प्रयत्न करा'
  }
};

export default function ChecklistGenerator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get('action'); // 'bank' | 'college' | 'insurance' | 'upload'
  const serviceParam = searchParams.get('service'); // 'sbi_savings' | 'sppu_admission' | 'insurance_claim'

  const { profiles, activeProfile, setActiveProfile } = useProfile();
  const { isSeniorMode, t, language } = useLanguage();

  const activeLang = language === 'hi' || language === 'mr' ? language : 'en';
  const genTexts = GENERATION_TEXTS[activeLang];

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile?.id || '');

  // Result state
  const [generatedChecklist, setGeneratedChecklist] = useState(null);
  const [savedChecklistRecord, setSavedChecklistRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Missing Document Help Guide Modal state
  const [activeHelpGuide, setActiveHelpGuide] = useState(null); // { guideId, itemId, itemTitle }

  // Map action parameter to service ID
  const mapActionToServiceId = (action) => {
    switch (action) {
      case 'bank': return 'sbi_savings';
      case 'college': return 'sppu_admission';
      case 'insurance': return 'insurance_claim';
      case 'upload': return 'sbi_savings';
      default: return null;
    }
  };

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServices(data);
        const resolvedId = serviceParam || mapActionToServiceId(actionParam);
        if (resolvedId && data.some(s => s.id === resolvedId)) {
          setSelectedServiceId(resolvedId);
        }
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setError(t('serverNotRunningError', 'Could not connect to service definitions. Please ensure the backend is running.'));
      });
  }, [actionParam, serviceParam, t]);

  useEffect(() => {
    if (activeProfile && !selectedProfileId) {
      setSelectedProfileId(activeProfile.id);
    }
  }, [activeProfile, selectedProfileId]);

  const currentService = services.find(s => s.id === selectedServiceId);
  const questions = currentService ? currentService.questions : [];
  const totalSteps = questions.length + 1;
  const isProfileStep = currentStepIndex === questions.length;
  const currentQuestion = questions[currentStepIndex];

  const handleActionSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    setCurrentStepIndex(0);
    setGeneratedChecklist(null);
    setSavedChecklistRecord(null);
    setError(null);
    setGenerationError(null);
  };

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setGenerationError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setSelectedServiceId(null);
    }
  };

  // Dynamic Question & Option Translation Helpers
  const getQuestionLabel = (q) => {
    if (!q) return '';
    return t(`q_${q.id}`, q.label);
  };

  const getOptionLabel = (qId, opt) => {
    if (!opt) return '';

    // Bank Account Opening
    if (qId === 'bank_name') {
      if (opt.value === 'State Bank of India (SBI)') return t('opt_bank_sbi', opt.label);
      if (opt.value === 'other') return t('opt_bank_other', opt.label);
    }
    if (qId === 'account_type') {
      if (opt.value === 'savings') return t('opt_savings', opt.label);
      if (opt.value === 'current') return t('opt_current', opt.label);
      if (opt.value === 'minor') return t('opt_minor', opt.label);
    }
    if (qId === 'is_18_or_above') {
      return opt.value === true ? t('opt_yes_18', opt.label) : t('opt_no_18', opt.label);
    }
    if (qId === 'has_pan') {
      return opt.value === true ? t('opt_yes_pan', opt.label) : t('opt_no_pan', opt.label);
    }
    if (qId === 'address_matches_id' || qId === 'current_address_matches_permanent') {
      return opt.value === true ? t('opt_yes_address_matches', t('opt_yes_address', opt.label)) : t('opt_no_address_matches', t('opt_no_address', opt.label));
    }
    if (qId === 'has_id_proof') {
      return opt.value === true ? t('opt_yes_id_proof', opt.label) : t('opt_no_id_proof', opt.label);
    }
    if (qId === 'has_aadhaar') {
      return opt.value === true ? t('opt_yes_aadhaar', opt.label) : t('opt_no_aadhaar', opt.label);
    }

    // SPPU College Admission
    if (qId === 'institution_name') {
      if (opt.value === 'Savitribai Phule Pune University (SPPU)') return t('opt_inst_sppu', opt.label);
      if (opt.value === 'Mumbai University') return t('opt_inst_mumbai', opt.label);
      if (opt.value === 'COEP Technological University') return t('opt_inst_coep', opt.label);
      if (opt.value === 'Fergusson College Pune') return t('opt_inst_fergusson', opt.label);
      if (opt.value === 'other') return t('opt_inst_other', opt.label);
    }
    if (qId === 'education_level' || qId === 'course_level') {
      if (opt.value === 'ug' || opt.value === 'undergraduate') return t('opt_edu_ug', t('opt_ug', opt.label));
      if (opt.value === 'pg' || opt.value === 'postgraduate') return t('opt_edu_pg', t('opt_pg', opt.label));
      if (opt.value === 'diploma') return t('opt_edu_diploma', t('opt_diploma', opt.label));
      if (opt.value === 'certificate') return t('opt_edu_certificate', opt.label);
    }
    if (qId === 'is_maharashtra' || qId === 'is_maharashtra_domicile') {
      return opt.value === true ? t('opt_yes_maharashtra', t('opt_yes_domicile', opt.label)) : t('opt_no_maharashtra', t('opt_no_domicile', opt.label));
    }
    if (qId === 'has_class_10') {
      return opt.value === true ? t('opt_yes_class_10', opt.label) : t('opt_no_class_10', opt.label);
    }
    if (qId === 'has_class_12') {
      return opt.value === true ? t('opt_yes_class_12', opt.label) : t('opt_no_class_12', opt.label);
    }
    if (qId === 'has_category_quota' || qId === 'category') {
      if (opt.value === 'open' || opt.value === 'general') return t('opt_quota_open', t('opt_general', opt.label));
      if (opt.value === 'reserved_state' || opt.value === 'reserved') return t('opt_quota_reserved', t('opt_reserved', opt.label));
      if (opt.value === 'ews') return t('opt_quota_ews', opt.label);
    }
    if (qId === 'has_previous_marksheet') {
      return opt.value === true ? t('opt_yes_marksheet', opt.label) : t('opt_no_marksheet', opt.label);
    }

    // Insurance Claim
    if (qId === 'insurance_type') {
      if (opt.value === 'health') return t('opt_ins_health', opt.label);
      if (opt.value === 'vehicle') return t('opt_ins_vehicle', opt.label);
      if (opt.value === 'property') return t('opt_ins_property', opt.label);
    }
    if (qId === 'incident_type') {
      if (opt.value === 'hospital') return t('opt_inc_hospital', opt.label);
      if (opt.value === 'accident') return t('opt_inc_accident', opt.label);
      if (opt.value === 'damage') return t('opt_inc_damage', opt.label);
      if (opt.value === 'theft') return t('opt_inc_theft', opt.label);
    }
    if (qId === 'has_bills') {
      return opt.value === true ? t('opt_yes_bills', opt.label) : t('opt_no_bills', opt.label);
    }
    if (qId === 'has_reports') {
      return opt.value === true ? t('opt_yes_reports', opt.label) : t('opt_no_reports', opt.label);
    }
    if (qId === 'has_fir') {
      return opt.value === true ? t('opt_yes_fir', opt.label) : t('opt_no_fir', opt.label);
    }
    if (qId === 'claim_type') {
      if (opt.value === 'reimbursement') return t('opt_reimbursement', opt.label);
      if (opt.value === 'cashless') return t('opt_cashless', opt.label);
    }
    if (qId === 'hospital_type') {
      return opt.value === 'network' ? t('opt_network', opt.label) : t('opt_non_network', opt.label);
    }
    if (qId === 'has_discharge_summary') {
      return opt.value === true ? t('opt_yes_discharge', opt.label) : t('opt_no_discharge', opt.label);
    }
    if (qId === 'bills_exceed_10k') {
      return opt.value === true ? t('opt_yes_10k', opt.label) : t('opt_no_10k', opt.label);
    }

    if (opt.value === true) return t('optYes', opt.label);
    if (opt.value === false) return t('optNo', opt.label);

    return opt.label;
  };

  // Generate and Auto-Save Checklist
  const handleGenerateAndSave = async () => {
    const profId = selectedProfileId || activeProfile?.id;
    if (!profId) {
      setError(t('noProfilesWarning', 'Please select or create a profile to link this checklist.'));
      return;
    }

    setIsLoading(true);
    setIsSaving(true);
    setError(null);
    setGenerationError(null);

    try {
      // 1. Generate tailored items from trusted rules
      const preview = await generateChecklist({
        serviceType: selectedServiceId,
        profileId: profId,
        answers
      });

      // 2. Automatically save checklist into Supabase
      const saved = await saveChecklist({
        serviceType: selectedServiceId,
        profileId: profId,
        institutionName: preview.service.institution,
        sourceUrl: preview.service.sourceUrl,
        answers,
        items: preview.items
      });

      setGeneratedChecklist(preview);
      setSavedChecklistRecord(saved);
      showToast(t('checklistResultBadge', 'Checklist personalized and safely saved!'));
    } catch (err) {
      console.error('Error generating checklist:', err);
      const friendlyMsg = err.message || genTexts.failedMessage;
      setGenerationError(friendlyMsg);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyChecklist = async () => {
    if (!savedChecklistRecord) return;
    const items = savedChecklistRecord.result_json?.items || generatedChecklist?.items || [];
    const success = await copyChecklistToClipboard({
      checklist: savedChecklistRecord,
      items
    });
    if (success) {
      showToast(t('copiedToast', 'Checklist copied to clipboard!'));
    }
  };

  const handleShareWhatsApp = () => {
    if (!savedChecklistRecord) return;
    const items = savedChecklistRecord.result_json?.items || generatedChecklist?.items || [];
    shareOnWhatsApp({
      checklist: savedChecklistRecord,
      items
    });
  };

  const handleDownloadPDF = () => {
    if (!savedChecklistRecord) return;
    const profile = profiles.find(p => p.id === (selectedProfileId || activeProfile?.id));
    const items = savedChecklistRecord.result_json?.items || generatedChecklist?.items || [];

    generateChecklistPDF({
      checklist: savedChecklistRecord,
      items,
      profileName: profile?.profile_name,
      fullName: profile?.full_name
    });
    showToast(t('pdfDownloadedToast', 'PDF downloaded successfully!'));
  };

  const handleStatusUpdated = (updatedItem, updatedChecklist) => {
    if (updatedChecklist) {
      setSavedChecklistRecord(updatedChecklist);
    } else if (savedChecklistRecord && updatedItem) {
      const items = savedChecklistRecord.result_json?.items || [];
      const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
      setSavedChecklistRecord({
        ...savedChecklistRecord,
        result_json: {
          ...savedChecklistRecord.result_json,
          items: newItems
        }
      });
    }
    showToast(t('documentStatusUpdatedToast', 'Document status updated.'));
  };

  const getItemBadge = (status) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> {t('statusVerified', 'Matched')}
          </span>
        );
      case 'application_in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
            <Clock className="w-3 h-3" /> {t('inProgress', 'In Progress')}
          </span>
        );
      case 'ready_to_upload':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
            <CheckSquare className="w-3 h-3" /> {t('readyToUpload', 'Ready to Upload')}
          </span>
        );
      case 'not_applicable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {t('statusNotApplicable', 'N/A')}
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3 h-3" /> {t('statusNeedsReview', 'Needs Review')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
            {t('statusMissing', 'Missing')}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 1: ACTION SELECTOR ("What do you want to do?")                      */}
        {/* ========================================================================= */}
        {!selectedServiceId && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t('guidedFlowBadge', 'ReadyDocs Guided Flow')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('whatDoYouWantToDo', 'What do you want to do?')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
                {t('chooseActionSubtitle', 'Choose an action. We will ask you short, simple questions one at a time to build your exact document package.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => handleActionSelect('sbi_savings')}
                className={`p-6 rounded-3xl text-left border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/70 hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${
                  isSeniorMode ? 'min-h-[120px]' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t('actionBankTitle', 'Open a bank account')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('actionBankDesc', 'Savings, Current, or Minor accounts for SBI and other banks.')}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>{t('startQuestionsBtn', 'Start Questions')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleActionSelect('sppu_admission')}
                className={`p-6 rounded-3xl text-left border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/70 hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${
                  isSeniorMode ? 'min-h-[120px]' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t('actionCollegeTitle', 'Apply for college admission')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('actionCollegeDesc', 'Undergraduate, Postgraduate, and Diploma college requirements.')}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>{t('startQuestionsBtn', 'Start Questions')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleActionSelect('insurance_claim')}
                className={`p-6 rounded-3xl text-left border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/70 hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${
                  isSeniorMode ? 'min-h-[120px]' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t('actionInsuranceTitle', 'Make an insurance claim')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('actionInsuranceDesc', 'Hospitalization reimbursement, accidental damage, or theft papers.')}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>{t('startQuestionsBtn', 'Start Questions')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/checklists/new?action=upload')}
                className={`p-6 rounded-3xl text-left border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/70 hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${
                  isSeniorMode ? 'min-h-[120px]' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t('actionUploadTitle', 'Upload & check my documents')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('actionUploadDesc', 'Run AI verification on your existing file before applying anywhere.')}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>{t('startScanBtn', 'Start Scan')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: 1-QUESTION-AT-A-TIME WIZARD (Before Final Checklist)            */}
        {/* ========================================================================= */}
        {selectedServiceId && !generatedChecklist && currentService && (
          <div className="max-w-2xl mx-auto">
            {/* Top Wizard Navigation & Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentStepIndex === 0 ? t('changeGoalBtn', 'Change Goal') : t('backBtn', 'Back')}</span>
                </button>
                <span>
                  {t('questionCounter', 'Question {current} of {total}', {
                    current: currentStepIndex + 1,
                    total: totalSteps
                  })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-6">
              {!isProfileStep ? (
                /* Service Specific Question */
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                    {t(`service_${currentService.id}_title`, currentService.title)}
                  </span>
                  <h2 className={`font-extrabold text-slate-900 dark:text-white mb-6 ${
                    isSeniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                  }`}>
                    {getQuestionLabel(currentQuestion)}
                  </h2>

                  {/* Render based on question type */}
                  {currentQuestion.type === 'select_with_other' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentQuestion.options.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                            className={`p-4 rounded-2xl text-left border transition cursor-pointer font-bold ${
                              isSeniorMode ? 'min-h-[56px] text-base' : 'text-xs'
                            } ${
                              answers[currentQuestion.id] === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {getOptionLabel(currentQuestion.id, opt)}
                          </button>
                        ))}
                      </div>

                      {answers[currentQuestion.id] === 'other' && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('typeNameLabel', 'Type name:')}
                          </label>
                          <input
                            type="text"
                            value={answers[`custom_${currentQuestion.id}`] || ''}
                            onChange={(e) => handleAnswerSelect(`custom_${currentQuestion.id}`, e.target.value)}
                            placeholder={t('enterSpecificNamePlaceholder', 'Enter specific name...')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : currentQuestion.type === 'boolean' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map(opt => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                          className={`p-5 rounded-2xl text-left border transition cursor-pointer font-bold ${
                            isSeniorMode ? 'min-h-[60px] text-base' : 'text-xs'
                          } ${
                            answers[currentQuestion.id] === opt.value
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {getOptionLabel(currentQuestion.id, opt)}
                        </button>
                      ))}
                    </div>
                  ) : currentQuestion.type === 'select' ? (
                    <div className="space-y-2.5">
                      {currentQuestion.options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                          className={`w-full p-4 rounded-2xl text-left border transition cursor-pointer font-bold ${
                            isSeniorMode ? 'min-h-[56px] text-base' : 'text-xs'
                          } ${
                            (answers[currentQuestion.id] || currentQuestion.defaultValue) === opt.value
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {getOptionLabel(currentQuestion.id, opt)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || currentQuestion.defaultValue || ''}
                        onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                        placeholder={currentQuestion.id === 'course_name' ? t('courseNamePlaceholder', currentQuestion.placeholder || 'e.g. Computer Engineering, B.Sc Computer Science, MBA') : t('typeHerePlaceholder', 'Type here...')}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : isLoading ? (
                /* Step Loading: Preparing personalized checklist */
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-50 dark:bg-teal-950/60 border-2 border-teal-500/40 flex items-center justify-center shadow-inner">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600 dark:text-teal-400 animate-spin" />
                    </div>
                  </div>
                  <h3 className={`font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight ${
                    isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                  }`}>
                    {genTexts.loadingTitle}
                  </h3>
                  <p className={`text-slate-600 dark:text-slate-400 max-w-md ${
                    isSeniorMode ? 'text-base sm:text-lg font-semibold' : 'text-xs sm:text-sm font-medium'
                  }`}>
                    {genTexts.loadingSubtitle}
                  </p>

                  {/* Progress Indicator */}
                  <div className="w-full max-w-xs mt-6 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : (
                /* Step Final: Which saved profile should be used? */
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                    {t('finalStepBadge', 'Final Step')}
                  </span>
                  <h2 className={`font-extrabold text-slate-900 dark:text-white mb-2 ${
                    isSeniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                  }`}>
                    {t('whichProfileTitle', 'Which saved profile should be used?')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    {t('whichProfileSubtitle', 'The checklist holder name will be cross-checked during document processing.')}
                  </p>

                  <div className="space-y-3 mb-6">
                    {profiles.map(p => {
                      const isSelected = (selectedProfileId || activeProfile?.id) === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setActiveProfile(p.id);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                            isSeniorMode ? 'min-h-[56px]' : ''
                          } ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                              {p.profile_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                                {p.profile_name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {p.full_name}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{t('selectedBadge', 'Selected')}</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <Link
                    to="/profiles"
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('createProfileInstead', 'Create a new profile instead')}</span>
                  </Link>

                  {/* Failure State & Retry Banner */}
                  {generationError && (
                    <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className={`font-bold text-rose-900 dark:text-rose-200 ${
                            isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'
                          }`}>
                            {genTexts.failedTitle}
                          </h4>
                          <p className={`text-rose-700 dark:text-rose-300 mt-0.5 font-medium ${
                            isSeniorMode ? 'text-sm' : 'text-xs'
                          }`}>
                            {generationError}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAndSave}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSeniorMode ? 'min-h-[48px] text-sm' : ''
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{genTexts.retryBtn}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Wizard Bottom Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSeniorMode ? 'min-h-[52px]' : ''
                  }`}
                >
                  {t('backBtn', 'Back')}
                </button>

                {!isProfileStep ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer ${
                      isSeniorMode ? 'min-h-[52px] text-sm' : ''
                    }`}
                  >
                    <span>{t('nextBtn', 'Next')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateAndSave}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md transition cursor-pointer ${
                      isSeniorMode ? 'min-h-[56px] text-base' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{t('generatingChecklistBtn', 'Generating Checklist...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>{t('generateMyChecklistBtn', 'Generate My Checklist')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: FINAL PERSONALIZED CHECKLIST RESULT                             */}
        {/* ========================================================================= */}
        {generatedChecklist && savedChecklistRecord && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs max-w-full min-w-0">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2 max-w-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{t('checklistResultBadge', 'Personalized Checklist Generated & Saved')}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white break-words">
                    {savedChecklistRecord.institution_name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium break-words">
                    {t('profilePrefix', 'Profile')}: {activeProfile?.profile_name} ({activeProfile?.full_name})
                  </p>
                </div>

                {/* Primary Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="btn-toolbar inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs max-w-full"
                    title="Download printable A4 PDF"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('downloadPdfBtn', 'Download PDF')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="btn-toolbar inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs max-w-full"
                    title="Share summary on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('whatsappBtn', 'WhatsApp')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyChecklist}
                    className="btn-toolbar inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer max-w-full"
                    title="Copy plain text"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('copyBtn', 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/checklists/${savedChecklistRecord.id}`)}
                    className="btn-toolbar inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer max-w-full"
                  >
                    <span>{t('uploadDocsBtn', 'Upload Documents')}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Source & Verified Stamp */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 min-w-0 max-w-full">
                <span>{t('verifiedSourceLabel', 'Verified Official Source:')} <a href={savedChecklistRecord.source_url} target="_blank" rel="noreferrer" className="text-teal-600 font-semibold underline">{savedChecklistRecord.source_url}</a></span>
                <span>{t('lastVerifiedLabel', 'Last Verified:')} 2026-09-30</span>
              </div>
            </div>

            {/* Privacy Warning */}
            <PrivacyBanner />

            {/* Checklist Items Display */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs max-w-full min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {t('docRequirementsHeading', 'Personalized Document Requirements')} ({savedChecklistRecord.result_json?.items?.length || 0})
              </h2>

              <div className="space-y-4">
                {(savedChecklistRecord.result_json?.items || []).map((item, idx) => {
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0 max-w-full"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white break-words">
                              {item.title}
                            </h3>
                            {item.mandatory && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                                {t('mandatoryBadge', 'Mandatory')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium break-words">
                            {item.explanation}
                          </p>
                          <div className="mt-2 text-[11px] text-slate-500 break-words">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{t('acceptedPapersLabel', 'Accepted:')} </span>
                            {item.acceptableDocuments?.join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Right Side Status & Help Button */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-center min-w-0 max-w-full">
                        {getItemBadge(item.status)}

                        {/* "How do I get this?" action button */}
                        {item.helpGuideId && (
                          <button
                            type="button"
                            onClick={() => setActiveHelpGuide({
                              guideId: item.helpGuideId,
                              itemId: item.id,
                              itemTitle: item.title
                            })}
                            className="btn-toolbar inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700/80 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition cursor-pointer max-w-full"
                          >
                            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{t('howDoIGetThisBtn', 'How do I get this?')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTAs */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedChecklist(null);
                    setSavedChecklistRecord(null);
                    setSelectedServiceId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 transition cursor-pointer"
                >
                  ← {t('changeGoalBtn', 'Start Another Checklist')}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/checklists/${savedChecklistRecord.id}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  <span>{t('uploadDocsBtn', 'Proceed to Upload Documents')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Missing Document Help Modal */}
        <DocumentHelpGuide
          isOpen={Boolean(activeHelpGuide)}
          onClose={() => setActiveHelpGuide(null)}
          helpGuideId={activeHelpGuide?.guideId}
          itemId={activeHelpGuide?.itemId}
          itemTitle={activeHelpGuide?.itemTitle}
          checklistId={savedChecklistRecord?.id}
          onStatusUpdated={handleStatusUpdated}
        />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • “{t('tagline', 'One visit is enough.')}”
      </footer>
    </div>
  );
}
