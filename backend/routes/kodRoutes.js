const express = require("express");
const router = express.Router();
const kodController = require("../controllers/kodController");
const verifyJWT = require("../middleware/verifyJWT");

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT);

router
  .route("/")
  .get(kodController.getAllKods)
  .post(kodController.createKod)
  .patch(kodController.proveriKod) //Proveri kod
  .delete(kodController.deleteKod); //Brisanje koda

//Provera koda sa klijentske strane
// router.route("/provera").get(kodController.proveriKod); //Je ustevari provera koda

router
  .route("/:id") //Get one kod
  .get(kodController.getOneKod);

module.exports = router;
