const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

router.route("/").post(loginLimiter, authController.login);

// router.route("/home").post(loginLimiter, authController.home);
router
  .route("/reset_password/:id/:token")
  .post(authController.reset_password_post);

router.route("/reset_password/:id/:token").get(authController.reset_password);

router.route("/register").post(authController.register);

router.route("/forgot_password").post(authController.forgot_password);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;
