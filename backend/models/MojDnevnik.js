const mongoose = require("mongoose");

const mojDnevnikSchema = new mongoose.Schema({
  idKlijenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datum: {
    type: String,
  },
  god: {
    type: String,
  },
  tezina: {
    type: String,
  },
  visina: {
    type: String,
  },
  struk: {
    type: String,
  },
  vrat: {
    type: String,
  },
  kuk: {
    type: String,
    default: "",
  },
  bmi: {
    type: String,
    default: "",
  },
  procenatTelesneMase: {
    type: String,
    default: "",
  },
  telesnaMasa: {
    type: String,
    default: "",
  },
  cistaTelesnaMast: {
    type: String,
    default: "",
  },
  idealneTelesneMasti: {
    type: String,
    default: "",
  },
  povecanje: {
    type: String,
    default: "",
  },
  smanjenje: {
    type: String,
    default: "",
  },
  telesnaMasaBmi: {
    type: String,
    default: "",
  },
  kategorija: {
    type: String,
    default: "",
  },
  komentar: {
    type: String,
    default: "",
  },
  emojiValue: {
    type: Number,
    required: false,
  },
  emojiIcon: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("MojDnevnik", mojDnevnikSchema);
