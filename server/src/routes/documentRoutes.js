import express from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleSingleDocumentUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/upload-and-classify', handleSingleDocumentUpload, DocumentController.uploadAndClassify);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
