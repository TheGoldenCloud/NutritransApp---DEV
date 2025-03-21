const express = require('express')
const router = express.Router()
const namirniceController = require('../controllers/namirniceController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT)

router.route('/')
    .get(namirniceController.getAllNamirnices)
    .post(namirniceController.createNewNamirnice)
    .patch(namirniceController.updateNamirnice)
    .delete(namirniceController.deleteNamirnice)

// router.route('/Ishrane')
//     .get(namirniceController.getAllNamirniceIshrane)    //Za prikaz u tablebi namirnice za ishranu

// router.route('/:id')      //Get one user
//     .get(namirniceController.getOneUser)



module.exports = router
