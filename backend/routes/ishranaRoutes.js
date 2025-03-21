const express = require('express')
const router = express.Router()
const ishrane = require('../controllers/ishranaController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT)

router.route('/')
    .get(ishrane.getAllIshrane)
    .post(ishrane.createNewIshrana)
    .patch(ishrane.updateIshrana)
    .delete(ishrane.deleteIshrana)


router.route('/names')
    .get(ishrane.getAllIshraneNames)

router.route('/names_')
    .get(ishrane.getAllIshraneNames_)


module.exports = router