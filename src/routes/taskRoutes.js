const express = require('express');
const controller = require('../controllers/taskController');

const router = express.Router();

router.get('/', controller.listTasks);
router.get('/:id', controller.getTask);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
