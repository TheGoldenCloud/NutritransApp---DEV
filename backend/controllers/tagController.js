const Tag = require("../models/Tags");

const getAllTags = async (req, res) => {
  const tags = await Tag.find();

  if (!tags?.length) {
    return res.status(400).json({ message: "Nisu nadjeni Tagovi" });
  }

  res.json(tags);
};

const createNewTag = async (req, res) => {
  const { naziv } = req.body;
  //   console.log("Tag",tip,naziv);
  if (!naziv) {
    return res.status(400).json({ message: "Sva poslja su potrebna" });
  }
  const duplicate = await Tag.findOne({ naziv })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(400).json({ message: "Tag već postoji" });
  }
  const cilj = await Tag.create({ naziv });
  if (cilj) {
    res.status(201).json({ message: `Tag ${naziv} napravljen` });
  } else {
    res.status(400).json({ message: "Nisu validni podaci" });
  }
};

const deleteTag = async (req, res) => {
  const { id } = req.body;
  // console.log(id);
  if (!id) {
    return res.status(400).json({ message: "Tag ID potreban" });
  }
  const cilj = await Tag.findById(id).exec();
  if (!cilj) {
    return res.status(400).json({ message: "Tag nije nadjen" });
  }
  const result = await cilj.deleteOne();
  const reply = `Cilj ${result.naziv} izbrisan`;
  res.json(reply);
};

module.exports = {
  getAllTags,
  createNewTag,
  deleteTag,
};
