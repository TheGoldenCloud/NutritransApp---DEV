const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paketSchema = new Schema({
  orgderId: { type: String, required: false },  // Order id u bazi banke
  naziv_paketa: { type: String, required: false },  // Naziv paketa
  cena: { type: Number, required: false },  // Cena paketa
  valuta: { type: String, required: false },  // Valuta (npr. "RSD", "EUR")
  status_placanja: { type: String, required: false },
  status: { type: String, required: false }, // "Aktivan", "Neaktivan"
  tip: { type: String, required: false }, // "Godisnji", "Mesecni"
  broj: {
    full: { type: String, required: false },
    base: { type: String, required: false }  
  },
  datum_kreiranja: { type: Date, default: Date.now },  // Datum kada je paket kreiran
  datum_isteka: { type: Date },  // Datum kada je paket istice
  datum_placanja: { type: Date },  // Datum kada je plaćeno
  datum_otkazivanja: { type: Date },  // Datum kada je otkazao
  idUser: { type: String, required: false },  // ID korisnika koji je izvršio plaćanje
  transakcioni_id: { type: String, required: false },  // Jedinstveni ID transakcije
  metoda_placanja: { type: String, required: false },  // Metoda plaćanja (npr. "kartica", "PayPal")
  TransId: { type: String, required: false },
  recurringID: { type: String, required: false },
  userMail: { type: String, required: false },
  username: { type: String, required: false },
  userLastname: { type: String, required: false },
});

const Paket = mongoose.model('Paket', paketSchema);

module.exports = Paket;
