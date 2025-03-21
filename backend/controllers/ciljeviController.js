const Ciljevi = require("../models/Ciljevi")

const getAllCiljevi = async (req, res) => {

    const ciljevi = await Ciljevi.find({ tip: "primaranCilj" });
 
    if (!ciljevi?.length) {
        return res.status(400).json({ message: 'Nisu nadjeni ciljevi' })
    }

    res.json(ciljevi)
}

const createNewCilj = async (req, res) => {
    const { tip, naziv } = req.body
    console.log("Ciljevi",tip,naziv);

    if (!naziv, !tip) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const duplicate = await Ciljevi.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Cilj već postoji' })
    }
 
    const cilj = await Ciljevi.create({ tip, naziv })

    if (cilj) {
        res.status(201).json({ message: `Cilj ${naziv} napravljen` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

const updateCilj = async (req, res) => {
    const { id, naziv } = req.body;
    console.log("Update cilj data: ", req.body);

    if (!id) {
        return res.status(400).json({ message: 'Cilj ID potreban' });
    }
  
    const cilj = await Ciljevi.findById(id).exec();
    
    if (!cilj) {
        return res.status(400).json({ message: 'Cilj nije nadjen' });
    }
  
    const oldNaziv = cilj.naziv; // Store the old value
    cilj.naziv = naziv;
  
    const updatedCilj = await cilj.save();
  
    res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
};

const deleteCilj = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Cilj ID potreban' })
    }

    const cilj = await Ciljevi.findById(id).exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Cilj nije nadjen' })
    }

    const result = await cilj.deleteOne()

    const reply = `Cilj ${result.naziv} izbrisan`

    res.json(reply)
}

//Specificni ciljevi
const getAllSpecCiljevi = async (req, res) => {

    const ciljevi = await Ciljevi.find({ tip: "specCilj" });
 
    if (!ciljevi?.length) {
        return res.status(400).json({ message: 'Nisu nadjeni specificni ciljevi' })
    }

    res.json(ciljevi)
}

// getAllSpcCiljeviNames

// const getAllSpcCiljeviNames = async (req, res, next) => {
//     try {
//         const specCiljevi = await Ciljevi.find(
//             { tip: "specCilj" },
//             { _id: 1, naziv: 1 }
//         ).lean();

//         req.specCiljeviNames = specCiljevi;

//         return res.json(specCiljevi);
//     } catch (error) {
//         console.error("Error fetching SpecCiljevi:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

const getAllSpcCiljeviNames = async (req, res, next) => {
    try {
        // Prikupljanje specifičnih ciljeva sa referenciranim namirnicama
        const specCiljevi = await Ciljevi.find(
            { tip: "specCilj" },
            { _id: 1, naziv: 1, namirnice: 1 } // Uključujemo namirnice
        )
        .populate('namirnice', '_id naziv') // Populacija podataka o namirnicama (samo _id i naziv)
        .lean(); // lean() vraća jednostavan JavaScript objekat umesto Mongoose dokumenta

        req.specCiljeviNames = specCiljevi;

        return res.json(specCiljevi); // Vraćamo podatke o specifičnim ciljevima sa namirnicama
    } catch (error) {
        console.error("Error fetching SpecCiljevi:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// const createNewSpecCilj = async (req, res) => {
//     const { tip, naziv } = req.body
//     console.log("Spec Ciljevi",tip,naziv);

//     if (!naziv, !tip) {
//         return res.status(400).json({ message: 'Sva poslja su potrebna' })
//     }

//     const duplicate = await Ciljevi.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

//     if (duplicate) {
//         return res.status(400).json({ message: 'Specifican Cilj već postoji' })
//     }
 
//     const cilj = await Ciljevi.create({ tip, naziv })

//     if (cilj) {
//         res.status(201).json({ message: `Specifican Cilj ${naziv} napravljen` })
//     } else {
//         res.status(400).json({ message: 'Nisu validni podaci' })
//     }
// }

//Radi
const createNewSpecCilj = async (req, res) => { 
    const { tip, naziv, namirnice, podciljevi, selectedValueTipSpec,customCheckboxes } = req.body;
    console.log("Spec Ciljevi", tip, naziv, namirnice);

    // Validacija
    if (!naziv || !tip || (namirnice && namirnice.length === 0)) {
        return res.status(400).json({ message: 'Sva polja su potrebna' });
    }

    const duplicate = await Ciljevi.findOne({ naziv })
        .collation({ locale: 'en', strength: 2 })
        .lean()
        .exec();
    if (duplicate) {
        return res.status(400).json({ message: 'Specifičan Cilj već postoji' });
    }

    if (!Array.isArray(namirnice)) {
        return res.status(400).json({ message: 'Namirnice mora biti lista' });
    }

    // Proveri da li je podciljevi niz stringova
    if (podciljevi && !Array.isArray(podciljevi)) {
        return res.status(400).json({ message: 'Podciljevi mora biti lista stringova' });
    }

    try {
        // Kreiraj novi cilj
        const cilj = await Ciljevi.create({
            tip, 
            naziv, 
            namirnice, 
            // podciljevi: customCheckboxes,
            defTip: selectedValueTipSpec 
        });

        console.log("Created Spec Cilj:", cilj);

        if (cilj) {
            return res.status(201).json({ message: `Specifičan Cilj ${naziv} napravljen`, cilj });
        } else {
            return res.status(400).json({ message: 'Nisu validni podaci' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Greška na serveru', error: error.message });
    }
};

//
// const updateSpecCilj = async (req, res) => {
//     const { id, naziv, namirnice } = req.body;
//     console.log("Update cilj data: ", req.body);

//     if (!id) {
//         return res.status(400).json({ message: 'Cilj ID potreban' });
//     }
  
//     const cilj = await Ciljevi.findById(id).exec();
    
//     if (!cilj) {
//         return res.status(400).json({ message: 'Cilj nije nadjen' });
//     }
    
//     const oldNaziv = cilj.naziv;
//     cilj.naziv = naziv;
  
//     const updatedCilj = await cilj.save();
  
//     res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
// };

const updateSpecCilj = async (req, res) => {
    const { id, naziv, namirnice, selectedValueTipSpec,customCheckboxes } = req.body;
    console.log("Update cilj data: ", req.body);

    if (!id) {
        return res.status(400).json({ message: 'Cilj ID potreban' });
    }

    const cilj = await Ciljevi.findById(id).exec();

    if (!cilj) {
        return res.status(400).json({ message: 'Cilj nije nadjen' });
    }

    // Ažuriraj naziv
    const oldNaziv = cilj.naziv;
    cilj.naziv = naziv;
    cilj.defTip = selectedValueTipSpec;
    // cilj.podciljevi = customCheckboxes;

    // if (customCheckboxes && Array.isArray(customCheckboxes)) {
    //     cilj.podciljevi = customCheckboxes; // Postavljamo novu listu namirnica
    // }

    // Ažuriraj listu namirnica
    if (namirnice && Array.isArray(namirnice)) {
        cilj.namirnice = namirnice; // Postavljamo novu listu namirnica
    }

    const updatedCilj = await cilj.save();

    res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}`, updatedCilj });
};


const deleteSpecCilj = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Specifican Cilj ID potreban' })
    }

    const cilj = await Ciljevi.findById(id).exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Specifican Cilj nije nadjen' })
    }

    const result = await cilj.deleteOne()

    const reply = `Specifican Cilj ${result.naziv} izbrisan`

    res.json(reply)
}

//Motivacije
const getAllMotiv = async (req, res) => {

    const ciljevi = await Ciljevi.find({ tip: "motiv" });
 
    if (!ciljevi?.length) {
        return res.status(400).json({ message: 'Nisu nadjeni motivi' })
    }

    res.json(ciljevi)
}

const createNewMotiv = async (req, res) => {
    const { tip, naziv } = req.body
    console.log("Motiv",tip,naziv);

    if (!naziv, !tip) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const duplicate = await Ciljevi.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Motivacija već postoji' })
    }
 
    const cilj = await Ciljevi.create({ tip, naziv })

    if (cilj) {
        res.status(201).json({ message: `Motivacija ${naziv} napravljena` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

const updateMotiv = async (req, res) => {
    const { id, naziv } = req.body;
    console.log("Update cilj data: ", req.body);

    if (!id) {
        return res.status(400).json({ message: 'Motiv ID potreban' });
    }
  
    const cilj = await Ciljevi.findById(id).exec();
    
    if (!cilj) {
        return res.status(400).json({ message: 'Motiv nije nadjen' });
    }
  
    const oldNaziv = cilj.naziv;
    cilj.naziv = naziv;
  
    const updatedCilj = await cilj.save();
  
    res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
};

const deleteMotiv = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Motivacija ID potreban' })
    }

    const cilj = await Ciljevi.findById(id).exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Motivacija nije nadjena' })
    }

    const result = await cilj.deleteOne()

    const reply = `Motivacija ${result.naziv} izbrisana`

    res.json(reply)
}

module.exports = {
    getAllCiljevi,
    createNewCilj,
    updateCilj,
    deleteCilj,

    getAllSpecCiljevi,
    getAllSpcCiljeviNames,
    createNewSpecCilj,
    updateSpecCilj,
    deleteSpecCilj,
    
    getAllMotiv,
    createNewMotiv,
    updateMotiv,
    deleteMotiv
}