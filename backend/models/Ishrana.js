const mongoose = require('mongoose');

const IshranaSchema = new mongoose.Schema(
  {
    naziv: {
      type: String,
      required: true
    },
    komentar: {
      type: String,
      required: true
    },
    namirnice: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Namirnica'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ishrana', IshranaSchema);


// const IshranaSchema = new mongoose.Schema({
//   idKorisnka: {
//     type: String,
//     required: false
//   },
//   naziv: {
//     type: String,
//     required: false
//   },
//   //Za ishranu
//   komentar: {
//     type: String,
//     required: false
//   },
//   trenTez: {
//     type: String,
//     required: false
//   },
//   primCilj: {
//     type: String,
//     required: false
//   },
//   specCilj: {
//     type: String,
//     required: false
//   },
//   zdravDijag: {
//     type: String,
//     required: false
//   },
//   ucestObr: {
//     type: String,
//     required: false
//   },
//   navUIsh: {
//     type: String,
//     required: false
//   },
//   //Namirnice po grupama 
//   voce: {
//     citrus: [String],
//     bobicasto: [String],
//     kostunjicavo: [String],
//     tropsko: [String],
//     jabIkrus: [String],
//     lubenica: [String]
//   },
//   povrce: {
//     lisnato: [String],
//     korenito: [String],
//     tikve: [String],
//     lukvicasto: [String],
//     paprikeIparadajz: [String],
//     mahunarke: [String]
//   },
//   orasastiPlodIsSem: {
//     orsasatiPlod: [String],
//     semenke: [String]
//   },
//   zitarice: {
//     celovite: [String],
//     proizOdCelZit: [String],
//     rafinisane: [String]
//   },
//   mlecniProiz: {
//     mleko: [String],
//     jogurt: [String],
//     sir: [String],
//     kisMleko: [String],
//     pavlakaImaslac: [String]
//   },
//   mesoRibaJaja: {
//     crvMes: [String],
//     belMes: [String],
//     ribImorsPlod: [String],
//     preradj: [String],
//     jaja: [String]
//   },
//   uljeMastiSeceri: {
//     biljUlj: [String],
//     maslImar: [String],
//     secIzas: [String]
//   },
//   pica: {
//     sokovi: [String],
//     kadIcaj: [String],
//     aklohol: [String],
//     bezalk: [String]
//   }
// });


