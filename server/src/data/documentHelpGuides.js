/**
 * ReadyDocs Authoritative Document Help Guides
 * Single Source of Truth for "How do I get this document?"
 * Official portals only. Rules, fees, and timelines verified as of September 2026.
 */

export const DOCUMENT_HELP_GUIDES = {
  guide_pan_card: {
    id: 'guide_pan_card',
    documentName: {
      en: 'Permanent Account Number (PAN) Card / Form 60',
      hi: 'पैन कार्ड (PAN Card) / फॉर्म 60',
      mr: 'पॅन कार्ड (PAN Card) / फॉर्म ६०'
    },
    whyNeeded: {
      en: 'Required by the Income Tax Department and Reserve Bank of India for customer financial identification, tax tracking, and opening bank accounts.',
      hi: 'आयकर विभाग और आरबीआई द्वारा बैंक खाता खोलने और वित्तीय लेन-देन के लिए आवश्यक है।',
      mr: 'प्राप्तिकर विभाग आणि आरबीआयच्या नियमानुसार बँक खाते उघडण्यासाठी आणि आर्थिक व्यवहारांसाठी आवश्यक आहे.'
    },
    eligibility: 'Any Indian citizen, NRI, minor (through parent/guardian), or legal entity with valid proof of identity and address.',
    prerequisites: {
      required: [
        'Proof of Identity (Passport, Voter ID, Driving License)',
        'Proof of Address (Utility bill, Voter ID, Passport)',
        'Proof of Date of Birth (Birth certificate, Class 10 marksheet)',
        'Two recent color passport-size photographs'
      ],
      optional: [
        'Aadhaar card for instantaneous paperless e-KYC (e-PAN)'
      ]
    },
    steps: [
      'Visit the official Protean (formerly NSDL) or UTIITSL PAN application portal.',
      'Select Application Type as "New PAN - Indian Citizen (Form 49A)".',
      'Fill in your applicant details (Full Name, Date of Birth, Address, Contact).',
      'Choose digital paperless submission (e-Sign/e-KYC) or physical submission by post.',
      'Pay the statutory processing fee online (Credit/Debit Card, Net Banking, UPI).',
      'Save the 15-digit acknowledgement number to track application status.',
      'Digital e-PAN is delivered to your email within 24-48 hours; physical card is dispatched by Speed Post in 10-15 working days.'
    ],
    officialPortal: {
      name: 'Protean eGov (formerly NSDL) / UTIITSL Portal',
      url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
      buttonText: 'Visit Official PAN Application Portal'
    },
    feeAndTimeline: {
      feeText: '₹107 for physical card dispatched within India; ₹72 for e-PAN only (Subject to official tax revisions). Form 60 is completely free.',
      timelineText: '24 to 48 hours for electronic e-PAN; 10 to 15 working days for physical card delivery.'
    },
    alternatives: [
      {
        name: 'Form 60 Declaration',
        description: 'If you do not possess a PAN card and do not have taxable agricultural/business income, you can submit Form 60 directly at the bank branch.',
        acceptedWhere: 'May be accepted depending on the institution or service (permitted by SBI and RBI KYC for regular savings accounts).'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_id_proof: {
    id: 'guide_id_proof',
    documentName: {
      en: 'Officially Valid Identity Proof (OVD)',
      hi: 'आधिकारिक वैध पहचान प्रमाण (OVD)',
      mr: 'अधिकृत वैध ओळख पुरावा (OVD)'
    },
    whyNeeded: {
      en: 'Mandatory under RBI Master Directions on KYC to verify customer identity and citizenship before account opening.',
      hi: 'आरबीआई केवाईसी नियमों के तहत ग्राहक की पहचान और नागरिकता सत्यापित करने के लिए अनिवार्य है।',
      mr: 'आरबीआयच्या केवायसी नियमांनुसार ग्राहकाची ओळख आणि नागरिकत्व तपासण्यासाठी अनिवार्य आहे.'
    },
    eligibility: 'All Indian citizens residing in India or overseas.',
    prerequisites: {
      required: [
        'Proof of Date of Birth',
        'Residential address details',
        'Recent photograph'
      ],
      optional: [
        'Old expired ID card in case of renewal'
      ]
    },
    steps: [
      'Choose your preferred primary government ID: Indian Passport, Driving License, or Election Voter ID (EPIC).',
      'For Passport: Apply online via the official Passport Seva portal and book an appointment at the nearest PSK/POPSK.',
      'For Driving License: Apply through the official Parivahan Sarathi portal for a Learner / Permanent DL.',
      'For Voter ID: Apply online via the Voters’ Service Portal (Form 6) of the Election Commission of India.',
      'Submit the required identity documents and attend biometric verification or RTO appointment.',
      'Track your application number online until delivery.'
    ],
    officialPortal: {
      name: 'Passport Seva / Parivahan Sarathi / ECI Voters Portal',
      url: 'https://www.passportindia.gov.in/',
      buttonText: 'Visit Passport Seva Portal'
    },
    feeAndTimeline: {
      feeText: 'Passport: ₹1,500 standard fee. Voter ID: Free. Driving License: State RTO fee varies (~₹200 to ₹1000).',
      timelineText: 'Check the official portal for current fee and processing time.'
    },
    alternatives: [
      {
        name: 'Election Commission Voter ID (EPIC)',
        description: 'Accepted as valid OVD ID proof across all public and private banks in India.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'Driving License (Non-Learner)',
        description: 'Valid government-issued photo identity proof.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'NREGA Job Card',
        description: 'Issued by State Government and signed by an authorized gazetted officer.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_address_proof: {
    id: 'guide_address_proof',
    documentName: {
      en: 'Proof of Address (Utility Bill / Deemed Proof)',
      hi: 'पते का प्रमाण (बिजली बिल / मान्य प्रमाण)',
      mr: 'पत्त्याचा पुरावा (विद्युत बिल / अधिकृत पुरावा)'
    },
    whyNeeded: {
      en: 'Required by banks, telecom providers, and educational institutes to establish your current physical residence address.',
      hi: 'बैंक और संस्थान में आपके वर्तमान निवास पते की पुष्टि के लिए आवश्यक है।',
      mr: 'बँक आणि शैक्षणिक संस्थांमध्ये तुमच्या सध्याच्या निवासी पत्त्याची पडताळणी करण्यासाठी आवश्यक आहे.'
    },
    eligibility: 'Any individual residing at the stated residential premises.',
    prerequisites: {
      required: [
        'Recent statement or bill from an authorized public utility service provider',
        'Customer / Consumer number for online retrieval'
      ],
      optional: [
        'Registered rental agreement if staying in rented accommodation'
      ]
    },
    steps: [
      'Download your latest monthly utility bill from your state distribution provider (e.g. MSEDCL for Maharashtra, Tata Power, Adani, or Municipal Water).',
      'Log in to your consumer portal or utility mobile application using your Consumer Number.',
      'Download the official computer-generated PDF tax invoice / payment receipt.',
      'Ensure the bill is dated within the last 2 months from the date of submission.',
      'If in a rental accommodation, attach a registered Leave & License agreement alongside the owner’s utility bill.'
    ],
    officialPortal: {
      name: 'State Electricity & Utility Distribution Portals (e.g. Mahavitaran / National Utility Services)',
      url: 'https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill',
      buttonText: 'Visit Mahavitaran Utility Portal'
    },
    feeAndTimeline: {
      feeText: 'Free to download recent monthly consumer utility invoices online.',
      timelineText: 'Instant download from the provider web portal.'
    },
    alternatives: [
      {
        name: 'Piped Natural Gas (PNG) / LPG Consumer Bill',
        description: 'Recent gas connection invoice issued within the last 2 months.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'Property or Municipal Tax Receipt',
        description: 'Latest annual municipal tax assessment receipt showing property address.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'Bank Passbook / Post Office Savings Statement',
        description: 'Passbook with stamped address from a recognized bank or Department of Posts.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_ssc_marksheet: {
    id: 'guide_ssc_marksheet',
    documentName: {
      en: 'Class 10 (SSC) Statement of Marks / Certificate',
      hi: 'कक्षा 10 (SSC) अंकतालिका / प्रमाण पत्र',
      mr: 'इयत्ता १० वी (SSC) गुणपत्रिका / प्रमाणपत्र'
    },
    whyNeeded: {
      en: 'Serves as universal official proof of Date of Birth, full name spelling, and qualifying secondary school education for college admissions and government exams.',
      hi: 'जन्म तिथि, नाम की शुद्धता और कॉलेज प्रवेश के लिए अनिवार्य प्रमाण पत्र है।',
      mr: 'जन्मतारीख, नावाचा पुरावा आणि महाविद्यालयीन प्रवेशासाठी आवश्यक शैक्षणिक दस्तऐवज.'
    },
    eligibility: 'Students who appeared for and cleared the Secondary School Certificate (SSC / Class 10) examination from a recognized state or national board (MSBSHSE, CBSE, ICSE).',
    prerequisites: {
      required: [
        'SSC Seat Number / Roll Number',
        'Year and Month of Examination',
        'Candidate and Mother’s name as registered with the Board'
      ],
      optional: [
        'DigiLocker account linked with registered mobile number'
      ]
    },
    steps: [
      'For instant digital copy: Download the Government of India DigiLocker app or visit digilocker.gov.in.',
      'Search for "Maharashtra State Board of Secondary and Higher Secondary Education" (or your relevant board).',
      'Select "Class X Passing Certificate / Marksheet".',
      'Enter Exam Year, Session, and Seat Number to fetch the cryptographically signed digital certificate.',
      'For official physical duplicate certificate: Visit the Maharashtra State Board Divisional Board Office or apply online at mh-ssc.ac.in.',
      'Submit Form for Duplicate Marksheet with Board verification fee.'
    ],
    officialPortal: {
      name: 'MSBSHSE Pune / DigiLocker National Portal',
      url: 'https://www.digilocker.gov.in/',
      buttonText: 'Get Digital Marksheet on DigiLocker'
    },
    feeAndTimeline: {
      feeText: 'DigiLocker: Completely free and legally valid under IT Act 2000. Physical Board Duplicate: ₹100 to ₹300.',
      timelineText: 'DigiLocker is instant. Physical duplicate takes 7 to 15 working days from Divisional Board office.'
    },
    alternatives: [
      {
        name: 'DigiLocker Digitally Signed Marksheet',
        description: 'Legally equivalent to original physical marksheet under Rule 9A of IT (Preservation and Retention of Information) Rules, 2016.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'School Leaving Certificate / Transfer Certificate (TC)',
        description: 'Shows date of birth and secondary school completion if marksheet is temporarily with board scrutiny.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_hsc_marksheet: {
    id: 'guide_hsc_marksheet',
    documentName: {
      en: 'Class 12 (HSC) Statement of Marks / Certificate',
      hi: 'कक्षा 12 (HSC) अंकतालिका / प्रमाण पत्र',
      mr: 'इयत्ता १२ वी (HSC) गुणपत्रिका / प्रमाणपत्र'
    },
    whyNeeded: {
      en: 'Primary qualifying examination credential required for university admissions (UG degree programs, technical courses, and competitive counseling).',
      hi: 'विश्वविद्यालय प्रवेश और उच्च शिक्षा के लिए प्राथमिक योग्यता दस्तावेज।',
      mr: 'विद्यापीठ आणि उच्च शिक्षणातील पदवी प्रवेशासाठी प्राथमिक पात्रता दस्तऐवज.'
    },
    eligibility: 'Candidates who appeared for Higher Secondary Certificate (HSC / Class 12) examinations.',
    prerequisites: {
      required: [
        'HSC Seat Number / Roll Number',
        'Passing Year and Examination Session',
        'Mother’s registered name'
      ],
      optional: [
        'College index number'
      ]
    },
    steps: [
      'Open digilocker.gov.in or the official MSBSHSE portal (mahahsscboard.in).',
      'Select "Class XII Marksheet" from the education department listings.',
      'Enter the Seat Number, Passing Year, and verification details.',
      'Download the official digitally signed marksheet bearing the QR code.',
      'For physical duplicate copy, approach your Junior College or the Divisional Secretary of the State Board with the prescribed application form.'
    ],
    officialPortal: {
      name: 'MSBSHSE Official Board / DigiLocker Portal',
      url: 'https://www.mahahsscboard.in/',
      buttonText: 'Visit MSBSHSE Official Portal'
    },
    feeAndTimeline: {
      feeText: 'DigiLocker: Free. Physical Board Duplicate: Nominal fee as per board guidelines (~₹100 to ₹300).',
      timelineText: 'DigiLocker is instant. Board duplicate takes 10 to 15 working days.'
    },
    alternatives: [
      {
        name: 'Provisional Marksheet from Junior College',
        description: 'College-stamped and Principal-signed marksheet statement issued immediately after result declaration.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_domicile_cert: {
    id: 'guide_domicile_cert',
    documentName: {
      en: 'Maharashtra State Domicile & Nationality Certificate',
      hi: 'महाराष्ट्र अधिवास एवं राष्ट्रीयता प्रमाण पत्र',
      mr: 'महाराष्ट्र अधिवास व राष्ट्रीयत्व प्रमाणपत्र (Domicile)'
    },
    whyNeeded: {
      en: 'Mandatory proof of 15 years continuous residence in Maharashtra required to claim state quota seats, university reservation, and scholarships under CET Cell and SPPU.',
      hi: 'महाराष्ट्र राज्य कोटे में प्रवेश, छात्रवृत्ति और आरक्षण लाभ प्राप्त करने के लिए आवश्यक है।',
      mr: 'महाराष्ट्र राज्य कोट्यातील जागा, शिष्यवृत्ती आणि विद्यापीठ प्रवेशातील आरक्षणासाठी अनिवार्य.'
    },
    eligibility: 'Applicants residing in Maharashtra for a minimum of 15 continuous years, or born in Maharashtra to permanent resident parents.',
    prerequisites: {
      required: [
        'Proof of Residence for 15 years (School leaving certificates, Electricity bills, Ration card)',
        'Birth Certificate or School Leaving Certificate showing place of birth in Maharashtra',
        'Self-declaration / Affidavit in prescribed government format',
        'Two passport size photographs'
      ],
      optional: [
        'Father or Mother’s domicile certificate as supporting linkage'
      ]
    },
    steps: [
      'Visit the Government of Maharashtra Aaple Sarkar portal (aaplesarkar.mahaonline.gov.in) or visit your nearest Maha e-Seva Kendra / Setu Office.',
      'Create a citizen account and navigate to Revenue Department -> Certificate of Domicile.',
      'Fill in applicant details, residence history covering 15 years, and upload scanned supporting papers.',
      'Pay the government statutory service fee online.',
      'Download and note the Application Tracking ID.',
      'The Nayab Tahsildar / Executive Magistrate conducts scrutiny and issues the digital certificate with Barcode/QR.'
    ],
    officialPortal: {
      name: 'Aaple Sarkar (Government of Maharashtra)',
      url: 'https://aaplesarkar.mahaonline.gov.in/',
      buttonText: 'Apply on Aaple Sarkar Portal'
    },
    feeAndTimeline: {
      feeText: 'Government fee: ₹23.60 to ₹50 as notified by Revenue Department under Maharashtra Right to Public Services Act.',
      timelineText: 'Official statutory delivery timeline: 15 working days from submission.'
    },
    alternatives: [
      {
        name: 'Indian Passport (showing Place of Birth in Maharashtra)',
        description: 'Some universities and CET counseling accept a valid passport showing place of birth in Maharashtra in lieu of nationality proof.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'School Leaving Certificate with Place of Birth in Maharashtra',
        description: 'College transfer certificate clearly mentioning birth location within Maharashtra state boundaries.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_caste_cert: {
    id: 'guide_caste_cert',
    documentName: {
      en: 'Caste Certificate & Caste Validity Certificate',
      hi: 'जाति प्रमाण पत्र एवं वैधता प्रमाण पत्र',
      mr: 'जात प्रमाणपत्र व जात पडताळणी प्रमाणपत्र (Caste & Validity)'
    },
    whyNeeded: {
      en: 'Statutory requirement in Maharashtra to claim affirmative action benefits, reserved category university seats (SC/ST/OBC/VJNT/SBC), fee concessions, and government scholarships.',
      hi: 'महाराष्ट्र में आरक्षित श्रेणी की सीटों, शुल्क रियायत और छात्रवृत्ति के लिए आवश्यक।',
      mr: 'महाराष्ट्रात आरक्षित जागा, फी सवलत आणि सरकारी शिष्यवृत्ती मिळवण्यासाठी कायदेशीर पुरावा.'
    },
    eligibility: 'Persons belonging to notified Scheduled Castes, Scheduled Tribes, Other Backward Classes, or Special Backward Classes whose family was resident in Maharashtra prior to the presidential cutoff year (1950 for SC/ST, 1967 for OBC/VJNT).',
    prerequisites: {
      required: [
        'Applicant’s School Leaving Certificate mentioning caste and sub-caste',
        'Father’s or paternal relative’s primary school record/leaving certificate prior to cutoff year',
        'Genealogy chart / Family tree (Vanshavali) signed by applicant/family head',
        'Affidavit in Form 3 / Form 17 prescribed by Social Justice Dept'
      ],
      optional: [
        'Existing caste validity certificate of paternal blood relative (Father, Uncle, Paternal Sibling)'
      ]
    },
    steps: [
      'Apply first for the initial Caste Certificate on the Aaple Sarkar portal or Sub-Divisional Magistrate (SDO) office.',
      'Once Caste Certificate is issued, register on the CCVS portal (barti.maharashtra.gov.in) for Caste Scrutiny Validity.',
      'Submit the college recommendation letter (Form 16) seeking caste validity for educational admission.',
      'Upload genealogy tree and pre-cutoff paternal evidence.',
      'Attend the Divisional Caste Scrutiny Committee hearing if summoned.',
      'Download the final digital Caste Validity Certificate.'
    ],
    officialPortal: {
      name: 'Aaple Sarkar / BARTI CCVS Portal',
      url: 'https://barti.maharashtra.gov.in/',
      buttonText: 'Visit BARTI Caste Scrutiny Portal'
    },
    feeAndTimeline: {
      feeText: 'Government application fee: ₹50 for initial certificate; scrutiny fee as notified by Social Justice Department.',
      timelineText: 'Caste Certificate: 21 to 45 working days. Caste Validity: 1 to 3 months (apply as early as possible).'
    },
    alternatives: [
      {
        name: 'Official Scrutiny Committee Application Receipt',
        description: 'Some universities and CET allotment desks permit provisional admission upon submitting the official Caste Scrutiny Application Receipt with an undertaking to produce validity before the first semester.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_discharge_summary: {
    id: 'guide_discharge_summary',
    documentName: {
      en: 'Hospital Discharge Summary Card',
      hi: 'अस्पताल डिस्चार्ज सारांश कार्ड',
      mr: 'हॉस्पिटल डिस्चार्ज सारांश (Discharge Summary)'
    },
    whyNeeded: {
      en: 'Primary medical legal document confirming hospital admission date, treating doctor diagnosis, clinical interventions, surgical notes, and date/condition at discharge. Essential for any health insurance claim.',
      hi: 'स्वास्थ्य बीमा दावे के लिए उपचार, भर्ती तिथि, निदान और चिकित्सक की पुष्टि का मुख्य दस्तावेज।',
      mr: 'आरोग्य विमा दाव्यासाठी उपचाराचा कालावधी, निदान आणि डॉक्टरांच्या मान्यतेचा मुख्य कागदपत्र.'
    },
    eligibility: 'Any patient discharged from an inpatient hospital stay or day-care procedure.',
    prerequisites: {
      required: [
        'Patient Hospital Inpatient Registration Number (IPD / UHID No.)',
        'Full name of treating consultant / surgeon',
        'Settlement of hospital billing desk dues'
      ],
      optional: [
        'Previous admission medical record ID in case of chronic illness'
      ]
    },
    steps: [
      'Contact the Hospital Inpatient Nursing Station or Medical Records Department (MRD) on the day of discharge.',
      'Request the comprehensive typed Discharge Summary prepared by the resident doctor and signed by the chief consultant.',
      'Verify that patient full name, age, admission date & time, discharge date & time, and final diagnosis are accurately typed.',
      'Ensure the summary bears the hospital official stamp, treating doctor’s name, and Medical Council Registration Number (RMP Reg No.).',
      'If additional copies are required later, submit a formal request to the hospital Medical Superintendent / TPA Helpdesk with patient ID.'
    ],
    officialPortal: {
      name: 'Hospital Medical Records Dept / IRDAI Guidelines Portal',
      url: 'https://irdai.gov.in/claim-procedure',
      buttonText: 'View IRDAI Claim Documentation Guidelines'
    },
    feeAndTimeline: {
      feeText: 'Original discharge card is provided free of charge by the hospital at discharge. Duplicate certified copy: Nominal hospital MRD fee (~₹50 to ₹200).',
      timelineText: 'Provided on discharge day or within 24 to 48 hours for complex surgical cases.'
    },
    alternatives: [
      {
        name: 'Treating Physician Certificate / Clinical Letter',
        description: 'A signed letter from the treating consultant detailing admission reason and treatment course if the formal summary is undergoing audit.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_medical_bills: {
    id: 'guide_medical_bills',
    documentName: {
      en: 'Itemized Hospital Bills & Payment Receipts',
      hi: 'अस्पताल बिल और भुगतान रसीदें',
      mr: 'हॉस्पिटलचे सविस्तर बिल व पेमेंट पावत्या'
    },
    whyNeeded: {
      en: 'Insurance Third Party Administrators (TPAs) require detailed itemized tariff breakdowns (room rent, nursing, ICU, pharmacy, surgeon fees) and money receipts to calculate payable reimbursement.',
      hi: 'बीमा टीपीए द्वारा रूम रेंट, दवाइयों और डॉक्टर शुल्क के सटीक भुगतान सत्यापन के लिए अनिवार्य।',
      mr: 'विमा कंपनीकडून औषधे, रूम भाडे आणि वैद्यकीय खर्चाच्या अचूक मंजुरीसाठी आवश्यक.'
    },
    eligibility: 'Patient or policyholder who settled hospital medical expenses.',
    prerequisites: {
      required: [
        'Original hospital final bill bearing item-by-item price breakup',
        'Numbered payment receipts for all advance and final settlements',
        'Original pharmacy invoices with doctor prescription'
      ],
      optional: [
        'Breakup summary certificate issued by hospital billing manager'
      ]
    },
    steps: [
      'Approach the hospital billing counter prior to discharge and request the "Detailed Itemized Final Bill" (not merely an estimate or interim summary).',
      'Collect separate revenue-stamped payment receipts for every cash, card, or UPI transaction made.',
      'Collect all original pharmacy tax invoices along with batch numbers and doctor prescription chits.',
      'Ensure the final bill total exactly tallies with the sum of all individual payment receipts.',
      'Get the final bill stamped as "Paid and Settled in Full" with the cashier signature.'
    ],
    officialPortal: {
      name: 'Treating Hospital Billing Office / IRDAI Customer Portal',
      url: 'https://irdai.gov.in/',
      buttonText: 'Visit IRDAI Regulatory Portal'
    },
    feeAndTimeline: {
      feeText: 'Issued free of charge by the hospital upon account settlement.',
      timelineText: 'Obtained immediately upon discharge settlement.'
    },
    alternatives: [
      {
        name: 'Consolidated Billing Summary Certificate',
        description: 'Signed certificate from the hospital accounts head certifying total payments received against the patient inpatient registration.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  },

  guide_fir_copy: {
    id: 'guide_fir_copy',
    documentName: {
      en: 'Police First Information Report (FIR) / Station Diary Entry',
      hi: 'पुलिस प्रथम सूचना रिपोर्ट (FIR) / स्टेशन डायरी प्रविष्टि',
      mr: 'पोलीस एफआयआर (FIR) प्रत / स्टेशन डायरी नोंद'
    },
    whyNeeded: {
      en: 'Mandatory legal requirement for motor accident claims, vehicle or property theft, major bodily injury, and accidental third-party insurance liability.',
      hi: 'वाहन दुर्घटना, चोरी, और दुर्घटना दावों के लिए पुलिस कानूनी प्रमाणीकरण।',
      mr: 'वाहन अपघात, चोरी आणि अपघाती विमा दाव्यासाठी कायदेशीर पोलीस नोंद.'
    },
    eligibility: 'Victim, vehicle owner, property owner, or any witness reporting a cognizable offense or accident.',
    prerequisites: {
      required: [
        'Details of the incident (Date, Time, Exact Location, Incident description)',
        'Vehicle registration number, chassis number, and driver details (for motor accidents)',
        'Complainant identity proof'
      ],
      optional: [
        'Photographs of the vehicle damage or incident spot'
      ]
    },
    steps: [
      'Report the accident or theft immediately to the local police station having territorial jurisdiction, or use the State Police e-FIR portal (e.g. Maharashtra Police Citizen Portal).',
      'Provide accurate facts regarding the date, vehicle details, driver details, and damages.',
      'The Duty Officer records your statement under Section 154 of the CrPC.',
      'Under statutory Indian law, the informant is entitled to receive a certified copy of the FIR immediately and completely free of cost.',
      'If the incident is a minor accidental damage without third-party injury, request a Station Diary (SD) Entry or Non-Cognizable (NC) complaint copy.'
    ],
    officialPortal: {
      name: 'State Police Citizen Portal (e.g. Maharashtra Police Citizen Portal)',
      url: 'https://citizen.mahapolice.gov.in/',
      buttonText: 'Visit Maharashtra Police Citizen Portal'
    },
    feeAndTimeline: {
      feeText: 'Completely free under Section 154(2) of the Code of Criminal Procedure (CrPC).',
      timelineText: 'Issued on the spot or available online within 24 hours of registration.'
    },
    alternatives: [
      {
        name: 'Station Diary (SD) / Non-Cognizable (NC) Entry',
        description: 'For non-injury vehicle scratch or minor accidental damage, many insurers accept a certified police station diary entry.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      },
      {
        name: 'Spot Panchnama Report',
        description: 'Official on-site inspection report signed by the investigating police sub-inspector.',
        acceptedWhere: 'May be accepted depending on the institution or service.'
      }
    ],
    lastVerified: '2026-09-30',
    disclaimer: 'Rules, fees, and processing times can change. Please verify on the official portal.'
  }
};
