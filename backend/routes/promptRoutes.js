const express = require('express')
const router = express.Router()
const promptController = require('../controllers/promptController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(promptController.getprompt)
    // .post(usersController.createNewUser)
    .patch(promptController.updateprompt)
    // .delete(usersController.deleteUser)



module.exports = router
