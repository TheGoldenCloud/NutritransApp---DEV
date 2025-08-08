const mongoose = require("mongoose");

const chatKonverzacija = new mongoose.Schema({
  //Mozda u buducnosti treba staviti da se vidi ime i prezime itd...
  datum: { type: String, required: false, default: "" },
  vreme: { type: String, required: false },
  primCilj: { type: String, required: false, default: "" },
  name: { type: String, required: false },
  lastname: { type: String, required: false, default: "" },
  idUser: { type: String, required: false, default: "" },
  poslatiPrompt: {
    predUvod: { type: String, required: false, default: "" },
    uvod: { type: String, required: false, default: "" },

    predHolistickiPristup: { type: String, required: false, default: "" },
    holistickiPristup: { type: String, required: false, default: "" },

    predPlanIshrane: { type: String, required: false, default: "" },
    planIshrane: { type: String, required: false, default: "" },

    predDani: { type: String, required: false, default: "" },
    dani: { type: String, required: false, default: "" },

    predSmernice: { type: String, required: false, default: "" },
    smernice: { type: String, required: false, default: "" },

    predPlanFizickeAktivnosti: { type: String, required: false, default: "" },
    planFizickeAktivnosti: { type: String, required: false, default: "" },

    preadPodrskaZaImunitet: { type: String, required: false, default: "" },
    podrskaZaImunitet: { type: String, required: false, default: "" },

    predSpavanjeSavet: { type: String, required: false, default: "" },
    spavanjeSavet: { type: String, required: false, default: "" },

    predUnosVode: { type: String, required: false, default: "" },
    unosVode: { type: String, required: false, default: "" },

    predPusenje: { type: String, required: false, default: "" },
    pusenje: { type: String, required: false, default: "" },

    predAlkohol: { type: String, required: false, default: "" },
    alkohol: { type: String, required: false, default: "" },

    predZakljucak: { type: String, required: false, default: "" },
    zakljucak: { type: String, required: false, default: "" },
  },
  odgovor: {
    uvod: { type: String, required: false, default: "" },
    holistickiPristup: { type: String, required: false, default: "" },
    planIshrane: { type: String, required: false, default: "" },
    dani: [
      {
        dan: { type: String, required: false, default: "" },
        dorucak: {
          opis: { type: String, required: false, default: "" },
          sastojci: { type: String, required: false, default: "" },
          instrukcije: { type: String, required: false, default: "" },
          kalorije: { type: Number, required: false, default: 0 },
          cena: { type: Number, required: false, default: 0 },
          nutritivna_vrednost: { type: String, required: false, default: "" },
          Makronutrijenti: {
            Proteini: { type: Number, required: false, default: 0 },
            Ugljeni_hidrati: { type: Number, required: false, default: 0 },
            Masti: { type: Number, required: false, default: 0 },
          },
        },
        uzina1: {
          opis: { type: String, required: false, default: "" },
          sastojci: { type: String, required: false, default: "" },
          instrukcije: { type: String, required: false, default: "" },
          kalorije: { type: Number, required: false, default: 0 },
          cena: { type: Number, required: false, default: 0 },
          nutritivna_vrednost: { type: String, required: false, default: "" },
          Makronutrijenti: {
            Proteini: { type: Number, required: false, default: 0 },
            Ugljeni_hidrati: { type: Number, required: false, default: 0 },
            Masti: { type: Number, required: false, default: 0 },
          },
        },
        rucak: {
          opis: { type: String, required: false, default: "" },
          sastojci: { type: String, required: false, default: "" },
          instrukcije: { type: String, required: false, default: "" },
          kalorije: { type: Number, required: false, default: 0 },
          cena: { type: Number, required: false, default: 0 },
          nutritivna_vrednost: { type: String, required: false, default: "" },
          Makronutrijenti: {
            Proteini: { type: Number, required: false, default: 0 },
            Ugljeni_hidrati: { type: Number, required: false, default: 0 },
            Masti: { type: Number, required: false, default: 0 },
          },
        },
        uzina2: {
          opis: { type: String, required: false, default: "" },
          sastojci: { type: String, required: false, default: "" },
          instrukcije: { type: String, required: false, default: "" },
          kalorije: { type: Number, required: false, default: 0 },
          cena: { type: Number, required: false, default: 0 },
          nutritivna_vrednost: { type: String, required: false, default: "" },
          Makronutrijenti: {
            Proteini: { type: Number, required: false, default: 0 },
            Ugljeni_hidrati: { type: Number, required: false, default: 0 },
            Masti: { type: Number, required: false, default: 0 },
          },
        },
        vecera: {
          opis: { type: String, required: false, default: "" },
          sastojci: { type: String, required: false, default: "" },
          instrukcije: { type: String, required: false, default: "" },
          kalorije: { type: Number, required: false, default: 0 },
          cena: { type: Number, required: false, default: 0 },
          nutritivna_vrednost: { type: String, required: false, default: "" },
          Makronutrijenti: {
            Proteini: { type: Number, required: false, default: 0 },
            Ugljeni_hidrati: { type: Number, required: false, default: 0 },
            Masti: { type: Number, required: false, default: 0 },
          },
        },
      },
    ],
    // dani: { type: String, required: false, default: "" },
    smernice: { type: String, required: false, default: "" },
    planFizickeAktivnosti: { type: String, required: false, default: "" },
    podrskaZaImunitet: { type: String, required: false, default: "" },
    spavanjeSavet: { type: String, required: false, default: "" },
    unosVode: { type: String, required: false, default: "" },
    pusenje: { type: String, required: false, default: "" },
    alkohol: { type: String, required: false, default: "" },
    zakljucak: { type: String, required: false, default: "" },
  },
});

module.exports = mongoose.model("ChatKonverzacija", chatKonverzacija);
