const router = require('express').Router();
const { getAllSalles, getSalleById, 
    createSalle, updateSalle, deleteSalle } = require('../controllers/SalleController');


router.get('/', getAllSalles);
router.get('/:id', getSalleById);
router.post('/', createSalle);
router.put('/:id', updateSalle);
router.delete('/:id', deleteSalle);

module.exports = router;