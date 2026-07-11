const router = require('express').Router();
const {
    getAllDivisions,
    getDivisionById,
    createDivision,
    updateDivision,
    deleteDivision
} = require('../controllers/DivisionController');

router.get('/', getAllDivisions);
router.get('/:id', getDivisionById);
router.post('/', createDivision);
router.put('/:id', updateDivision);
router.delete('/:id', deleteDivision);

module.exports = router;
