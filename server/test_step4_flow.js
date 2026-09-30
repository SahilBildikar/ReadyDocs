/**
 * ReadyDocs Step 4 Automated Verification Suite
 * Tests all required API flows:
 * 1. Generate checklist
 * 2. Save checklist
 * 3. Get checklist history
 * 4. Upload PDF/JPG/PNG
 * 5. Reject invalid file type
 * 6. Reject file larger than 10 MB
 * 7. Classify document (Zero-Knowledge safe metadata)
 * 8. Match document to checklist
 * 9. Delete document & revert checklist item
 * 10. Multi-user security isolation (User B cannot access User A's records)
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('READYDOCS STEP 4 - AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Setup: Create 2 Test Users (User A and User B)
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const userAEmail = `test_user_a_${timestamp}@readydocs.com`;
    const userBEmail = `test_user_b_${timestamp}@readydocs.com`;
    const testPassword = 'Password123!';

    // Register User A
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password: testPassword })
    });
    const regAData = await regARes.json();
    const tokenA = regAData.token;
    assert(regARes.status === 201 && tokenA, 'Setup: User A registered and received JWT');

    // Register User B
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: testPassword })
    });
    const regBData = await regBRes.json();
    const tokenB = regBData.token;
    assert(regBRes.status === 201 && tokenB, 'Setup: User B registered and received JWT');

    // Create Profile for User A
    const profARes = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        profile_name: 'Self Profile',
        full_name: 'User A Sharma',
        city: 'Pune',
        state: 'Maharashtra',
        language: 'english'
      })
    });
    const profAData = await profARes.json();
    const profileA = profAData.profile;
    assert(profARes.status === 201 && profileA.id, 'Setup: User A profile created');

    // Create Profile for User B
    const profBRes = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        profile_name: 'User B Profile',
        full_name: 'User B Patil',
        city: 'Mumbai',
        state: 'Maharashtra',
        language: 'english'
      })
    });
    const profBData = await profBRes.json();
    const profileB = profBData.profile;
    assert(profBRes.status === 201 && profileB.id, 'Setup: User B profile created');

    // -------------------------------------------------------------
    // Test 1: Generate Checklist (SBI Savings Account)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Generate Checklist (SBI) ---');
    const genRes = await fetch(`${BASE_URL}/checklists/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        serviceType: 'sbi_savings',
        profileId: profileA.id,
        answers: {
          applicant_type: 'major',
          address_matches_id: false, // will require utility bill
          has_pan: true
        }
      })
    });
    const genData = await genRes.json();
    assert(genRes.status === 200, 'POST /api/checklists/generate returns status 200');
    assert(Array.isArray(genData.items) && genData.items.length >= 4, 'Checklist generated with trusted items (>= 4)');
    const hasAddressBill = genData.items.some(i => i.id === 'req_address_proof' && i.acceptedTypes.includes('address_proof'));
    assert(hasAddressBill, 'Checklist reflects questionnaire answer requiring Deemed Address Proof utility bill');

    // -------------------------------------------------------------
    // Test 2: Save Checklist to Supabase Store
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Save Checklist ---');
    const saveRes = await fetch(`${BASE_URL}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        serviceType: 'sbi_savings',
        profileId: profileA.id,
        institutionName: 'State Bank of India',
        sourceUrl: 'https://sbi.co.in/web/personal-banking/accounts/saving-account',
        answers: {
          applicant_type: 'major',
          address_matches_id: false,
          has_pan: true
        },
        items: genData.items
      })
    });
    const saveData = await saveRes.json();
    assert(saveRes.status === 201, 'POST /api/checklists returns status 201 Created');
    const checklistA = saveData.checklist;
    assert(checklistA && checklistA.id, 'Saved checklist returned valid UUID ID');
    assert(checklistA.status === 'incomplete', 'Initial checklist status is correctly marked "incomplete"');

    // -------------------------------------------------------------
    // Test 3: Get Checklist History with Filter
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Get Checklist History ---');
    const historyRes = await fetch(`${BASE_URL}/checklists?service_type=sbi_savings`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const historyData = await historyRes.json();
    assert(historyRes.status === 200, 'GET /api/checklists returns status 200');
    assert(historyData.checklists.some(c => c.id === checklistA.id), 'Checklist history includes newly created checklist');

    // -------------------------------------------------------------
    // Test 4, 7, 8: Upload Safe PDF, JPG, PNG & Classify & Match
    // -------------------------------------------------------------
    console.log('\n--- Test 4, 7, 8: Upload Documents & Verify Gemini Classification & Matching ---');

    // 4A: Upload Passport (PDF)
    const pdfBlob = new Blob(['%PDF-1.4 Mock Passport Government of India'], { type: 'application/pdf' });
    const formPDF = new FormData();
    formPDF.append('file', pdfBlob, 'sample_passport_ovd.pdf');
    formPDF.append('checklistId', checklistA.id);
    formPDF.append('targetItemId', 'req_id_proof');

    const uploadPDFRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formPDF
    });
    const uploadPDFData = await uploadPDFRes.json();
    assert(uploadPDFRes.status === 201, 'Upload PDF returns status 201 Created');
    assert(uploadPDFData.classification.zeroKnowledgePrivacyVerified === true, 'Gemini classification verified zero-knowledge privacy');
    assert(uploadPDFData.document.matched_checklist_item === 'req_id_proof', 'Passport PDF correctly matched to req_id_proof');
    assert(uploadPDFData.document.status === 'matched', 'Document status is "matched"');
    const passportDocId = uploadPDFData.document.id;

    // 4B: Upload Utility Bill (JPG)
    const jpgBlob = new Blob(['Mock Electricity Utility Bill Image Data'], { type: 'image/jpeg' });
    const formJPG = new FormData();
    formJPG.append('file', jpgBlob, 'sample_electricity_bill.jpg');
    formJPG.append('checklistId', checklistA.id);
    formJPG.append('targetItemId', 'req_address_proof');

    const uploadJPGRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formJPG
    });
    const uploadJPGData = await uploadJPGRes.json();
    assert(uploadJPGRes.status === 201, 'Upload JPG returns status 201 Created');
    assert(uploadJPGData.document.matched_checklist_item === 'req_address_proof', 'Utility Bill JPG matched to req_address_proof');

    // 4C: Upload Passport Photo (PNG)
    const pngBlob = new Blob(['Mock Portrait Photo PNG Data'], { type: 'image/png' });
    const formPNG = new FormData();
    formPNG.append('file', pngBlob, 'sample_portrait_photo.png');
    formPNG.append('checklistId', checklistA.id);
    formPNG.append('targetItemId', 'req_photo');

    const uploadPNGRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formPNG
    });
    const uploadPNGData = await uploadPNGRes.json();
    assert(uploadPNGRes.status === 201, 'Upload PNG returns status 201 Created');
    assert(uploadPNGData.document.matched_checklist_item === 'req_photo', 'Portrait Photo PNG matched to req_photo');

    // -------------------------------------------------------------
    // Test 5: Reject Invalid File Type (e.g. .txt or .exe)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Reject Invalid File Type ---');
    const txtBlob = new Blob(['Hello text file'], { type: 'text/plain' });
    const formInvalid = new FormData();
    formInvalid.append('file', txtBlob, 'invalid_document.txt');
    formInvalid.append('checklistId', checklistA.id);

    const invalidRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formInvalid
    });
    const invalidData = await invalidRes.json();
    assert(invalidRes.status === 400, 'Invalid file type rejected with status 400');
    assert(invalidData.error === 'Invalid File Type' || invalidData.message.includes('PDF, JPG'), 'Error message clearly specifies allowed types (PDF, JPG, PNG)');

    // -------------------------------------------------------------
    // Test 6: Reject File Larger Than 10 MB
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Reject File Larger Than 10 MB ---');
    // Allocate 10.5 MB buffer
    const largeBuffer = new Uint8Array(10.5 * 1024 * 1024);
    const largeBlob = new Blob([largeBuffer], { type: 'application/pdf' });
    const formLarge = new FormData();
    formLarge.append('file', largeBlob, 'oversized_document.pdf');
    formLarge.append('checklistId', checklistA.id);

    const largeRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: formLarge
    });
    const largeData = await largeRes.json();
    assert(largeRes.status === 400, 'Oversized file rejected with status 400');
    assert(largeData.message.includes('10 MB'), 'Error message clearly specifies 10 MB maximum limit');

    // -------------------------------------------------------------
    // Test 9: Delete Document & Verify Checklist Item Reverts
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Delete Document & Revert Checklist Item ---');
    const deleteDocRes = await fetch(`${BASE_URL}/documents/${passportDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(deleteDocRes.status === 200, 'DELETE /api/documents/:id returns status 200');

    // Fetch checklist to verify req_id_proof reverted to missing
    const getChecklistRes = await fetch(`${BASE_URL}/checklists/${checklistA.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const getChecklistData = await getChecklistRes.json();
    const idProofItem = getChecklistData.checklist.result_json.items.find(i => i.id === 'req_id_proof');
    assert(idProofItem.status === 'missing', 'Checklist item req_id_proof reverted back to "missing" after document removal');

    // -------------------------------------------------------------
    // Test 10: Multi-User Security Isolation
    // -------------------------------------------------------------
    console.log('\n--- Test 10: Multi-User Security Isolation ---');
    // User B attempts to access User A's checklist
    const crossAccessRes = await fetch(`${BASE_URL}/checklists/${checklistA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(crossAccessRes.status === 404, 'User B accessing User A checklist blocked with 404 Not Found');

    // User B attempts to upload a document to User A's checklist
    const formCrossUpload = new FormData();
    formCrossUpload.append('file', pdfBlob, 'user_b_spy.pdf');
    formCrossUpload.append('checklistId', checklistA.id);

    const crossUploadRes = await fetch(`${BASE_URL}/documents/upload-and-classify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: formCrossUpload
    });
    assert(crossUploadRes.status === 404, 'User B uploading to User A checklist blocked with 404 Not Found');

    // User B listing checklists should NOT see User A's checklist
    const userBHistoryRes = await fetch(`${BASE_URL}/checklists`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const userBHistoryData = await userBHistoryRes.json();
    const leaked = userBHistoryData.checklists.some(c => c.id === checklistA.id);
    assert(!leaked, 'User B checklist listing strictly isolated from User A records');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Unexpected Test Execution Error:', err);
    process.exit(1);
  }
}

runTests();
