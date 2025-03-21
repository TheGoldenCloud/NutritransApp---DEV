const FizickiParametar = require("../models/FizickiParametar")


const getAllFizickeAktivnosti = async (req, res) => { 
    try {
        const fizickiParametar = await FizickiParametar.find({ tip: "fizickaAkt" });

        // If no results found
        if (!fizickiParametar?.length) {
            return res.status(400).json({ message: 'Nisu nadjene fizicke aktivnosti' });
        }

        res.json(fizickiParametar);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

const createFizickuAktivnost = async (req, res) => {
    const { tip, naziv } = req.body
    console.log("Fizicnka aktivnost",tip,naziv);

    if (!naziv, !tip) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const duplicate = await FizickiParametar.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Fizicka aktivnost već postoji' })
    }
 
    const fp = await FizickiParametar.create({ tip, naziv })

    if (fp) {
        res.status(201).json({ message: `Fizicki parametar ${naziv} napravljen` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

const updateFizickuAktivnost = async (req, res) => {
    const { id, naziv } = req.body;
    console.log("Update fizi akt data: ", req.body);

    if (!id) {
        return res.status(400).json({ message: 'Fizicka aktivnost ID potreban' });
    }
  
    const cilj = await FizickiParametar.findById(id).exec();
    
    if (!cilj) {
        return res.status(400).json({ message: 'Fizicka aktivnost nije nadjena' });
    }
  
    const oldNaziv = cilj.naziv; // Store the old value
    cilj.naziv = naziv;
  
    const updatedCilj = await cilj.save();
  
    res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
};


const deleteFizickuAktivnost = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Fizicki parametar ID potreban' })
    }

    const cilj = await FizickiParametar.findById(id).exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Fizicki parametar nije nadjen' })
    }

    const result = await cilj.deleteOne()

    const reply = `Fizicki parametar ${result.naziv} izbrisan`

    res.json(reply)
}

//Dijagnoze
const getAllDijagnoze = async (req, res) => {
    try {
        const fizickiParametar = await FizickiParametar.find({ tip: "dijagnoza" });

        // If no results found
        if (!fizickiParametar?.length) {
            return res.status(400).json({ message: 'Nije nadjena ni jedna dijagnoza' });
        }

        res.json(fizickiParametar);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

const createDijagnozu = async (req, res) => {
    const { tip, naziv } = req.body
    console.log("Dijagnoza",tip,naziv);

    if (!naziv, !tip) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const duplicate = await FizickiParametar.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Dijagnoza već postoji' })
    }
 
    const fp = await FizickiParametar.create({ tip, naziv })

    if (fp) {
        res.status(201).json({ message: `Dijagnoza ${naziv} napravljena` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

const updateDijagnoza = async (req, res) => {
    const { id, naziv } = req.body;
    console.log("Dijagnoza data: ", req.body);

    if (!id) {
        return res.status(400).json({ message: 'Dijagnoza ID potreban' });
    }
  
    const cilj = await FizickiParametar.findById(id).exec();
    
    if (!cilj) {
        return res.status(400).json({ message: 'Dijagnoza nije nadjena' });
    }

    const oldNaziv = cilj.naziv; // Store the old value
    cilj.naziv = naziv;
  
    const updatedCilj = await cilj.save();
  
    res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
};


const deleteDijagnozu = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Dijagnoza ID potrebna' })
    }

    const cilj = await FizickiParametar.findById(id).exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Dijagnoza nije nadjena' })
    }

    const result = await cilj.deleteOne()

    const reply = `Dijagnoza ${result.naziv} izbrisana`

    res.json(reply)
}

module.exports = {
    getAllFizickeAktivnosti,
    createFizickuAktivnost,
    updateFizickuAktivnost,
    deleteFizickuAktivnost,

    getAllDijagnoze,
    createDijagnozu,
    updateDijagnoza,
    deleteDijagnozu
}