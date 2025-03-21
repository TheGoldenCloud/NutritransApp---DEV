const express = require('express')
const router = express.Router()
const pozicije = require('../controllers/pozicijeController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(pozicije.getAllPozicije)
    .post(pozicije.createNewPozicije)
    .patch(pozicije.updatePozicije)
    .delete(pozicije.deletePozicije)

router.route('/names')
    .get(pozicije.getAllPozicijeNames)

module.exports = router