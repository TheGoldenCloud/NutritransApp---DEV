const Pozicije = require('../models/Pozicije');
const Organizacije = require('../models/Ogranizacije')

const getAllPozicije = async (req, res) => {
    // Get all users from MongoDB
    const pozicije = await Pozicije.find();

    // If no users 
    if (!pozicije?.length) {
        return res.status(400).json({ message: 'Nisu nadjene pozicije' })
    }

    res.json(pozicije)
}

//Saljemo sve objeket iz kolekcije ali samo sa _id i name 
const getAllPozicijeNames = async (req, res) => {
    try {
        const pozicije = await Pozicije.find(
            { naziv: { $exists: true } },
            { naziv: 1, dnevnica: 1 }
        ).exec();
        
        res.json(pozicije);
        // console.log(pozicije);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
}

const createNewPozicije = async (req, res) => {
    const { naziv, dnevnica } = req.body
    // console.log(naziv, dnevnica);

    // Confirm data
    if (!naziv, !dnevnica) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    // Check for duplicate username
    const duplicate = await Pozicije.findOne({ naziv }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Pozicija već postoji' })
    }
 
    const pozicije = await Pozicije.create({ naziv, dnevnica })

    if (pozicije) { //created 
        res.status(201).json({ message: `Pozicija ${naziv} napravlja` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

//ODRRADI OVO
// const updatePozicije = async (req, res) => {
//     const { id, naziv, dnevnica } = req.body
//     // console.log(naziv);

//     // Confirm data
//     if (!id || !naziv || !dnevnica) {
//         return res.status(400).json({ message: 'Sva poslja su potrebna' })
//     }

//     const pozicije = await Pozicije.findById(id).exec()

//     pozicije.naziv = naziv
//     pozicije.dnevnica = dnevnica

//     const pozicijeUpdated = await pozicije.save()

//     //Treba da se updejtuje svim odgovarajucim zaposlenima u svim organizacijama

//     res.json({ message: `${pozicijeUpdated.naziv, pozicijeUpdated.dnevnica} updated` })
// }

const updatePozicije = async (req, res) => {
    const { id, naziv, dnevnica } = req.body;  //id, naziv, dnevnica

    try {
    
        const pozicijeData = await Pozicije.findById(id).exec()

        pozicijeData.naziv = naziv
        pozicijeData.dnevnica = dnevnica

        const organizacije = await Organizacije.find().exec();

        // Iterate through each organizacija document
        for (let i = 0; i < organizacije.length; i++) {
            const organizacija = organizacije[i];

            // Update pozcicijaName and dnevnica in each zaposleni object where pozcicijaId matches
            organizacija.zaposleni.forEach(zaposlen => {
                if (zaposlen.pozcicija && zaposlen.pozcicija.pozcicijaId === id) {
                    zaposlen.pozcicija.pozcicijaName = naziv;
                    zaposlen.pozcicija.dnevnica = dnevnica;
                }
            });

            await pozicijeData.save();
            await organizacija.save();
        }

        res.status(200).json({ message: 'pozcicijaName and dnevnica updated successfully in all organizacije' });

    } catch (error) {
        console.error('Error updating pozcicijaName and dnevnica in organizacije:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// RADI
const deletePozicije = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Pozicija ID potrebna' })
    }

    // Does the user exist to delete?
    const pozicija = await Pozicije.findById(id).exec()

    if (!pozicija) {
        return res.status(400).json({ message: 'Pozicija nije nadjena' })
    }

    const result = await pozicija.deleteOne()

    const reply = `Pozicija ${result.naziv} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllPozicije,
    getAllPozicijeNames,
    createNewPozicije,
    updatePozicije,
    deletePozicije
}