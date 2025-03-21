const express = require('express')
const router = express.Router()
const tipOrganizacije = require('../controllers/tipOrganizacijeController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(tipOrganizacije.getAllTipOrganizacije)
    .post(tipOrganizacije.createNewTipOrganizacije)
    .patch(tipOrganizacije.updateTipOrganizacije)
    .delete(tipOrganizacije.deleteTipOrganizacije)

router.route('/names')
    .get(tipOrganizacije.getAllTipOrganizacijeNames)

module.exports = router
