const express = require('express')
const router = express.Router()
const obracuniController = require('../controllers/obracuniController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

// router.route('/')
//     .post(obracuniController.uploadNetoPlate)   //Bez importa

// router.route('/pojedinacni')
//     .post(obracuniController.uploadPojedinacniObracun)

// router.route('/:key')
//     .get(obracuniController.getObracun)

// router.route('/import')
//     .post(obracuniController.uploadNetoPlateImport)

router.route('/pojedinacni')
    .post(obracuniController.uploadPojedinacniObracun) //ISPISI STA RADI DA SE NE BI ZBUNIO
    .patch(obracuniController.updatePojedinacniObracun)

router.route('/import')
    .post(obracuniController.uploadNetoPlateImport); //ISPISI STA RADI DA SE NE BI ZBUNIO

router.route('/preview/:id')
    .get(obracuniController.getObracunZaPreview)   //Fetchovanje za preview i za edit

router.route('/')
    .get(obracuniController.getAllObracuni) //UZima sve obracune
    .post(obracuniController.uploadNetoPlate)  //ISPISI STA RADI DA SE NE BI ZBUNIO
    .delete(obracuniController.deleteObracun)   //Brise jedan obracun


router.route('/:key')
    .get(obracuniController.getObracun); //ISPISI STA RADI DA SE NE BI ZBUNIO

module.exports = router