const Blog = require("../models/Blog");

const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find();

  if (!blogs?.length) {
    return res.status(400).json({ message: "Nisu nadjeni Blogovi" });
  }

  res.json(blogs);
};

const getOneBlog = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog nije pronađen" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru" });
  }
};

const createNewBlog = async (req, res) => {
  const { title, body, author, date, slika, tags, tip } = req.body;
  //   console.log(" => ", req.body);

  try {
    if (!title || !body || !author) {
      return res
        .status(400)
        .json({ error: "Title, body, and author are required." });
    }

    const newBlog = new Blog({
      title,
      body,
      author,
      date,
      slika: slika.myFile,
      tags,
      tip,
    });

    await newBlog.save();

    return res.status(201).json({ message: "Blog naprravljen", blog: newBlog });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the blog" });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.body;
  // console.log(id);
  if (!id) {
    return res.status(400).json({ message: "Blog ID potreban" });
  }
  const cilj = await Blog.findById(id).exec();
  if (!cilj) {
    return res.status(400).json({ message: "Blog nije nadjen" });
  }
  const result = await cilj.deleteOne();
  const reply = `Blog ${result.naziv} izbrisan`;
  res.json(reply);
};

const modifyBlog = async (req, res) => {
  const { id, title, body, author, tags, slika, tip } = req.body;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.title = title;
    blog.body = body;
    blog.author = author;
    blog.tags = tags;
    blog.slika = slika;
    blog.tip = tip;

    const updatedBlog = await blog.save();

    res.status(200).json({ message: "Uspesno updejtovan blog!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating the blog" });
  }
};

module.exports = {
  getAllBlogs,
  // getNewBlog,  //U server skripti je...
  getOneBlog,
  createNewBlog,
  deleteBlog,
  modifyBlog
};
