const mongoose = require("mongoose");

// Izveštaj
const PdfDetailsSchema = new mongoose.Schema(
  {
    pdf: { type: String, required: false },
    title: { type: String, required: false },
    idKlijenta: { type: String, required: false },
    datumKreir: { type: String, required: false },
    vreme: { type: String, required: false },
    datumPoc: { type: String, required: false },
    datumKraj: { type: String, required: false },
    status: { type: String, enum: ['Aktivan', 'Neaktivan'], required: false },
    tip: { type: String, required: false },
    klijentData: {
      ime: { type: String, required: false },
      prezime: { type: String, required: false }, 
      tez: { type: String, required: false },
      bmi: { type: String, required: false },
      ukupnaKalVred: { type: String, required: false },
      visina: { type: String, required: false },
      primCilj: { type: String, required: false },
      specCilj: { type: [String], required: false },
      motiv: { type: String, required: false },
      nivoAkt: { type: String, required: false },
      datumRodj: { type: String, required: false },
      tdee: { type: String, required: false },
      vrstaFiz: { type: [String], required: false },
      struk: { type: String, required: false },
      kuk: { type: String, required: false },
      vrat: { type: String, required: false },
      krv: { type: String, required: false },
      dijag: { type: String, required: false },
      alerg: { type: String, required: false },
      ish: { type: String, required: false },
      obr: { type: String, required: false },
      pretIskDij: { type: String, required: false },
      pus: { type: String, required: false },
      alk: { type: String, required: false },
      bmrValue: { type: String, required: false },
    }
  },
  { collection: "PdfDetails" }
);

mongoose.model("PdfDetails", PdfDetailsSchema);