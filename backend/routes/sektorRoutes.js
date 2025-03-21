const express = require('express')
const router = express.Router()
const sektor = require('../controllers/sektorController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(sektor.getSektor)
    .post(sektor.createNewSektor)
    .patch(sektor.updateSektor)
    .delete(sektor.deleteSektor)

router.route('/names')
    .get(sektor.getAllSektorNames)

module.exports = router
