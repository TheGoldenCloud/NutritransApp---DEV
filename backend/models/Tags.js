const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    naziv: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", TagSchema);
