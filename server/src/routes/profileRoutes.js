import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All profile endpoints strictly require valid JWT Bearer authentication
router.use(requireAuth);

router.get('/', ProfileController.getAllProfiles);
router.get('/:id', ProfileController.getProfileById);
router.post('/', ProfileController.createProfile);
router.put('/:id', ProfileController.updateProfile);
router.patch('/:id/archive', ProfileController.toggleArchive);
router.patch('/:id/active', ProfileController.setActive);
router.delete('/:id', ProfileController.deleteProfile);

export default router;
