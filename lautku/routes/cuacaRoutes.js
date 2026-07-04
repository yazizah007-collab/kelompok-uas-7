const express = require('express');
const router = express.Router();
const cuacaController = require('../controllers/cuacaController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/:tambak_id', auth, role('nelayan', 'admin'), cuacaController.getByTambak);

module.exports = router;