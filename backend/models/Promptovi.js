const mongoose = require("mongoose");

//Prompt koji Veljko salje i modifikuje
const promptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: false,
    default: "1"
  },
  uvod: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  holisticki: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  planIsh: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  smernice: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  fizAkt: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  imun: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  san: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  voda: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  predijeta: {  //Proveri u salnju promptiova
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  alergiio: { //Nema dodaj
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  alk: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  pus: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
  zakljucak: {
    type: {
      text: { type: String, required: false, default: "" },
      brKar: { type: String, required: false, default: "" }
    },
    required: false,
  },
});

module.exports = mongoose.model("Promptovi", promptSchema);
