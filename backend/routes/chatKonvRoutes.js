const express = require('express')
const router = express.Router()
const chatKonvController = require('../controllers/chatKonvController')
const verifyJWT = require('../middleware/verifyJWT')

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT)

router.route('/')
    .get(chatKonvController.getChatKonv)
    // .post(chatKonvController.createNewUser)
    // .patch(chatKonvController.updateprompt)
    .delete(chatKonvController.deleteChatKonv)



module.exports = router
