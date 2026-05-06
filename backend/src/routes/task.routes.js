const router = require('express').Router();
const {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} = require('../controllers/task.controller');
const { authenticate, requireProjectMember } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/project/:projectId', requireProjectMember, getProjectTasks);
router.post('/project/:projectId', requireProjectMember, createTask);

router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

router.post('/:taskId/comments', addComment);
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
