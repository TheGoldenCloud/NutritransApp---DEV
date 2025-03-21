// const mongoose = require('mongoose')

// const obracuniSchema = new mongoose.Schema({
//     organizacijaId: {
//         type: String,
//         required: false
//     },
//     organizacijaName: {
//         type: String,
//         required: false
//     },
//     datum: {
//         type: String,
//         required: false
//     },
//     key: {
//         type: String,
//         required: false
//     },
//     kurs: {
//         type: String,
//         required: false
//     },
//     brPrazDana: {
//         type: String,
//         required: false
//     },
//     iznosKafe: {
//         type: String,
//         required: false
//     },
//     zaposleni_: {
//         type: [
//                 {
//                     jmbg: { type: String, required: false },
//                     name: { type: String, required: false },
//                     lastName: { type: String, required: false },
//                     valuta: { type: String, required: false },
//                     zaracDnev: { type: String, required: false },
//                     kafa: { type: String, required: false },
//                     dnevnica: { type: String, required: false },
//                     netopalataIzUgovora: { type: String, required: false },
//                     fixUgovoren: { type: String, required: false },

//                     prev: { type: String, required: false },
//                     np: { type: String, required: false },
//                     prinN: { type: String, required: false },
//                     ak: { type: String, required: false },
//                     kred: { type: String, required: false },

//                     plata: {
//                         type: {
//                             vrOd: { type: String, required: false },
//                             vrDo: { type: String, required: false },
//                             brRadDa: { type: String, required: false },
//                             dnev: { type: String, required: false },
//                             fixCheckbox: { type: Boolean, required: false },
//                             realPlata: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     bol: {
//                         type: {
//                             vrOd: { type: String, required: false },
//                             vrDo: { type: String, required: false },
//                             tipIzracBolovanje: { type: String, required: false },
//                             brDana: { type: String, required: false },
//                             bol: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     kazna: {
//                         type: {
//                             tip: { type: String, required: false },
//                             nac: { type: String, required: false },
//                             izn: { type: String, required: false },
//                             procenatKazna: { type: String, required: false },
//                             kom: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     praz: {
//                         type: {
//                             brD: { type: String, required: false },
//                             izn: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     tros: {
//                         type: {
//                             ci: { type: String, required: false },
//                             kom: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     bon: {
//                         type: {
//                             ci: { type: String, required: false },
//                             kom: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     dPrekR: {
//                         type: {
//                             brD: { type: String, required: false },
//                             izn: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     rep: {
//                         type: {
//                             ci: { type: String, required: false },
//                             kom: { type: String, required: false },
//                         },
//                         required: false
//                     },

//                 }
//             ],
//         required: false
//     },
// })

// module.exports = mongoose.model('Obracuni', obracuniSchema)
