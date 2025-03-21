const Ishrana = require("../models/Ishrana")

const getAllIshrane = async (req, res) => {

    const pozicije = await Ishrana.find();

    if (!pozicije?.length) {
        return res.status(400).json({ message: 'Nisu nadjene ishrane' })
    }

    res.json(pozicije)
}

//Saljemo sve objeket iz kolekcije ali samo sa _id, name, naminice 
// const getAllIshraneNames = async (req, res, next) => {
//     try {
//       const ishrane = await Ishrana.find({}, { _id: 1, naziv: 1 }).lean();
  
//       req.ishraneNames = ishrane;
  
//       return res.json(ishrane);
//     } catch (error) {
//       console.error("Error fetching Ishrana:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
// };
//Nzm zasto ovo ima naminice, mrzi me da nadjem u app
const getAllIshraneNames = async (req, res, next) => {
    try {
        // Prikupljanje ishrane sa referenciranim namirnicama
        const ishrane = await Ishrana.find({}, { _id: 1, naziv: 1, namirnice: 1 }) // Uključujemo namirnice
            .populate('namirnice', '_id naziv') // Populacija podataka o namirnicama (samo _id i naziv)
            .lean(); // lean() vraća jednostavan JavaScript objekat umesto Mongoose dokumenta

        req.ishraneNames = ishrane;

        return res.json(ishrane); // Vraćamo podatke o ishrani sa namirnicama
    } catch (error) {
        console.error("Error fetching Ishrana:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//Izkljucujemo names
const getAllIshraneNames_ = async (req, res, next) => {
    try {
        // Prikupljanje ishrane sa referenciranim namirnicama
        const ishrane = await Ishrana.find({}, { _id: 1, naziv: 1 }) // Uključujemo namirnice
            .populate('_id naziv') // Populacija podataka o namirnicama (samo _id i naziv)
            .lean(); // lean() vraća jednostavan JavaScript objekat umesto Mongoose dokumenta

        req.ishraneNames = ishrane;

        return res.json(ishrane); // Vraćamo podatke o ishrani sa namirnicama
    } catch (error) {
        console.error("Error fetching Ishrana:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


//Redefinisi
const createNewIshrana = async (req, res) => {
    const { komentar, nazivIshrane, odabraneNamirnice } = req.body;

    // Confirm data
    if (!komentar || !nazivIshrane || odabraneNamirnice.length === 0) {
        return res.status(400).json({ message: 'Sva polja su potrebna' });
    }

    // Check for duplicate nazivIshrane
    const duplicate = await Ishrana.findOne({ naziv: nazivIshrane }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Ishrana već postoji' });
    }

    const pozicije = await Ishrana.create({ komentar, naziv: nazivIshrane, namirnice: odabraneNamirnice });

    if (pozicije) { // Created 
        res.status(201).json({ message: `Ishrana ${nazivIshrane} je napravljena` });
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' });
    }
};


const updateIshrana = async (req, res) => {
    const { IdIsh, komentar, nazivIshrane, odabraneNamirnice } = req.body;
    console.log("Ishrana update: ", req.body);

    // Confirm data
    if (!IdIsh || !komentar || !nazivIshrane || odabraneNamirnice.length === 0) {
        return res.status(400).json({ message: "Sva polja su potrebna" });
    }

    // Find existing Ishrana
    const namirnica = await Ishrana.findById(IdIsh).lean().exec();

    if (!namirnica) {
        return res.status(404).json({ message: "Ishrana nije pronađena" });
    }

    // Update properties
    const updatedNamirnice = await Ishrana.findByIdAndUpdate(IdIsh, 
        { komentar, naziv: nazivIshrane, namirnice: odabraneNamirnice }, 
        { new: true }
    );

    if (!updatedNamirnice) {
        return res.status(400).json({ message: "Ažuriranje nije uspelo" });
    }

    res.json({ message: `${updatedNamirnice.naziv} ažurirana` });
};


// RADI
const deleteIshrana = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Ishrana ID potrebna' })
    }

    // Does the user exist to delete?
    const pozicija = await Ishrana.findById(id).exec()

    if (!pozicija) {
        return res.status(400).json({ message: 'Ishrana nije nadjena' })
    }

    const result = await pozicija.deleteOne()

    const reply = `Ishrana ${result.naziv} izbrisana`

    res.json(reply)
}

module.exports = {
    getAllIshrane,
    getAllIshraneNames,
    getAllIshraneNames_,
    createNewIshrana,
    updateIshrana,
    deleteIshrana
}