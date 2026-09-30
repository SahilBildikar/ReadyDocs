import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PrivacyBanner from '../components/PrivacyBanner';
import DocumentHelpGuide from '../components/DocumentHelpGuide';
import { fetchChecklistById, uploadAndClassifyDocument, deleteDocument, updateChecklistItemStatus } from '../services/checklistApi';
import { generateChecklistPDF } from '../utils/pdfGenerator';
import { shareOnWhatsApp, copyChecklistToClipboard } from '../utils/shareUtils';
import { 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  CheckSquare, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UploadCloud, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles, 
  Lock, 
  Info,
  Layers,
  FileCheck,
  Download,
  Share2,
  Copy,
  HelpCircle
} from 'lucide-react';

export default function ChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetItemId, setTargetItemId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Missing Document Help Guide & Toast states
  const [activeHelpGuide, setActiveHelpGuide] = useState(null); // { guideId, itemId, itemTitle }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyChecklist = async () => {
    if (!checklist) return;
    const items = checklist.result_json?.items || [];
    const success = await copyChecklistToClipboard({
      checklist,
      items
    });
    if (success) {
      showToast('Checklist copied to clipboard!');
    }
  };

  const handleShareWhatsApp = () => {
    if (!checklist) return;
    const items = checklist.result_json?.items || [];
    shareOnWhatsApp({
      checklist,
      items
    });
  };

  const handleDownloadPDF = () => {
    if (!checklist) return;
    const items = checklist.result_json?.items || [];
    generateChecklistPDF({
      checklist,
      items,
      profileName: checklist.profile?.profile_name,
      fullName: checklist.profile?.full_name
    });
    showToast('PDF downloaded successfully!');
  };

  const handleStatusUpdated = (updatedItem, updatedChecklist) => {
    if (updatedChecklist) {
      setChecklist(updatedChecklist);
    } else if (checklist && updatedItem) {
      const items = checklist.result_json?.items || [];
      const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
      setChecklist({
        ...checklist,
        result_json: {
          ...checklist.result_json,
          items: newItems
        }
      });
    }
    showToast('Document status updated.');
  };

  // Load checklist details
  const loadChecklist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchChecklistById(id);
      setChecklist(data.checklist);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load checklist:', err);
      setError(err.message || 'Checklist not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File exceeds 10 MB limit. Please select a smaller sample.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF, JPG, or PNG file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadAndClassifyDocument({
        file: selectedFile,
        checklistId: id,
        targetItemId: targetItemId || null
      });

      setUploadSuccess({
        message: res.message,
        classification: res.classification,
        matchedItem: res.matchedItem
      });
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('doc-file-input');
      if (fileInput) fileInput.value = '';

      // Reload fresh state from backend
      await loadChecklist();
    } catch (err) {
      console.error('Upload & classification error:', err);
      setUploadError(err.message || 'Failed to process document with Gemini AI.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Helper to generate and upload safe dummy sample files for testing and evaluation.
   */
  const handleQuickUploadSample = async (sampleType, defaultTargetId) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      let fileName = 'sample_document.pdf';
      let mimeType = 'application/pdf';
      let content = '%PDF-1.4 Mock Safe Verification Document';

      if (sampleType === 'passport') {
        fileName = 'sample_passport_ovd.pdf';
        mimeType = 'application/pdf';
        content = '%PDF-1.4 Mock Government Passport Identity Proof';
      } else if (sampleType === 'utility_bill') {
        fileName = 'sample_electricity_bill.jpg';
        mimeType = 'image/jpeg';
        content = 'Mock Utility Bill Image Data';
      } else if (sampleType === 'photo') {
        fileName = 'sample_portrait_photo.png';
        mimeType = 'image/png';
        content = 'Mock Passport Photograph';
      } else if (sampleType === 'signature') {
        fileName = 'sample_specimen_signature.png';
        mimeType = 'image/png';
        content = 'Mock Specimen Signature';
      } else if (sampleType === 'marksheet') {
        fileName = 'sample_10th_ssc_marksheet.pdf';
        mimeType = 'application/pdf';
        content = '%PDF-1.4 Mock Academic Marksheet';
      } else if (sampleType === 'discharge') {
        fileName = 'sample_hospital_discharge_summary.pdf';
        mimeType = 'application/pdf';
        content = '%PDF-1.4 Mock Hospital Discharge Summary';
      }

      const blob = new Blob([content], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });

      const res = await uploadAndClassifyDocument({
        file,
        checklistId: id,
        targetItemId: defaultTargetId || null
      });

      setUploadSuccess({
        message: res.message,
        classification: res.classification,
        matchedItem: res.matchedItem
      });

      await loadChecklist();
    } catch (err) {
      console.error('Quick sample upload failed:', err);
      setUploadError(err.message || 'Sample upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this uploaded document?')) return;

    try {
      await deleteDocument(docId);
      await loadChecklist();
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading checklist details...</p>
        </main>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="max-w-xl w-full mx-auto px-4 py-16 text-center">
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-rose-950 dark:text-rose-100">Error Loading Checklist</h2>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 mb-4">{error}</p>
            <Link
              to="/checklists"
              className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
            >
              Back to Checklists
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const items = checklist.result_json?.items || [];
  const mandatoryItems = items.filter(i => i.mandatory);
  const matchedCount = items.filter(i => i.status === 'matched').length;
  const reviewCount = items.filter(i => i.status === 'needs_review').length;
  const missingCount = items.filter(i => i.status === 'missing' || !i.status).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Visit
          </span>
        );
      case 'needs_attention':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" /> Needs Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Incomplete ({missingCount} Missing)
          </span>
        );
    }
  };

  const getItemBadge = (itemStatus) => {
    switch (itemStatus) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Matched
          </span>
        );
      case 'application_in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'ready_to_upload':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
            <CheckSquare className="w-3 h-3" /> Ready to Upload
          </span>
        );
      case 'not_applicable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            N/A
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3 h-3" /> Needs Review
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" /> Unsupported
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Clock className="w-3 h-3" /> Missing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/checklists"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Checklists</span>
          </Link>

          {checklist.source_url && (
            <a
              href={checklist.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <span>Official Rules Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {checklist.institution_name}
                </span>
                <span>•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Profile: {checklist.profile?.profile_name || 'Assigned Profile'} ({checklist.profile?.full_name || 'Holder'})
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {checklist.result_json?.serviceTitle || 'Document Readiness Checklist'}
              </h1>
            </div>

            {/* Action buttons & Status Badge */}
            <div className="shrink-0 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
                title="Download printable A4 PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                title="Share summary on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
                title="Copy plain text"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>

              {getStatusBadge(checklist.status)}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Items</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{items.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Matched</span>
              <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1 block">{matchedCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Needs Review</span>
              <span className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1 block">{reviewCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Missing</span>
              <span className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1 block">{missingCount}</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <PrivacyBanner />

        {/* Main 2-Column Grid: Left = Document Upload & AI Classifier, Right = Checklist Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Upload & AI Processor (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload & Classify Document
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PDF, JPG, PNG up to 10 MB
                  </p>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Target checklist item selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Match Against Requirement:
                  </label>
                  <select
                    value={targetItemId}
                    onChange={(e) => setTargetItemId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">Auto-Detect Requirement (Recommended)</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.title} {i.status === 'matched' ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File picker */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-teal-500 transition">
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="doc-file-input" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {selectedFile ? (
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          Click to browse file
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          PDF, JPG, PNG (Max 10 MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Upload Button */}
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gemini Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Classify & Verify with Gemini</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Hackathon Demo Helper: 1-Click Safe Sample Files */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Hackathon Fast-Test (Safe Demo Samples)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {checklist.service_type === 'sbi_savings' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('passport', 'req_id_proof')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        📄 <strong>Passport (OVD)</strong>
                        <span className="block text-[10px] text-slate-500">Identity Proof</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('utility_bill', 'req_address_proof')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        ⚡ <strong>Utility Bill</strong>
                        <span className="block text-[10px] text-slate-500">Address Proof</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('photo', 'req_photo')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        👤 <strong>Portrait Photo</strong>
                        <span className="block text-[10px] text-slate-500">Passport Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('signature', 'req_signature')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        ✍️ <strong>Signature</strong>
                        <span className="block text-[10px] text-slate-500">Specimen Signature</span>
                      </button>
                    </>
                  )}

                  {checklist.service_type === 'sppu_admission' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('marksheet', 'req_ssc_marksheet')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        🎓 <strong>SSC Marksheet</strong>
                        <span className="block text-[10px] text-slate-500">10th Statement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('passport', 'req_domicile')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        🏛️ <strong>Domicile / Passport</strong>
                        <span className="block text-[10px] text-slate-500">Nationality Proof</span>
                      </button>
                    </>
                  )}

                  {checklist.service_type === 'insurance_claim' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('discharge', 'req_discharge_summary')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        🏥 <strong>Discharge Summary</strong>
                        <span className="block text-[10px] text-slate-500">Hospital Inpatient</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUploadSample('utility_bill', 'req_final_bill')}
                        disabled={isUploading}
                        className="p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition"
                      >
                        📑 <strong>Itemized Bill</strong>
                        <span className="block text-[10px] text-slate-500">Hospital Expenses</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Error / Success alerts */}
              {uploadError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{uploadSuccess.message}</span>
                  </div>

                  {uploadSuccess.classification && (
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      <div><strong>Document:</strong> {uploadSuccess.classification.detectedDocumentName}</div>
                      <div><strong>Issuer:</strong> {uploadSuccess.classification.issuingAuthority}</div>
                      <div><strong>Clarity:</strong> {uploadSuccess.classification.visualQuality} (Confidence: {(uploadSuccess.classification.confidenceScore * 100).toFixed(0)}%)</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                        ✓ {uploadSuccess.classification.summaryNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Uploaded Documents List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Uploaded Documents ({documents.length})</span>
              </h3>

              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No documents uploaded yet. Upload a sample document above to test Gemini classification.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {doc.file_name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {doc.ai_classification_json?.detectedDocumentName || doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getItemBadge(doc.status)}
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checklist Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Checklist Requirements
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Match all mandatory items before visiting the branch or submission portal.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    {matchedCount} of {items.length} Ready
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => {
                  const isMatched = item.status === 'matched';
                  const isReview = item.status === 'needs_review';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition ${
                        isMatched
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                          : isReview
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isMatched
                              ? 'bg-emerald-600 text-white'
                              : isReview
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </h4>
                              {item.mandatory && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                              {item.explanation}
                            </p>

                            {/* Acceptable documents note */}
                            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Accepted: </span>
                              {item.acceptableDocuments?.join(', ')}
                            </div>

                            {/* Uploaded document attachment detail */}
                            {item.matchedDocumentName && (
                              <div className="mt-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <FileCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                <span>Attached: <strong>{item.matchedDocumentName}</strong></span>
                                {item.detectedType && (
                                  <span className="text-slate-400">({item.detectedType})</span>
                                )}
                              </div>
                            )}

                            {item.summaryNotes && (
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                                Note: {item.summaryNotes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {getItemBadge(item.status)}

                          {item.helpGuideId && (
                            <button
                              type="button"
                              onClick={() => setActiveHelpGuide({
                                guideId: item.helpGuideId,
                                itemId: item.id,
                                itemTitle: item.title
                              })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-teal-300 dark:border-teal-700/80 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition cursor-pointer"
                              title="View official step-by-step assistance"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>How do I get this?</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Missing Document Help Modal */}
        <DocumentHelpGuide
          isOpen={Boolean(activeHelpGuide)}
          onClose={() => setActiveHelpGuide(null)}
          helpGuideId={activeHelpGuide?.guideId}
          itemId={activeHelpGuide?.itemId}
          itemTitle={activeHelpGuide?.itemTitle}
          checklistId={checklist?.id}
          onStatusUpdated={handleStatusUpdated}
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        ReadyDocs • Intelligent Document Processing • “One visit is enough.”
      </footer>
    </div>
  );
}
