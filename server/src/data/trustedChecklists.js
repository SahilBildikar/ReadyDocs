/**
 * ReadyDocs Trusted Service Document Checklists
 * Authoritative, source-verified requirements for official Indian services.
 * Connected directly to single-source Document Help Guides.
 */

export const TRUSTED_SERVICES = {
  sbi_savings: {
    id: 'sbi_savings',
    title: 'Bank Account Opening',
    institution: 'State Bank of India (SBI)',
    category: 'Banking & Financial Services',
    sourceUrl: 'https://sbi.co.in/web/personal-banking/accounts/saving-account',
    officialAuthority: 'Reserve Bank of India (KYC Master Directions) & State Bank of India',
    description: 'Document readiness package for opening a Savings, Current, or Minor bank account.',
    defaultInstitution: 'State Bank of India (SBI)',
    questions: [
      {
        id: 'bank_name',
        label: 'Which bank do you want to open an account with?',
        type: 'select_with_other',
        options: [
          { value: 'State Bank of India (SBI)', label: 'State Bank of India (SBI) - Recommended' },
          { value: 'HDFC Bank', label: 'HDFC Bank' },
          { value: 'Bank of Baroda', label: 'Bank of Baroda' },
          { value: 'ICICI Bank', label: 'ICICI Bank' },
          { value: 'Punjab National Bank', label: 'Punjab National Bank' },
          { value: 'other', label: 'Other Bank (Type your bank name)' }
        ],
        defaultValue: 'State Bank of India (SBI)'
      },
      {
        id: 'account_type',
        label: 'What type of account do you want?',
        type: 'select',
        options: [
          { value: 'savings', label: 'Regular Savings Account' },
          { value: 'current', label: 'Current / Business Account' },
          { value: 'minor', label: 'Minor Account (Under 18 years old)' }
        ],
        defaultValue: 'savings'
      },
      {
        id: 'is_18_or_above',
        label: 'Are you 18 years old or above?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I am 18 years or older' },
          { value: false, label: 'No - I am under 18' }
        ],
        defaultValue: true
      },
      {
        id: 'has_pan',
        label: 'Do you have a PAN card?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have a valid PAN card' },
          { value: false, label: 'No - I will submit Form 60 declaration' }
        ],
        defaultValue: true
      },
      {
        id: 'address_matches_id',
        label: 'Is your current residential address the same as your ID address?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - Permanent and Current Address are identical' },
          { value: false, label: 'No - I currently reside at a different address' }
        ],
        defaultValue: true
      },
      {
        id: 'has_id_proof',
        label: 'Do you have an Officially Valid Document (Passport, Driving License, Voter ID)?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have valid Government ID' },
          { value: false, label: 'No - I need help getting an ID proof' }
        ],
        defaultValue: true
      }
    ],
    generateItems: (answers) => {
      const bankName = (answers.bank_name || answers.bankName) && (answers.bank_name || answers.bankName) !== 'other' 
        ? (answers.bank_name || answers.bankName) 
        : (answers.custom_bank_name || answers.customBankName || 'Bank');
      const accountType = answers.account_type || answers.accountType || 'savings';
      const isAdult = answers.is_18_or_above !== undefined ? answers.is_18_or_above : (answers.isAdult !== undefined ? answers.isAdult : true);
      const isMinor = accountType === 'minor' || isAdult === false;
      const isCurrent = accountType === 'current';
      const addressMatches = answers.address_matches_id !== undefined ? answers.address_matches_id : (answers.addressMatches !== undefined ? answers.addressMatches : true);
      const hasPan = answers.has_pan !== undefined ? answers.has_pan : (answers.hasPan !== undefined ? answers.hasPan : true);

      const items = [];

      // 1. Photo
      items.push({
        id: 'req_photo',
        title: 'Recent Passport-size Photographs (2 copies)',
        category: 'photograph',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: null,
        acceptedTypes: ['passport_photo'],
        acceptableDocuments: ['Two identical color passport photos with white background, taken within 3 months'],
        explanation: `Mandatory for ${bankName} customer KYC account opening form and specimen signature card.`,
        validityMonths: 3
      });

      // 2. Identity Proof
      items.push({
        id: 'req_id_proof',
        title: 'Officially Valid Identity Proof (OVD)',
        category: 'identity_proof',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_id_proof',
        acceptedTypes: ['identity_proof'],
        acceptableDocuments: [
          'Valid Indian Passport',
          'Driving License (permanent, non-learner)',
          'Election Commission Voter Identity Card',
          'NREGA Job Card signed by State Govt Officer'
        ],
        explanation: `Required under RBI Master Directions on KYC for ${bankName} identity verification.`,
        validityMonths: null
      });

      // 3. Address Proof
      if (addressMatches === true) {
        items.push({
          id: 'req_address_proof',
          title: 'Proof of Address (Covered by OVD)',
          category: 'address_proof',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_address_proof',
          acceptedTypes: ['address_proof', 'identity_proof'],
          acceptableDocuments: [
            'Same Officially Valid Document (Passport, Driving License, Voter ID showing current address)'
          ],
          explanation: 'Since your current address matches your ID proof, no separate utility bill is required.',
          validityMonths: null
        });
      } else {
        items.push({
          id: 'req_address_proof',
          title: 'Deemed Address Proof (Recent Utility Bill)',
          category: 'address_proof',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_address_proof',
          acceptedTypes: ['address_proof'],
          acceptableDocuments: [
            'Electricity Bill (not older than 2 months)',
            'Piped Natural Gas Bill (not older than 2 months)',
            'Water Utility Bill (not older than 2 months)',
            'Municipal Property Tax Receipt (current fiscal year)'
          ],
          explanation: `Required by ${bankName} because your current residential address differs from your primary ID proof.`,
          validityMonths: 2
        });
      }

      // 4. PAN Card or Form 60
      if (hasPan === false) {
        items.push({
          id: 'req_form60',
          title: 'Form 60 Declaration (In lieu of PAN)',
          category: 'tax_declaration',
          section: 'carry_if_needed',
          mandatory: true,
          helpGuideId: 'guide_pan_card',
          acceptedTypes: ['unsupported_document', 'identity_proof'],
          acceptableDocuments: ['Duly filled and signed Form 60 Declaration with income statement'],
          explanation: `Statutory income tax declaration accepted by ${bankName} for individuals without a PAN card.`,
          validityMonths: null
        });
      } else {
        items.push({
          id: 'req_pan',
          title: 'PAN Card (Original + Self-attested photocopy)',
          category: 'identity_proof',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_pan_card',
          acceptedTypes: ['identity_proof'],
          acceptableDocuments: ['Original Physical PAN Card or e-PAN copy'],
          explanation: 'Required for customer tax compliance and transaction reporting.',
          validityMonths: null
        });
      }

      // 5. Minor Guardian Proof
      if (isMinor) {
        items.push({
          id: 'req_minor_guardian',
          title: 'Minor Birth Certificate & Guardian KYC',
          category: 'guardian_proof',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_id_proof',
          acceptedTypes: ['academic_marksheet', 'identity_proof'],
          acceptableDocuments: ['Birth Certificate of minor and OVD ID Proof of parent/natural guardian'],
          explanation: `Mandatory for ${bankName} to establish legal authority of guardian operating the account.`,
          validityMonths: null
        });
      }

      // 6. Current Account Business Proof
      if (isCurrent) {
        items.push({
          id: 'req_business_proof',
          title: 'Business Registration / GSTIN / Trade License',
          category: 'business_proof',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_address_proof',
          acceptedTypes: ['identity_proof', 'address_proof'],
          acceptableDocuments: ['GST Registration Certificate, Shop & Establishment License, or Udyam Aadhar'],
          explanation: 'Statutory proof of business existence and principal place of commercial operation.',
          validityMonths: null
        });
      }

      // 7. Specimen Signature
      items.push({
        id: 'req_signature',
        title: 'Specimen Signature on Clean Paper',
        category: 'specimen_signature',
        section: 'before_you_go',
        mandatory: true,
        helpGuideId: null,
        acceptedTypes: ['specimen_signature'],
        acceptableDocuments: ['Signature in black or blue ink on clear white unruled paper'],
        explanation: `Signature will be scanned into ${bankName} Core Banking System for cheque clearing and branch transactions.`,
        validityMonths: null
      });

      return items;
    }
  },

  sppu_admission: {
    id: 'sppu_admission',
    title: 'College & University Admission',
    institution: 'Savitribai Phule Pune University (SPPU)',
    category: 'Education & Admissions',
    sourceUrl: 'http://www.unipune.ac.in/admissions/',
    officialAuthority: 'Directorate of Higher Education & Savitribai Phule Pune University',
    description: 'Document readiness package for undergraduate, postgraduate, and diploma college admissions.',
    defaultInstitution: 'Savitribai Phule Pune University (SPPU)',
    questions: [
      {
        id: 'institution_name',
        label: 'Which college or university are you applying to?',
        type: 'select_with_other',
        options: [
          { value: 'Savitribai Phule Pune University (SPPU)', label: 'Savitribai Phule Pune University (SPPU) - Recommended' },
          { value: 'Mumbai University', label: 'University of Mumbai' },
          { value: 'COEP Technological University', label: 'COEP Technological University, Pune' },
          { value: 'Fergusson College Pune', label: 'Fergusson College Pune' },
          { value: 'other', label: 'Other College / University (Type name)' }
        ],
        defaultValue: 'Savitribai Phule Pune University (SPPU)'
      },
      {
        id: 'education_level',
        label: 'What level of education are you applying for?',
        type: 'select',
        options: [
          { value: 'ug', label: 'Undergraduate (Bachelor’s Degree - B.Tech, B.Sc, B.Com, BA)' },
          { value: 'pg', label: 'Postgraduate (Master’s Degree - M.Tech, MBA, M.Sc, MA)' },
          { value: 'diploma', label: 'Diploma / Polytechnic' },
          { value: 'certificate', label: 'Certificate Course' }
        ],
        defaultValue: 'ug'
      },
      {
        id: 'course_name',
        label: 'Which course or branch are you pursuing?',
        type: 'text',
        placeholder: 'e.g. Computer Engineering, B.Sc Computer Science, MBA',
        defaultValue: 'Computer Science & Engineering'
      },
      {
        id: 'is_maharashtra',
        label: 'Are you from Maharashtra State?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - Maharashtra State Candidate (Domicile)' },
          { value: false, label: 'No - Other than Maharashtra State (OMS)' }
        ],
        defaultValue: true
      },
      {
        id: 'has_class_10',
        label: 'Do you have your Class 10 (SSC) statement of marks?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have Class 10 marksheet' },
          { value: false, label: 'No - Result awaited or need duplicate' }
        ],
        defaultValue: true
      },
      {
        id: 'has_class_12',
        label: 'Do you have your Class 12 (HSC) statement of marks?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have Class 12 marksheet' },
          { value: false, label: 'No - Result awaited or need duplicate' }
        ],
        defaultValue: true
      },
      {
        id: 'has_category_quota',
        label: 'Are you applying through Category, Scholarship, or Quota?',
        type: 'select',
        options: [
          { value: 'open', label: 'Open / General Category' },
          { value: 'reserved_state', label: 'Reserved Category (SC / ST / OBC / VJNT / SBC)' },
          { value: 'ews', label: 'Economically Weaker Section (EWS)' }
        ],
        defaultValue: 'open'
      }
    ],
    generateItems: (answers) => {
      const collegeName = answers.institution_name && answers.institution_name !== 'other'
        ? answers.institution_name
        : (answers.custom_institution_name || 'University');
      const isPG = answers.education_level === 'pg';
      const items = [];

      // 1. SSC 10th
      items.push({
        id: 'req_ssc_marksheet',
        title: 'Class 10 (SSC) Statement of Marks',
        category: 'academic_marksheet',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_ssc_marksheet',
        acceptedTypes: ['academic_marksheet'],
        acceptableDocuments: ['Original Class 10 / SSC Marksheet or verified DigiLocker Certificate'],
        explanation: `Universal proof of date of birth and secondary school completion for ${collegeName}.`,
        validityMonths: null
      });

      // 2. HSC 12th
      items.push({
        id: 'req_hsc_marksheet',
        title: 'Class 12 (HSC) Statement of Marks',
        category: 'academic_marksheet',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_hsc_marksheet',
        acceptedTypes: ['academic_marksheet'],
        acceptableDocuments: ['Class 12 / HSC Marksheet or provisional college marksheet'],
        explanation: `Mandatory qualifying examination record for higher education eligibility at ${collegeName}.`,
        validityMonths: null
      });

      // 3. Degree certificate if PG
      if (isPG) {
        items.push({
          id: 'req_graduation_degree',
          title: 'Bachelor’s Degree Marksheet / Passing Certificate',
          category: 'academic_marksheet',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: null,
          acceptedTypes: ['academic_marksheet'],
          acceptableDocuments: ['All semester graduation marksheets and degree passing certificate'],
          explanation: `Required for postgraduate eligibility verification at ${collegeName}.`,
          validityMonths: null
        });
      }

      // 4. Domicile / Nationality
      items.push({
        id: 'req_domicile',
        title: answers.is_maharashtra ? 'Maharashtra Domicile & Nationality Certificate' : 'Nationality Certificate / Indian Passport',
        category: 'domicile_certificate',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_domicile_cert',
        acceptedTypes: ['domicile_certificate', 'identity_proof'],
        acceptableDocuments: ['Tahsildar issued Domicile Certificate, Indian Passport, or School Leaving with birthplace'],
        explanation: answers.is_maharashtra 
          ? 'Mandatory to claim Maharashtra state quota and fee benefits.'
          : 'Required to verify nationality under OMS admission rules.',
        validityMonths: null
      });

      // 5. Transfer / Leaving Certificate
      items.push({
        id: 'req_transfer_cert',
        title: 'School / College Leaving Certificate (Transfer Certificate)',
        category: 'transfer_certificate',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_ssc_marksheet',
        acceptedTypes: ['transfer_certificate', 'academic_marksheet'],
        acceptableDocuments: ['Original Transfer Certificate issued by the last attended educational institution'],
        explanation: `Necessary to issue permanent registration number with ${collegeName}.`,
        validityMonths: null
      });

      // 6. Caste & Validity if applicable
      if (answers.has_category_quota === 'reserved_state') {
        items.push({
          id: 'req_caste_cert',
          title: 'Caste Certificate & Caste Validity Certificate',
          category: 'caste_certificate',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_caste_cert',
          acceptedTypes: ['identity_proof', 'domicile_certificate'],
          acceptableDocuments: ['Sub-Divisional Magistrate Caste Certificate + Scrutiny Committee Validity'],
          explanation: `Statutory requirement to claim reserved seat and scholarship benefits under ${collegeName}.`,
          validityMonths: null
        });
      }

      // 7. Photo
      items.push({
        id: 'req_photo',
        title: 'Passport Size Photographs (4 copies)',
        category: 'photograph',
        section: 'before_you_go',
        mandatory: true,
        helpGuideId: null,
        acceptedTypes: ['passport_photo'],
        acceptableDocuments: ['Color passport photos with light background'],
        explanation: 'For student identity card, library membership, and college admission file.',
        validityMonths: null
      });

      return items;
    }
  },

  insurance_claim: {
    id: 'insurance_claim',
    title: 'Insurance Reimbursement Claim',
    institution: 'Health & General Insurance Claim Desk',
    category: 'Healthcare & Insurance',
    sourceUrl: 'https://irdai.gov.in/claim-procedure',
    officialAuthority: 'Insurance Regulatory and Development Authority of India (IRDAI)',
    description: 'Document readiness package for health hospitalization, accidental, or property insurance claims.',
    defaultInstitution: 'Insurance TPA Claim Department',
    questions: [
      {
        id: 'insurance_type',
        label: 'What type of insurance claim are you filing?',
        type: 'select',
        options: [
          { value: 'health', label: 'Health Insurance (Hospitalization / Day-care)' },
          { value: 'vehicle', label: 'Motor / Vehicle Insurance (Accident / Damage)' },
          { value: 'property', label: 'Property / Home Insurance (Fire / Flood / Damage)' }
        ],
        defaultValue: 'health'
      },
      {
        id: 'incident_type',
        label: 'What happened?',
        type: 'select',
        options: [
          { value: 'hospital', label: 'Planned or Emergency Hospital Inpatient Treatment' },
          { value: 'accident', label: 'Road Traffic Accident / Collision' },
          { value: 'damage', label: 'Accidental Damage / Breakdown' },
          { value: 'theft', label: 'Theft / Total Loss' }
        ],
        defaultValue: 'hospital'
      },
      {
        id: 'has_bills',
        label: 'Do you have hospital / repair bills and receipts?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have itemized final bills and payment receipts' },
          { value: false, label: 'No - Bills pending from hospital or repair workshop' }
        ],
        defaultValue: true
      },
      {
        id: 'has_reports',
        label: 'Do you have medical discharge summary / diagnostic reports?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - I have discharge summary and diagnostic reports' },
          { value: false, label: 'No - Awaiting hospital discharge documentation' }
        ],
        defaultValue: true
      },
      {
        id: 'has_fir',
        label: 'Was a Police FIR / Station Diary filed for this incident?',
        type: 'boolean',
        options: [
          { value: true, label: 'Yes - Police FIR / Diary entry registered' },
          { value: false, label: 'No - Medical illness or minor claim (No FIR required)' }
        ],
        defaultValue: false
      }
    ],
    generateItems: (answers) => {
      const isHealth = answers.insurance_type === 'health' || answers.incident_type === 'hospital';
      const items = [];

      if (isHealth) {
        items.push({
          id: 'req_discharge_summary',
          title: 'Hospital Discharge Summary Card',
          category: 'discharge_summary',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_discharge_summary',
          acceptedTypes: ['discharge_summary'],
          acceptableDocuments: ['Comprehensive hospital discharge summary signed by treating doctor with admission/discharge dates'],
          explanation: 'Primary clinical proof of medical necessity and hospitalization duration required by insurance TPA.',
          validityMonths: null
        });

        items.push({
          id: 'req_final_bill',
          title: 'Final Hospital Bill with Itemized Breakup',
          category: 'hospital_bill',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_medical_bills',
          acceptedTypes: ['hospital_bill'],
          acceptableDocuments: ['Detailed final hospital bill detailing bed charges, nursing, pharmacy, and doctor consultations'],
          explanation: 'Required by TPA auditors to determine admissible expense amounts under your policy limits.',
          validityMonths: null
        });

        items.push({
          id: 'req_payment_receipts',
          title: 'Hospital Payment Receipts & Settlement Slips',
          category: 'payment_receipt',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_medical_bills',
          acceptedTypes: ['payment_receipt'],
          acceptableDocuments: ['Numbered revenue-stamped receipts for every advance and settlement payment made to hospital'],
          explanation: 'Proof of actual expenses paid out-of-pocket by the policyholder.',
          validityMonths: null
        });

        items.push({
          id: 'req_doctor_prescription',
          title: 'Treating Doctor Prescription & Diagnostic Reports',
          category: 'doctor_prescription',
          section: 'carry_if_needed',
          mandatory: true,
          helpGuideId: 'guide_discharge_summary',
          acceptedTypes: ['doctor_prescription', 'discharge_summary'],
          acceptableDocuments: ['Pathology, radiology, and MRI/CT scan reports supporting the hospital diagnosis'],
          explanation: 'Confirms clinical validity of investigative procedures and prescribed medicines.',
          validityMonths: null
        });
      }

      if (answers.has_fir === true || answers.incident_type === 'accident' || answers.incident_type === 'theft') {
        items.push({
          id: 'req_fir_copy',
          title: 'Police First Information Report (FIR) / Station Diary',
          category: 'police_report',
          section: 'must_carry',
          mandatory: true,
          helpGuideId: 'guide_fir_copy',
          acceptedTypes: ['identity_proof', 'police_report'],
          acceptableDocuments: ['Certified police FIR copy, Station Diary entry, or Panchnama report'],
          explanation: 'Mandatory legal requirement for accident, theft, or third-party injury claims.',
          validityMonths: null
        });
      }

      // KYC Proof
      items.push({
        id: 'req_id_proof',
        title: 'Policyholder Identity & Address Proof',
        category: 'identity_proof',
        section: 'must_carry',
        mandatory: true,
        helpGuideId: 'guide_id_proof',
        acceptedTypes: ['identity_proof'],
        acceptableDocuments: ['Indian Passport, Driving License, or Voter ID of the primary claimant'],
        explanation: 'Required under IRDAI KYC guidelines for electronic settlement transfer.',
        validityMonths: null
      });

      return items;
    }
  }
};
