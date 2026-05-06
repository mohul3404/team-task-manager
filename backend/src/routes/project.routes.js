const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectActivity,
} = require('../controllers/project.controller');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);

router.get('/:projectId', requireProjectMember, getProject);
router.put('/:projectId', requireProjectAdmin, updateProject);
router.delete('/:projectId', requireProjectAdmin, deleteProject);

router.post('/:projectId/members', requireProjectAdmin, addMember);
router.delete('/:projectId/members/:userId', requireProjectAdmin, removeMember);

router.get('/:projectId/activity', requireProjectMember, getProjectActivity);

module.exports = router;
