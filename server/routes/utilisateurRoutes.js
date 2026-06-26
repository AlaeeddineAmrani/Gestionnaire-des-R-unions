const router = require('express').Router();
const { getAllUtilisateurs, getUtilisateurById, 
    createUtilisateur, updateUtilisateur, deleteUtilisateur } = require('../controllers/UtilisateurController');


router.get('/', getAllUtilisateurs);
router.get('/:id', getUtilisateurById);
router.post('/', createUtilisateur);
router.put('/:id', updateUtilisateur);
router.delete('/:id', deleteUtilisateur);

module.exports = router;

