const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/:tambak_id', auth, role('nelayan'), monitoringController.getByTambak);
router.post('/', auth, role('nelayan'), monitoringController.create);
router.delete('/:id', auth, role('nelayan'), monitoringController.delete);

module.exports = router;