const express = require('express')
const router = express.Router()
const ciljeviController = require('../controllers/ciljeviController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT)

//Za primarne
router.route('/')
    .get(ciljeviController.getAllCiljevi)
    .post(ciljeviController.createNewCilj)
    .patch(ciljeviController.updateCilj)
    .delete(ciljeviController.deleteCilj)

//Za specificne
router.route('/specificni')
    .get(ciljeviController.getAllSpecCiljevi)
    .post(ciljeviController.createNewSpecCilj)
    .patch(ciljeviController.updateSpecCilj)
    .delete(ciljeviController.deleteSpecCilj)

//Za motivaciju
router.route('/motivacije')
    .get(ciljeviController.getAllMotiv)
    .post(ciljeviController.createNewMotiv)
    .patch(ciljeviController.updateMotiv)
    .delete(ciljeviController.deleteMotiv)

router.route('/names')
    .get(ciljeviController.getAllSpcCiljeviNames)

module.exports = router