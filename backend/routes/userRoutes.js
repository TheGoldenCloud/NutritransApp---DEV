const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
router.use(verifyJWT);

router
  .route("/")
  .get(usersController.getAllUsersWithUsedCodes) //getAllUsers
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/names").get(usersController.getAllUserNames);

router
  .route("/:id") //Get one user
  .get(usersController.getOneUser);

module.exports = router;
