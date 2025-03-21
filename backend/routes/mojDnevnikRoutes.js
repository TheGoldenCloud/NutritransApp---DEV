const express = require('express')
const router = express.Router()
const mojDnevnikController = require("../controllers/mojDnevnikController")
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(mojDnevnikController.getAllMojDnevnik)     //Generalno za sve dnevnike svih usera
    .post(mojDnevnikController.createMojDnevnik)    //Kreira jedan dnevnik
    // .patch(mojDnevnikController.updateMojDnevnik)
    .delete(mojDnevnikController.deleteMojDnevnik)

router.route('/:id')
    .get(mojDnevnikController.getAllMojDnevnikKorisnik) //Da uzme sve dnevnike tog korisnika
    // .post(mojDnevnikController.createMojDnevnik)
    // .patch(mojDnevnikController.updateMojDnevnik)
    // .delete(mojDnevnikController.deleteMojDnevnik)

module.exports = router