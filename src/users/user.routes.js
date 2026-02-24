import { Router } from 'express';
import { 
  updateUserRole, 
  getUserRoles, 
  getUsersByRole, 
  updateOwnProfile,
  getUserByUsername 
} from './user.controller.js';

const router = Router();

router.put('/update-profile', ...updateOwnProfile);

router.get('/username/:username', ...getUserByUsername);

router.put('/:userId/role', ...updateUserRole);
router.get('/:userId/roles', ...getUserRoles);
router.get('/by-role/:roleName', ...getUsersByRole);

export default router;