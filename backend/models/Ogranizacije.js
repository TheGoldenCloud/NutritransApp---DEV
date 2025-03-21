// const mongoose = require('mongoose')

// const organizacijeSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: false
//     },
//     pib: {
//         type: String,
//         required: false
//     },
//     mb: {
//         type: String,
//         required: false
//     },
//     racun: {
//         type: String,
//         required: false
//     },
//     tip: {
//         type: {
//             tipId: { type: String, required: false },
//             tipName: { type: String, required: false }
//         },
//         required: false
//     },
//     roditeljOrganizacija: {
//         type: {
//             orgId: { type: String, required: false },
//             orgName: { type: String, required: false }
//         },
//         required: false
//     },
//     zaposleni: {
//         type: [
//                 {
//                     jmbg: { type: String, required: false },
//                     pozicija: {
//                         type: {
//                             pozcicijaId: { type: String, required: false },
//                             pozcicijaName: { type: String, required: false },
//                             dnevnica: { type: String, required: false },
//                         },
//                         required: false
//                     },
//                     sektor: {
//                         type: {
//                             sektorId: { type: String, required: false },
//                             sektorName: { type: String, required: false }
//                         },
//                         required: false
//                     },
//                     netopalataIzUgovora: { type: String, required: false },
//                     fixUgovoren: { type: String, required: false },

//                     tipUgovora: {
//                         type: {
//                             tipUgovoraId: { type: String, required: false },
//                             tipUgovoraName: { type: String, required: false }
//                         },
//                         required: false
//                     },
//                     kafa: { type: String, required: false },
//                     zaRacDnev: { type: String, required: false },
//                 }
//             ],
//         required: false
//     },
// })

// // const organizacijeSchema = new mongoose.Schema({
// //     name: {
// //         type: String,
// //         required: false
// //     },
// //     pib: {
// //         type: String,
// //         required: false
// //     },
// //     mb: {
// //         type: String,
// //         required: false
// //     },
// //     racun: {
// //         type: String,
// //         required: false
// //     },
// //     tip: {
// //         type: {
// //             tipId: { type: String, required: false },
// //             tipName: { type: String, required: false }
// //         },
// //         required: false
// //     },
// //     roditeljOrganizacija: {
// //         type: {
// //             orgId: { type: String, required: false },
// //             orgName: { type: String, required: false }
// //         },
// //         required: false
// //     },
// //     zaposleni: {
// //         type: [
// //                 {
// //                     jmbg: { type: String, required: false },
// //                     pozicija: { type: String, required: false },
// //                     sektor: {
// //                         type: {
// //                             sektorId: { type: String, required: false },
// //                             sektorName: { type: String, required: false }
// //                         },
// //                         required: false
// //                     },
// //                     netopalataIzUgovora: { type: String, required: false },
// //                     fixUgovoren: { type: String, required: false },

// //                     tipUgovora: { type: String, required: false },
// //                     kafa: { type: String, required: false },
// //                     zaRacDnev: { type: String, required: false },
// //                 }
// //             ],
// //         required: false
// //     },
// // })

// module.exports = mongoose.model('Organizacije', organizacijeSchema)
