const TipUgovora = require('../models/TipUgovora');
const Organizacije = require('../models/Ogranizacije')

// RADI
const getAllTipUgovora = async (req, res) => {
    // Get all users from MongoDB
    const tipUgovora = await TipUgovora.find();

    // If no users 
    if (!tipUgovora?.length) {
        return res.status(400).json({ message: 'Nisu nadjeni tipovi ugovora' })
    }

    res.json(tipUgovora)
}

//Saljemo sve objeket iz kolekcije ali samo sa _id i name 
const getAllTipUgovoraNames = async (req, res) => {
    try {
        const tipUgovora = await TipUgovora.find(
            { name: { $exists: true } },
            { name: 1 }
        ).exec();
        
        res.json(tipUgovora);
        // console.log(tipUgovora);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
}

// RADI
const createNewTipUgovora = async (req, res) => {
    const { name } = req.body
    // console.log(name);

    // Confirm data
    if (!name) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    // Check for duplicate username
    const duplicate = await TipUgovora.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Tip Ugovora već postoji' })
    }
 
    const tipUgovora = await TipUgovora.create({ name })

    if (tipUgovora) { //created 
        res.status(201).json({ message: `Novi Tip Ugovora ${name} napravljen` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

//const updateTipUgovora = async (req, res) => {
    // const { id, name } = req.body
    // // console.log(name);

    // // Confirm data
    // if (!id || !name) {
    //     return res.status(400).json({ message: 'Sva poslja su potrebna' })
    // }

    // const tipUgovora = await TipUgovora.findById(id).exec()

    // tipUgovora.name = name

    // const tipUgovoraUpdated = await tipUgovora.save()

    // //Treba da se updejtuje svim odgovarajucim zaposlenima u svim organizacijama



    // res.json({ message: `${tipUgovoraUpdated.name} updated` })
    
//}

//Updejtuje kolekciju i uslovno rekurzivno u organizacijama
const updateTipUgovora = async (req, res) => {
    const { id, name } = req.body;

    try {

        const tipU = await TipUgovora.findById(id).exec()

        tipU.name = name

        // const tipUgovoraUpdated = await tipUgovora.save()

        // Find all organizacije documents
        const organizacije = await Organizacije.find().exec();

        // Iterate through each organizacija document
        for (let i = 0; i < organizacije.length; i++) {
            const organizacija = organizacije[i];

            // Update tipUgovoraName in each zaposleni object where tipUgovoraId matches
            organizacija.zaposleni.forEach(zaposlen => {
                if (zaposlen.tipUgovora && zaposlen.tipUgovora.tipUgovoraId === id) {
                    zaposlen.tipUgovora.tipUgovoraName = name;
                }
            });

            // Save the updated organizacija document
            await organizacija.save();
            await tipU.save()
        }

        res.status(200).json({ message: 'tipUgovoraName updated successfully in all organizacije' });

    } catch (error) {
        console.error('Error updating tipUgovoraName in organizacije:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// RADI
const deleteTipUgovora = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Tip Ugovora ID potreban' })
    }

    // Does the user exist to delete?
    const tipUgovora = await TipUgovora.findById(id).exec()

    if (!tipUgovora) {
        return res.status(400).json({ message: 'Tip Ugovora nije nadjen' })
    }

    const result = await tipUgovora.deleteOne()

    const reply = `Tip Ugovora ${result.name} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllTipUgovora,
    getAllTipUgovoraNames,
    createNewTipUgovora,
    updateTipUgovora,
    deleteTipUgovora
}