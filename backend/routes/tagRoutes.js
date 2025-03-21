const express = require("express");
const router = express.Router();
const tag = require("../controllers/tagController");
const verifyJWT = require("../middleware/verifyJWT");

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT)

router
  .route("/")
  .get(tag.getAllTags)
  .post(tag.createNewTag)
  .delete(tag.deleteTag);

module.exports = router;
