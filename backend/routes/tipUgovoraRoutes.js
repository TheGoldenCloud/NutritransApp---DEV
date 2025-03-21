const express = require('express')
const router = express.Router()
const tipUgovora = require('../controllers/tipUgovoraController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(tipUgovora.getAllTipUgovora)
    .post(tipUgovora.createNewTipUgovora)
    .patch(tipUgovora.updateTipUgovora)
    .delete(tipUgovora.deleteTipUgovora)

router.route('/names')
    .get(tipUgovora.getAllTipUgovoraNames)

module.exports = router