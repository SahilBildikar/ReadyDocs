import express from 'express';
import { ChecklistController } from '../controllers/checklistController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public discovery of supported services and authoritative help guides
router.get('/services', ChecklistController.getServices);
router.get('/guides/:guideId', ChecklistController.getHelpGuide);

// All user checklist operations require JWT authentication
router.use(requireAuth);

router.post('/generate', ChecklistController.generateChecklist);
router.post('/', ChecklistController.saveChecklist);
router.get('/', ChecklistController.listChecklists);
router.get('/:id', ChecklistController.getChecklistById);
router.delete('/:id', ChecklistController.deleteChecklist);

// Secure item status update (from Missing Document Help actions)
router.patch('/:checklistId/items/:itemId/status', ChecklistController.updateItemStatus);

export default router;
