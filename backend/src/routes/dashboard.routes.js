const router = require('express').Router();
const { getDashboard, getProjectStats } = require('../controllers/dashboard.controller');
const { authenticate, requireProjectMember } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getDashboard);
router.get('/project/:projectId/stats', requireProjectMember, getProjectStats);

module.exports = router;
