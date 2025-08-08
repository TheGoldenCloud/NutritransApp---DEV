const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: "",
  },
  lastName: {
    type: String,
    required: false,
    default: "",
  },
  primcilj: {
    type: String,
    required: false,
    default: "Mršavljenje",
  },
  motiv: {
    type: String,
    required: false,
    default: "",
  },
  ukupnaKalVred: {
    type: String,
    required: false,
  },
  mail: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  datumRodjenja: {
    type: String,
    required: false,
    default: "",
  },
  pol: {
    type: String,
    required: false,
    default: "",
  },
  telefon: {
    type: String,
    required: false,
    default: "",
  },
  visina: {
    type: String,
    required: false,
    default: "",
  },
  tezina: {
    type: String,
    required: false,
    default: "",
  },
  struk: {
    type: String,
    required: false,
    default: "",
  },
  imunitet: {
    type: String,
    required: false,
    default: "",
  },
  kuk: {
    type: String,
    required: false,
    default: "",
  },
  vrat: {
    type: String,
    required: false,
    default: "",
  },
  krvGru: {
    type: String,
    required: false,
    default: "",
  },
  uputstvo: {
    type: Boolean,
    required: false,
  },
  wellcome: {
    type: String,
    default: "0",
    required: false,
  },
  wellcomePanel: {
    type: Boolean,
    default: true,
  },
  datumRegistracije: {
    type: String,
    required: false,
    default: "",
  },
  currentToken: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    required: false,
  },
  actlvl: {
    type: String,
    required: false,
    default: "1.2",
  },
  tdee: {
    type: String,
    required: false,
    default: "",
  },
  komCilja: {
    type: String,
    required: false,
    default: "",
  },
  alergije: {
    type: String,
    required: false,
    default: "",
  },
  roles: {
    type: [String],
    default: ["Klijent"],
  },
  specilj: {
    type: [String],
    required: false,
  },
  selectedDefTip: {
    //Tip specificnog cilja
    type: String,
    required: false,
    default: "",
  },
  godine: {
    type: String,
    required: false,
    default: "",
  },
  dijagnoza: {
    type: String,
    required: false,
    default: "",
  },
  ucestBr: {
    type: String,
    required: false,
    default: "doručak, ručak, večera",
  },
  navikeUish: {
    type: String,
    required: false,
    default: "",
  },
  namirnice: {
    type: [String],
    required: false,
  },
  namirniceDa: {
    type: [String],
    required: false,
  },
  selectedIshranaNaziv: {
    type: String,
    required: false,
    default: "Tvoja ishrana",
  },
  selectedIshrana: {
    type: String,
    required: false,
    default: "671784a5782070c626c837d8",
  },
  voljeneNamirnice: {
    type: String,
    required: false,
    default: "",
  },
  neVoljeneNamirnice: {
    type: String,
    required: false,
    default: "",
  },
  allergiesEnabled: {
    //Da li ima alergije na gluten/laktoza
    type: String,
    required: false,
    default: "ne",
  },
  allergyChoice: {
    //Da li je alergican na neku namirnicu
    type: String,
    required: false,
    default: "no",
  },
  bmi: {
    type: Number,
    required: false,
    default: "",
  },
  motiv: {
    type: String,
    required: false,
    default: "",
  },
  nivoAkt: {
    type: String,
    required: false,
    default: "1.2",
  },
  vrstaFiz: {
    type: [String],
    required: false,
  },
  struk: {
    type: String,
    required: false,
    default: "",
  },
  kuk: {
    type: String,
    required: false,
    default: "",
  },
  vrat: {
    type: String,
    required: false,
    default: "",
  },
  krv: {
    type: String,
    required: false,
    default: "",
  },
  alerg: {
    type: String,
    required: false,
    default: "",
  },
  alergNamir: {
    //Alergican na neku namirnicu
    type: String,
    required: false,
    default: "",
  },
  pus: {
    type: String,
    required: false,
    default: "ne",
  },
  kolicinaCigara: {
    type: String,
    required: false,
    default: "",
  },
  alk: {
    type: String,
    required: false,
    default: "ne",
  },
  kolicina: {
    type: String,
    required: false,
    default: "",
  },
  vrstaAlkohola: {
    type: String,
    required: false,
    default: "",
  },
  bmrValue: {
    type: String,
    required: false,
    default: "",
  },
  ime: {
    type: String,
    required: false,
    default: "",
  },
  prezime: {
    type: String,
    required: false,
    default: "",
  },
  iskSaDijetama: {
    type: String,
    required: false,
    default: "",
  },
  intolerancija: {
    type: [String],
    required: false,
  },
  myFile: {
    //Slika profila
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  isVerifiedGoogle: {
    type: Boolean,
    required: false,
  },
  komentar: {
    //Komentar da veljko postavlja... imageUrl
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
