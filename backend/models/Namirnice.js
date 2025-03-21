const mongoose = require('mongoose');

const NamirniceSchema = new mongoose.Schema({
    naziv: {
        type: String,
        required: true,         // Polje za naziv je obavezno
    },
    grupa: {
        type: String,           // Grupa namirnice (npr. Voće, Povrće)
        required: true,         // Polje je obavezno
    },
    podtip: {
        type: String,           // Podtip unutar grupe (npr. Citrus, Korenito)
        required: true,         // Polje je obavezno
    },
    laktoza: {
        type: Boolean,          // Da li namirnica sadrži laktozu
        default: false,
    },
    gluten: {
        type: Boolean,          // Da li namirnica sadrži gluten
        default: false,
    },
    alergen: {
        type: Boolean,          // Da li je namirnica alergen
        default: false,
    },
});

module.exports = mongoose.model('Namirnica', NamirniceSchema);
