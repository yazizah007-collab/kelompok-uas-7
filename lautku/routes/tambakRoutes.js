const express = require('express');
const router = express.Router();
const tambakController = require('../controllers/tambakController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('nelayan'), tambakController.getAll);
router.get('/:id', auth, role('nelayan', 'admin'), tambakController.getById);
router.post('/', auth, role('nelayan'), tambakController.create);
router.put('/:id', auth, role('nelayan'), tambakController.update);
router.delete('/:id', auth, role('nelayan'), tambakController.delete);

router.get('/:id/panen', auth, role('nelayan'), tambakController.getPanen);
router.post('/:id/panen', auth, role('nelayan'), tambakController.createPanen);
router.put('/panen/:id', auth, role('nelayan'), tambakController.updatePanen);

router.get('/:id/pengeluaran', auth, role('nelayan'), tambakController.getPengeluaran);
router.post('/:id/pengeluaran', auth, role('nelayan'), tambakController.createPengeluaran);
router.put('/pengeluaran/:id', auth, role('nelayan'), tambakController.updatePengeluaran);
router.delete('/pengeluaran/:id', auth, role('nelayan'), tambakController.deletePengeluaran);

router.get('/:id/laporan', auth, role('nelayan'), tambakController.getLaporan);

module.exports = router;