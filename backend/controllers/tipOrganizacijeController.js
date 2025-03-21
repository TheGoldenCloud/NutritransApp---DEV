const TipOrganizacije = require('../models/TipOrganizacije');
const Organizacije = require('../models/Ogranizacije')

// RADI
const getAllTipOrganizacije = async (req, res) => {
    // Get all users from MongoDB
    const tipOrganizacije = await TipOrganizacije.find();

    // If no users 
    if (!tipOrganizacije?.length) {
        return res.status(400).json({ message: 'Nisu nadjeni tipovi organizacije' })
    }

    res.json(tipOrganizacije)
}

//Saljemo sve objeket iz kolekcije ali samo sa _id i name 
const getAllTipOrganizacijeNames = async (req, res) => {
    try {
        const tipOrganizacije = await TipOrganizacije.find(
            { name: { $exists: true } },
            { name: 1 }
        ).exec();
        
        res.json(tipOrganizacije);
        // console.log(tipOrganizacije);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
}

// RADI
const createNewTipOrganizacije = async (req, res) => {
    const { name } = req.body
    // console.log(name);

    // Confirm data
    if (!name) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    // Check for duplicate username
    const duplicate = await TipOrganizacije.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'TipOrganizacije već postoji' })
    }
 
    const tipOrganizacije = await TipOrganizacije.create({ name })

    if (tipOrganizacije) { //created 
        res.status(201).json({ message: `Novi TipOrganizacije ${name} napravljen` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

//Updejtuje kolekciju i uslovno rekurzivno u organizacijama
const updateTipOrganizacije = async (req, res) => {
    const { id, name } = req.body
    console.log("REQUEST: ",req.body);

    // Confirm data
    if (!id || !name) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const tipOrganizacije = await TipOrganizacije.findById(id).exec()

    tipOrganizacije.name = name

    const tipOrganizacijeUpdated = await tipOrganizacije.save()

    //Updejtuje sve tipove u organizaciji
    const filter = { "tip.tipId": id };
    const updateDoc = {
        $set: { "tip.tipName": name }
    };

    const result = await Organizacije.updateMany(filter, updateDoc);
    console.log(`${result.modifiedCount} dokumenti su updejtovani.`);

    res.json({ message: `${tipOrganizacijeUpdated.name} promenjena` })
}

// RADI
const deleteTipOrganizacije = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Tip organizacije ID potreban' })
    }

    // Does the user exist to delete?
    const tipOrganizacije = await TipOrganizacije.findById(id).exec()

    if (!tipOrganizacije) {
        return res.status(400).json({ message: 'Tip organizacije nije nadjen' })
    }

    const result = await tipOrganizacije.deleteOne()

    const reply = `Tip organizacije ${result.name} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllTipOrganizacije,
    getAllTipOrganizacijeNames,
    createNewTipOrganizacije,
    updateTipOrganizacije,
    deleteTipOrganizacije
}