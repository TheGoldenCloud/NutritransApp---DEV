const express = require('express')
const router = express.Router()
const organizacije = require('../controllers/organizacijeController.js')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(organizacije.getAllOrganizacije)
    .post(organizacije.createNewOrganizacije)
    .patch(organizacije.updateOrganizacije)
    .delete(organizacije.deleteOrganizacije)

router.route('/names')
    .get(organizacije.getAllOrganizacijeNames)

router.route('/pozicija')
    .post(organizacije.createNewPozicijaOrganizaciji)
    .patch(organizacije.updatePozicijaOrganizaciji)
    .delete(organizacije.deletePozicijaUOrganizaciji)

router.route('/pozicija/:id')
    .get(organizacije.getAllOrganizacijeSaPozicijama)

router.route('/pozicija/zaposleni')
    .patch(organizacije.updatePozicijaZaposlenogUOrganizaciji)
    .delete(organizacije.deletePozicijaZaposlenogUOrganizaciji)

module.exports = router