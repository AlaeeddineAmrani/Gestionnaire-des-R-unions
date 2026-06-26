const router = require('express').Router();
const { getAllReunions, getReunionById, 
    createReunion, updateReunion, deleteReunion } = require('../controllers/ReunionController');
const upload = require('../middlewares/upload'); // middleware Multer

router.get('/', getAllReunions);
router.get('/:id', getReunionById);
router.post('/', createReunion);
// On dit à Multer d'intercepter le champ nommé 'pv_rapport'
router.put('/:id', upload.single('pv_rapport'), updateReunion);
router.put('/:id', updateReunion);
router.delete('/:id', deleteReunion);

module.exports = router;