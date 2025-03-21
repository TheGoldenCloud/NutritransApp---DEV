const Organizacije = require('../models/Ogranizacije')
const User = require('../models/User')
const Obracuni = require('../models/Obracuni')
// const multer = require('multer');
// const XLSX = require('xlsx');
// const upload = multer({ dest: 'uploads/' });

const getObracun = async (req, res) => {
    // console.log("Obracun data: ", req.params)

    const { key } = req.params

    const obracun = await Obracuni.find({ key })

    if (!obracun?.length) {
        return res.status(400).json({ message: 'Nije nadjen obracun' })
    }

    res.json(obracun)
}

const getAllObracuni = async (req, res) => {
    // console.log("Obracun data: ", req.params)

    const obracuni = await Obracuni.find()

    if (!obracuni?.length) {
        return res.status(400).json({ message: 'Nije nadjen obracun' })
    }

    res.json(obracuni)
}

//ZA PREVIEW I MISLIM DA MOZE ZA EDIT
const getObracunZaPreview = async (req, res) => {
    const { id } = req.params;

    // console.log("Obracun data id: ", id);

    try {
        const obracun = await Obracuni.findById(id);

        if (!obracun) {
            return res.status(404).json({ message: 'Nije nadjen obracun' });
        }

        res.json([obracun]);
        // console.log("Get obrac: ",obracun)
        // console.log("Get obrac arr: ",[obracun])
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//Ovde kreiram obracun sa propratim pozicijama - ime je bezveze nzm zasto
const uploadNetoPlate = async (req, res) => {
    // console.log("Imported data: ", req.body);

    try {
        const { key, kurs, datum, brPrazDana, iznosKafe, organizacijaId } = req.body;

        const organizacija = await Organizacije.findById(organizacijaId);

        if (!organizacija) {
            return res.status(404).json({ message: 'Organizacija not found' });
        }

        const organizacijaName = organizacija.name;

        const zaposleni = organizacija.zaposleni;

        const jmbgs = zaposleni.map(z => z.jmbg);
        const users = await User.find({ jmbg: { $in: jmbgs } });

        const zaposleni_ = zaposleni.map(z => {
            const user = users.find(u => u.jmbg === z.jmbg);
            return {
                jmbg: z.jmbg,
                name: user ? user.name : '',
                lastName: user ? user.lastName : '',
                valuta: user ? user.valuta : '',
                zaracDnev: z.zaRacDnev,
                kafa: z.kafa,
                dnevnica: z.pozicija ? z.pozicija.dnevnica : '',
                netopalataIzUgovora: z.netopalataIzUgovora,
                fixUgovoren: z.fixUgovoren
            };
        });

        const response = {
            organizacijaId,
            organizacijaName,
            datum,
            key,
            kurs,
            brPrazDana,
            iznosKafe,
            zaposleni_: zaposleni_
        };

        // console.log('Final response:', response); 
        
        const obracun = await Obracuni.create(response);

        if (obracun) {
            return res.status(201).json({ message: 'Obracun napravljen' });
        } else {
            return res.status(400).json({ message: 'Nevalidi podaci poslati' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// const uploadNetoPlate = async (req, res) => {
//     console.log("Bez - Imported data: ", req.body)
//     //organizacijaId, kurs, brPrazDana, iznosKafe, key
//     try {
//         const { key, kurs, brPrazDana, iznosKafe,organizacijaId } = req.body;

//         const organizacija = await Organizacije.findById(organizacijaId);

//         if (!organizacija) {
//             return res.status(404).json({ message: 'Organizacija not found' });
//         }

//         const zaposleni = organizacija.zaposleni;

//         const jmbgs = zaposleni.map(z => z.jmbg);
//         const users = await User.find({ jmbg: { $in: jmbgs } });

//         const zaposleni_ = zaposleni.map(z => {
//             const user = users.find(u => u.jmbg === z.jmbg);
//             return {
//                 jmbg: z.jmbg,
//                 name: user ? user.name : '',
//                 lastName: user ? user.lastName : '',
//                 valuta: user ? user.valuta : '',
//                 zaracDnev: z.zaRacDnev,
//                 kafa: z.kafa,
//                 dnevnica: z.pozicija.dnevnica,
//                 netopalataIzUgovora: z.netopalataIzUgovora,
//                 fixUgovoren: z.fixUgovoren
//             };
//         });

//         const response = {
//             organizacijaId,
//             key,
//             kurs,
//             brPrazDana,
//             iznosKafe,
//             zaposleni_: zaposleni_
//         };

//         // res.json(response);

//         const obracun = await Obracuni.create(response)

//         if (obracun) {
//             return res.status(201).json({ message: 'Obracun napravljen' })
//         } else {
//             return res.status(400).json({ message: 'Nevalidi podaci poslati' })
//         }

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }

// }

// netopalataIzUgovora: user.netopalataIzUgovora,
// fixUgovoren: user.fixUgovoren,
//RADI ALI OVERAJDUJE OSTALE PROPERTIJE 
// const uploadPojedinacniObracun = async (req, res) => {
//     const { key, jmbg, prevoz, netoPlata, prinudnaNaplata, akontacija, kredit, plata, bol, kazna, praz, tros, bon, dPrekR, rep } = req.body;

//     try {

//         let obracun = await Obracuni.findOne({ key });

//         if (!obracun) {
//             return res.status(404).json({ message: 'Obracun not found!' });
//         }

//         const foundEmployeeIndex = obracun.zaposleni_.findIndex(emp => emp.jmbg === jmbg);

//         if (foundEmployeeIndex !== -1) {
//             obracun.zaposleni_[foundEmployeeIndex] = {
//                 ...obracun.zaposleni_[foundEmployeeIndex],
//                 prev: prevoz,
//                 np: netoPlata,
//                 prinN: prinudnaNaplata,
//                 ak: akontacija,
//                 kred: kredit,
//                 plata,
//                 bol,
//                 kazna,
//                 praz,
//                 tros,
//                 bon,
//                 dPrekR,
//                 rep
//             };
//         } else {
//             obracun.zaposleni_.push({
//                 jmbg,
//                 prev: prevoz,
//                 np: netoPlata,
//                 prinN: prinudnaNaplata,
//                 ak: akontacija,
//                 kred: kredit,
//                 plata,
//                 bol,
//                 kazna,
//                 praz,
//                 tros,
//                 bon,
//                 dPrekR,
//                 rep
//             });
//         }

//         await obracun.save();

//         return res.status(200).json(obracun);
//     } catch (error) {
//         console.error('Error updating obracun:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };

//editPojedinacniObracun

const updatePojedinacniObracun = async (req, res) => {

    console.log("REQUEST JE: ", req.body)

        const { id, jmbg, ...updateData } = req.body;

    try {
        // Find the obracun document by id
        const obracun = await Obracuni.findById(id);
        if (!obracun) {
            return res.status(404).json({ message: 'Obračun not found' });
        }

        // Find the specific employee within the zaposleni_ array
        const zaposleniIndex = obracun.zaposleni_.findIndex(z => z.jmbg === jmbg);
        if (zaposleniIndex === -1) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update the employee's fields with the data from updateData
        Object.assign(obracun.zaposleni_[zaposleniIndex], updateData);

        // Save the updated obracun document
        await obracun.save();

        res.status(200).json({ message: 'Employee updated successfully', obracun });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

    // const { id, jmbg, updateData } = req.body;

    // try {
    //     // Find the obracun document by id
    //     const obracun = await Obracuni.findById(id);
    //     if (!obracun) {
    //         return res.status(404).json({ message: 'Obračun not found' });
    //     }

    //     // Find the specific employee within the zaposleni_ array
    //     const zaposleni = obracun.zaposleni_.find(z => z.jmbg === jmbg);
    //     if (!zaposleni) {
    //         return res.status(404).json({ message: 'Employee not found' });
    //     }

    //     // Update the employee's fields with the data from updateData
    //     Object.assign(zaposleni, updateData);

    //     // Save the updated obracun document
    //     await obracun.save();

    //     res.status(200).json({ message: 'Employee updated successfully', obracun });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Internal Server Error' });
    // }

}



//TREBALO BI DA NE OVERAJDUJE - Updejtuje po jednu poziciju u obracu
const uploadPojedinacniObracun = async (req, res) => {
    const obracunData = req.body;
    // console.log("all: ",obracunData)

    try {

        const obracun = await Obracuni.findOne({ key: obracunData.key });

        if (!obracun) {
            return res.status(404).json({ message: 'Obracun not found' });
        }

        obracun.zaposleni_ = obracun.zaposleni_.map(zaposleni => {
            if (zaposleni.jmbg === obracunData.jmbg) {
                return {
                    ...zaposleni,
                    dnevnica: obracunData.dnevnica || zaposleni.dnevnica,
                    prev: obracunData.prevoz || zaposleni.prev,
                    np: obracunData.netoPlata || zaposleni.np,
                    prinN: obracunData.prinudnaNaplata || zaposleni.prinN,
                    ak: obracunData.akontacija || zaposleni.ak,
                    kred: obracunData.kredit || zaposleni.kred,
                    plata: {
                        vrOd: obracunData.plata?.vrOd || zaposleni.plata?.vrOd,
                        vrDo: obracunData.plata?.vrDo || zaposleni.plata?.vrDo,
                        brRadDa: obracunData.plata?.brRadDa || zaposleni.plata?.brRadDa,
                        dnev: obracunData.plata?.dnev || zaposleni.plata?.dnev,
                        fixCheckbox: obracunData.plata?.fixCheckbox || zaposleni.plata?.fixCheckbox,
                        realPlata: obracunData.plata?.realPlata || zaposleni.plata?.realPlata
                    },
                    bol: {
                        vrOd: obracunData.bol?.vrOd || zaposleni.bol?.vrOd,
                        vrDo: obracunData.bol?.vrDo || zaposleni.bol?.vrDo,
                        tipIzracBolovanje: obracunData.bol?.tipIzracBolovanje || zaposleni.bol?.tipIzracBolovanje,
                        brDana: obracunData.bol?.brDana || zaposleni.bol?.brDana,
                        bol: obracunData.bol?.bol || zaposleni.bol?.bol
                    },
                    kazna: {
                        tip: obracunData.kazna?.tip || zaposleni.kazna?.tip,
                        nac: obracunData.kazna?.nac || zaposleni.kazna?.nac,
                        izn: obracunData.kazna?.izn || zaposleni.kazna?.izn,
                        procenatKazna: obracunData.kazna?.procenatKazna || zaposleni.kazna?.procenatKazna,
                        kom: obracunData.kazna?.kom || zaposleni.kazna?.kom
                    },
                    praz: {
                        brD: obracunData.praz?.brD || zaposleni.praz?.brD,
                        izn: obracunData.praz?.izn || zaposleni.praz?.izn
                    },
                    tros: {
                        ci: obracunData.tros?.ci || zaposleni.tros?.ci,
                        kom: obracunData.tros?.kom || zaposleni.tros?.kom
                    },
                    bon: {
                        ci: obracunData.bon?.ci || zaposleni.bon?.ci,
                        kom: obracunData.bon?.kom || zaposleni.bon?.kom
                    },
                    dPrekR: {
                        brD: obracunData.dPrekR?.brD || zaposleni.dPrekR?.brD,
                        izn: obracunData.dPrekR?.izn || zaposleni.dPrekR?.izn
                    },
                    rep: {
                        ci: obracunData.rep?.ci || zaposleni.rep?.ci,
                        kom: obracunData.rep?.kom || zaposleni.rep?.kom
                    }
                };
            }
            return zaposleni;
        });

        await obracun.save();

        res.status(200).json(obracun);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadNetoPlateImport = async (req, res) => {
    // console.log("Imported data: ", req.body)

    res.status(200).json({message:"Uspelo, stigli podaci"})
}

// DOLE NISTA, SAMO OVI GORE

// const getAllNotes = async (req, res) => {
//     // Get all notes from MongoDB
//     const notes = await Note.find().lean()

//     // If no notes 
//     if (!notes?.length) {
//         return res.status(400).json({ message: 'No notes found' })
//     }

//     const notesWithUser = await Promise.all(notes.map(async (note) => {
//         const user = await User.findById(note.user).lean().exec()
//         return { ...note, username: user.username }
//     }))

//     res.json(notesWithUser)
// }

// const createNewNote = async (req, res) => {
//     const { user, title, text } = req.body

//     // Confirm data
//     if (!user || !title || !text) {
//         return res.status(400).json({ message: 'All fields are required' })
//     }

//     // Check for duplicate title
//     const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

//     if (duplicate) {
//         return res.status(409).json({ message: 'Duplicate note title' })
//     }

//     // Create and store the new user 
//     const note = await Note.create({ user, title, text })

//     if (note) { // Created 
//         return res.status(201).json({ message: 'New note created' })
//     } else {
//         return res.status(400).json({ message: 'Invalid note data received' })
//     }

// }

// const updateNote = async (req, res) => {
//     const { id, user, title, text, completed } = req.body

//     // Confirm data
//     if (!id || !user || !title || !text || typeof completed !== 'boolean') {
//         return res.status(400).json({ message: 'All fields are required' })
//     }

//     // Confirm note exists to update
//     const note = await Note.findById(id).exec()

//     if (!note) {
//         return res.status(400).json({ message: 'Note not found' })
//     }

//     // Check for duplicate title
//     const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

//     // Allow renaming of the original note 
//     if (duplicate && duplicate?._id.toString() !== id) {
//         return res.status(409).json({ message: 'Duplicate note title' })
//     }

//     note.user = user
//     note.title = title
//     note.text = text
//     note.completed = completed

//     const updatedNote = await note.save()

//     res.json(`'${updatedNote.title}' updated`)
// }

const deleteObracun = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Obracun ID required' })
    }

    const obracun = await Obracuni.findById(id).exec()

    if (!obracun) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await obracun.deleteOne()

    const reply = `Obracun '${result.key}' with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getObracun,
    getAllObracuni,
    getObracunZaPreview,
    uploadNetoPlate,
    uploadNetoPlateImport,
    updatePojedinacniObracun,
    uploadPojedinacniObracun,
    deleteObracun,
}