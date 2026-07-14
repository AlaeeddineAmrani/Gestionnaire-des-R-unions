const router = require('express').Router();
const { getAllReunions, getReunionById, 
    createReunion, updateReunion, deleteReunion,
    getMyReunions, downloadPV, searchPoints, getReunionByPointId, getReunionDetails, getNextReunion } = require('../controllers/ReunionController');
const upload = require('../middlewares/upload'); // middleware Multer

// ⚠️ Les routes spécifiques doivent être AVANT les routes avec paramètre /:id
router.get('/my', getMyReunions);
router.get('/search/points', searchPoints);              // GET /api/reunions/search/points?q=...
router.get('/point/:pointId/reunion', getReunionByPointId); // GET /api/reunions/point/:pointId/reunion
router.get('/next', getNextReunion);                     // GET /api/reunions/next
router.get('/', getAllReunions);
router.get('/:id/details', getReunionDetails);           // GET /api/reunions/:id/details
router.get('/:id', getReunionById);
router.get('/:id/pv', downloadPV);
router.post('/', createReunion);
// On dit à Multer d'intercepter le champ nommé 'pv_rapport'
router.put('/:id', upload.single('pv_rapport'), updateReunion);
router.delete('/:id', deleteReunion);

module.exports = router;

