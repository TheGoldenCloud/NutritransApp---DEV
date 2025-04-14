const mongoose = require("mongoose");

const KodSchema = new mongoose.Schema(
  {
    idUser: [
      {
        type: String,
        required: false,
      },
    ],
    idUserTreba: [
      {
        type: String,
        required: false,
      },
    ],
    naziv: {
      type: String,
      required: true,
    },
    opis: {
      type: String,
      required: false,
    },
    iskoriscen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kod", KodSchema);
