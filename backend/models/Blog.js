const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    body: {
      type: String,
      required: false,
    },
    author: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    slika: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    tip: {
      type: String,
      required: false,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Blog", BlogSchema);
