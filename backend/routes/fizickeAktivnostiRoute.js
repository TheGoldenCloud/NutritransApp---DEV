const express = require('express')
const router = express.Router()
const fizickiparametriController = require('../controllers/fizickiparametriController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(fizickiparametriController.getAllFizickeAktivnosti)
    .post(fizickiparametriController.createFizickuAktivnost)
    .patch(fizickiparametriController.updateFizickuAktivnost)
    .delete(fizickiparametriController.deleteFizickuAktivnost)

router.route('/dijagnoza')
    .get(fizickiparametriController.getAllDijagnoze)
    .post(fizickiparametriController.createDijagnozu)
    .patch(fizickiparametriController.updateDijagnoza)
    .delete(fizickiparametriController.deleteDijagnozu)

module.exports = router