const express = require('express');
const router = express.Router();

const panenController = require('../controllers/panenController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/tambak/:tambak_id', auth, role('nelayan'), panenController.getByTambak);
router.get('/:id', auth, role('nelayan'), panenController.getById);
router.post('/', auth, role('nelayan'), panenController.create);
router.put('/:id', auth, role('nelayan'), panenController.update);
router.delete('/:id', auth, role('nelayan'), panenController.remove);

module.exports = router;