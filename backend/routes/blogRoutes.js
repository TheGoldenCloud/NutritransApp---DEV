const express = require("express");
const router = express.Router();
const blog = require("../controllers/blogController");
const verifyJWT = require("../middleware/verifyJWT");

//DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// router.use(verifyJWT);

router
  .route("/")
  .get(blog.getAllBlogs)
  .post(blog.createNewBlog)
  .delete(blog.deleteBlog)
  .patch(blog.modifyBlog);

// Route to get a single blog by ID
router.route("/:id").get(blog.getOneBlog);

// router.route("/new").post(blog.getNewBlog); //Za poslednje kreiran

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const blog = require("../controllers/blogController");
// const verifyJWT = require("../middleware/verifyJWT");

// //DISEBLUJ KAD DIREKTNO RADIS SA BAZOM
// // router.use(verifyJWT)

// router
//   .route("/")
//   .get(blog.getAllBlogs)
//   .post(blog.createNewBlog)
//   .delete(blog.deleteBlog);

// router.route("/:id").get(blog.getOneBlog);

// module.exports = router;

