const Organizacije = require('../models/Ogranizacije')
const User = require('../models/User')
const mongoose = require('mongoose')

const getAllOrganizacije = async (req, res) => {

    const organizacije = await Organizacije.find();

    // If no users 
    if (!organizacije?.length) {
        return res.status(400).json({ message: 'Nisu nadjene organizacije' })
    }

    res.json(organizacije)
}

//Saljemo sve objeket iz kolekcije ali samo sa _id i name
const getAllOrganizacijeNames = async (req, res) => {
    try {
        const organizacije = await Organizacije.find(
            { name: { $exists: true } },
            { name: 1 }
        ).exec();
        
        res.json(organizacije);
        // console.log(organizacije);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
}
//PROVERI DA LI JE !!!UNDERCONSTRUCTION!!! 
const getAllOrganizacijeSaPozicijama = async (req, res) => {
    
    const { id } = req.params;
    console.log(req.params);

    try {

        const organizacija = await Organizacije.findById(id);

        if (!organizacija) {
            return res.status(404).json({ message: 'Organizacija nije nadjena' });
        }

        const updatedZaposleni = await Promise.all(
            organizacija.zaposleni.map(async (employee) => {
                const user = await User.findOne({ jmbg: employee.jmbg });
                if (user) {
                    return {
                        ...employee.toObject(),
                        name: user.name,
                        lastname: user.lastName,
                    };
                } else {
                    return employee.toObject();
                }
            })
        );

        res.json(updatedZaposleni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

// RADI
const createNewOrganizacije = async (req, res) => {
    const { name, tipName_, tipId_ , pib, mb, racun, orgId, orgName } = req.body
    // console.log(req.body);

    // Confirm data
    if (!name || !tipName_ || !tipId_ || !pib || !mb || !racun) {
        return res.status(400).json({ message: 'Sva poslja su potrebna' })
    }

    const duplicate = await Organizacije.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Organizacije već postoji' })
    }

    const tip = {
        tipId: tipId_,
        tipName: tipName_
    }

    const roditeljOrganizacija = {
        orgId: orgId,
        orgName: orgName
    }
 
    const organizacija = await Organizacije.create({ name, tip, pib, mb, racun, roditeljOrganizacija })

    if (organizacija) { //created 
        res.status(201).json({ message: `Nova Organizacija ${name} napravljena` })
    } else {
        res.status(400).json({ message: 'Nisu validni podaci' })
    }
}

//Radi
const createNewPozicijaOrganizaciji = async (req, res) => {
    
    const { organizacijaId,jmbg,fixUgovoren,kafa, zaRacDnev, netopalataIzUgovora ,pozicija, tipUgovora,sektor } = req.body;
    console.log("req: ",req.body);

    if (!organizacijaId || !jmbg || !pozicija || !sektor || !netopalataIzUgovora || !fixUgovoren || !tipUgovora || !kafa || !zaRacDnev) {
        return res.status(400).json({ message: 'Sva polja su potrebna.' });
    }

    try {

        // const pozicija = { 
        //     pozicijaId: 
        //     pozicijaName: 
        // },

        // const sektor = { 
        //     sektorId: 
        //     sektorName: 
        // },

        // const tipUgovora = { 
        //     tipUgovoraId: 
        //     tipUgovoraName: 
        // },

        const newEmployee = { jmbg, pozicija, sektor, netopalataIzUgovora, fixUgovoren, tipUgovora, kafa, zaRacDnev };

        const result = await Organizacije.findByIdAndUpdate(
            organizacijaId,
            { $push: { zaposleni: newEmployee } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Organizacija nije nanjena.' });
        }

        res.status(200).json({ message: 'Pozicija uspesno postavljana', organization: result });
    } catch (error) {
        console.error('Error za dodavanje pozicije:', error);
        res.status(500).json({ message: 'Error se desio kada se dodavala pozicija.', error });
    }
}

//Svi pdaci sem tipa organizacije su updejtovani
const updateOrganizacije = async (req, res) => {
    const { id, name, tip, pib, mb, racun } = req.body;
    console.log("updateOrganizacije data: ",req.body)

    if (!id, !name || !tip || !pib || !mb || !racun) {  //ovde stao
        return res.status(400).json({ message: 'Sva polja su potrebna.' });
    }

    try {

        const organization = await Organizacije.findById(id);

        if (!organization) {
            return res.status(404).json({ message: 'Organizacija nije nađena.' });
        }

        organization.name = name
        organization.racun = racun
        organization.mb = mb
        organization.pib = pib

        const result = await organization.save();

        res.status(200).json({ message: 'Organizacija uspešno updejtovana', organization: result });
    } catch (error) {
        console.error('Greška prilikom ažuriranja organizacije:', error);
        res.status(500).json({ message: 'Došlo je do greške prilikom ažuriranja.', error });
    }
    
    // const { id, jmbg, fixUgovoren, kafa, zaRacDnev, netopalataIzUgovora, pozicija, tipUgovora, sektor } = req.body;
    // console.log("updateOrganizacije data: ",req.body)

    // if (!organizacijaName || !jmbg || !pozicija || !sektor || !netopalataIzUgovora || !fixUgovoren || !tipUgovora || !kafa || !zaRacDnev) {
    //     return res.status(400).json({ message: 'Sva polja su potrebna.' });
    // }

    // try {

    //     const organization = await Organizacije.findOne({ name: organizacijaName });

    //     if (!organization) {
    //         return res.status(404).json({ message: 'Organizacija nije nađena.' });
    //     }

    //     const employeeToUpdate = organization.zaposleni.find(emp => emp.jmbg === jmbg);

    //     if (!employeeToUpdate) {
    //         return res.status(404).json({ message: 'Zaposleni nije nađen.' });
    //     }

    //     employeeToUpdate.pozicija.pozcicijaId = pozicija.pozcicijaId;
    //     employeeToUpdate.pozicija.pozcicijaName = pozicija.pozcicijaName;

    //     employeeToUpdate.sektor.sektorId = sektor.sektorId;
    //     employeeToUpdate.sektor.sektorName = sektor.sektorName;

    //     employeeToUpdate.fixUgovoren.fixUgovorenId = fixUgovoren.fixUgovorenId;
    //     employeeToUpdate.fixUgovoren.fixUgovorenName = fixUgovoren.fixUgovorenName;

    //     employeeToUpdate.netopalataIzUgovora = netopalataIzUgovora;
    //     employeeToUpdate.tipUgovora = tipUgovora;
    //     employeeToUpdate.kafa = kafa;
    //     employeeToUpdate.zaRacDnev = zaRacDnev;

    //     // employeeToUpdate.pozicija = pozicija;
    //     // employeeToUpdate.sektor = sektor;
    //     // employeeToUpdate.netopalataIzUgovora = netopalataIzUgovora;
    //     // employeeToUpdate.fixUgovoren = fixUgovoren;
    //     // employeeToUpdate.tipUgovora = tipUgovora;
    //     // employeeToUpdate.kafa = kafa;
    //     // employeeToUpdate.zaRacDnev = zaRacDnev;

    //     const result = await organization.save();

    //     res.status(200).json({ message: 'Pozicija uspešno ažurirana', organization: result });
    // } catch (error) {
    //     console.error('Greška prilikom ažuriranja pozicije:', error);
    //     res.status(500).json({ message: 'Došlo je do greške prilikom ažuriranja pozicije.', error });
    // }
}

//Radi
const updatePozicijaOrganizaciji = async (req, res) => {
    const { organizacijaName, jmbg, fixUgovoren, kafa, zaRacDnev, netopalataIzUgovora, pozicija, tipUgovora, sektor } = req.body;
    console.log("updatePozicijaOrganizaciji data: ",req.body)

    if (!organizacijaName || !jmbg || !pozicija || !sektor || !netopalataIzUgovora || !fixUgovoren || !tipUgovora || !kafa || !zaRacDnev) {
        return res.status(400).json({ message: 'Sva polja su potrebna.' });
    }

    try {

        const organization = await Organizacije.findOne({ name: organizacijaName });

        if (!organization) {
            return res.status(404).json({ message: 'Organizacija nije nađena.' });
        }

        console.log(organization);

        const employeeToUpdate = organization.zaposleni.find(emp => emp.jmbg === jmbg);

        if (!employeeToUpdate) {
            return res.status(404).json({ message: 'Zaposleni nije nađen.' });
        }

        employeeToUpdate.pozicija.pozcicijaId = pozicija.pozcicijaId;
        employeeToUpdate.pozicija.pozcicijaName = pozicija.pozcicijaName;
        employeeToUpdate.pozicija.dnevnica = pozicija.dnevnica;

        employeeToUpdate.sektor.sektorId = sektor.sektorId;
        employeeToUpdate.sektor.sektorName = sektor.sektorName;

        employeeToUpdate.tipUgovora.tipUgovoraId = tipUgovora.tipUgovoraId;
        employeeToUpdate.tipUgovora.tipUgovoraName = tipUgovora.tipUgovoraName;

        employeeToUpdate.netopalataIzUgovora = netopalataIzUgovora;
        employeeToUpdate.fixUgovoren = fixUgovoren;
        employeeToUpdate.kafa = kafa;
        employeeToUpdate.zaRacDnev = zaRacDnev;

        const result = await organization.save();

        res.status(200).json({ message: 'Pozicija uspešno ažurirana', organization: result });
    } catch (error) {
        console.error('Greška prilikom ažuriranja pozicije:', error);
        res.status(500).json({ message: 'Došlo je do greške prilikom ažuriranja pozicije.', error });
    }
}
// const updatePozicijaOrganizaciji = async (req, res) => {
//     const { organizacijaName, jmbg, fixUgovoren, kafa, zaRacDnev, netopalataIzUgovora, pozicija, tipUgovora, sektor } = req.body;
//     console.log("updatePozicijaOrganizaciji data: ",req.body)

//     try {
//         const filter = { name: organizacijaName, "zaposleni.jmbg": jmbg };
//         const updateDoc = {
//             $set: {
//                 "zaposleni.$[elem].pozicija": pozicija,
//                 "zaposleni.$[elem].sektor": sektor,
//                 "zaposleni.$[elem].netopalataIzUgovora": netopalataIzUgovora,
//                 "zaposleni.$[elem].fixUgovoren": fixUgovoren,
//                 "zaposleni.$[elem].tipUgovora": tipUgovora,
//                 "zaposleni.$[elem].kafa": kafa,
//                 "zaposleni.$[elem].zaRacDnev": zaRacDnev
//             }
//         };
//         const arrayFilters = [{ "elem.jmbg": jmbg }];

//         const result = await Organizacije.updateOne(filter, updateDoc, { arrayFilters });
//         if (result.modifiedCount > 0) {
//             res.status(200).json({ message: "Employee fields updated successfully." });
//         } else {
//             res.status(404).json({ message: "No employee found with the given JMBG in the specified organization." });
//         }
//     } catch (error) {
//         console.error("Error updating employee fields:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// };

//Updajtuje poziciju u organizaciji ali malo drugacije - ispisi - promeni
// const updatePozicijaZaposlenogUOrganizaciji = async (req, res) => {
//     const { idOrg, jmbg, fixUgovoren,kafa,zaRacDnev,netopalataIzUgovora,pozicija,tipUgovora,sektor } = req.body;
//     console.log("updatePozicijaZaposlenogUOrganizaciji data: ",req.body)

//     if (!idOrg || !jmbg || !pozicija || !sektor || !netopalataIzUgovora || !fixUgovoren || !tipUgovora || !kafa || !zaRacDnev) {
//         return res.status(400).json({ message: 'Sva polja su potrebna.' });
//     }

//     try {

//         const organization = await Organizacije.findOne({ _id: idOrg });

//         if (!organization) {
//             return res.status(404).json({ message: 'Organizacija nije nađena.' });
//         }

//         const employeeToUpdate = organization.zaposleni.find(emp => emp.jmbg === jmbg);

//         if (!employeeToUpdate) {
//             return res.status(404).json({ message: 'Zaposleni nije nađen.' });
//         }

//         employeeToUpdate.pozicija.pozcicijaId = pozicija.pozcicijaId;
//         employeeToUpdate.pozicija.pozcicijaName = pozicija.pozcicijaName;

//         employeeToUpdate.sektor.sektorId = sektor.sektorId;
//         employeeToUpdate.sektor.sektorName = sektor.sektorName;


//         employeeToUpdate.tipUgovora.tipUgovoraId = tipUgovora.tipUgovoraId;
//         employeeToUpdate.tipUgovora.tipUgovoraName = tipUgovora.tipUgovoraName;

//         employeeToUpdate.netopalataIzUgovora = netopalataIzUgovora;
//         employeeToUpdate.fixUgovoren = fixUgovoren;
//         employeeToUpdate.kafa = kafa;
//         employeeToUpdate.zaRacDnev = zaRacDnev;

//         const result = await organization.save();

//         res.status(200).json({ message: 'Pozicija uspešno ažurirana', organization: result });
//     } catch (error) {
//         console.error('Greška prilikom ažuriranja pozicije:', error);
//         res.status(500).json({ message: 'Došlo je do greške prilikom ažuriranja pozicije.', error });
//     }
// }

//OVAJ RADIII
const updatePozicijaZaposlenogUOrganizaciji = async (req, res) => {
    const { idOrg, jmbg, fixUgovoren, kafa, zaRacDnev, netopalataIzUgovora, pozicija, tipUgovora, sektor } = req.body;

    console.log('Request Body:', req.body);

    try {

        const organization = await Organizacije.findById(idOrg);

        if (!organization) {
            return res.status(404).json({ message: 'Organizacija nije nađena.' });
        }

        const employeeToUpdate = organization.zaposleni.find(emp => emp.jmbg === jmbg);

        if (!employeeToUpdate) {
            return res.status(404).json({ message: 'Zaposleni nije nađen.' });
        }

 
        employeeToUpdate.pozicija.pozcicijaId = pozicija.pozcicijaId;
        employeeToUpdate.pozicija.pozcicijaName = pozicija.pozcicijaName;
        employeeToUpdate.pozicija.dnevnica = pozicija.dnevnica;

        employeeToUpdate.sektor.sektorId = sektor.sektorId;
        employeeToUpdate.sektor.sektorName = sektor.sektorName;

        employeeToUpdate.tipUgovora.tipUgovoraId = tipUgovora.tipUgovoraId;
        employeeToUpdate.tipUgovora.tipUgovoraName = tipUgovora.tipUgovoraName;

        employeeToUpdate.netopalataIzUgovora = netopalataIzUgovora;
        employeeToUpdate.fixUgovoren = fixUgovoren;
        employeeToUpdate.kafa = kafa;
        employeeToUpdate.zaRacDnev = zaRacDnev;

        organization.markModified('zaposleni');

        const result = await organization.save();

        res.status(200).json({ message: 'Pozicija uspešno ažurirana', organization: result });
    } catch (error) {
        console.error('Greška prilikom ažuriranja pozicije:', error);
        res.status(500).json({ message: 'Došlo je do greške prilikom ažuriranja pozicije.', error });
    }
};



//RADI - Brise jedu celu organizaciju
const deleteOrganizacije = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID organizacije potreban' })
    }

    // Does the user exist to delete?
    const organizacija = await Organizacije.findById(id).exec()

    if (!organizacija) {
        return res.status(400).json({ message: 'Organizacija nije nadjena' })
    }

    if(organizacija.zaposleni == 0){
        const result = await organizacija.deleteOne()
        const reply = `Organizacija ${result.name} sa ID ${result._id} izbrisana`
        return res.json(reply)
    }else{
        return res.status(400).json({ message: 'Nije moguće izbrisati organizaciju, poseduje zaposlene' })
    }
}

//Brise jednu poziciju iz organizacije id = pozicija zaposlenog , name = organizacija ime - promeni
const deletePozicijaUOrganizaciji = async (req, res) => {
    const { id, name } = req.body
    // console.log("Request data:", id, name)

    if (!name || !id) {
        return res.status(400).json({ message: 'Ime i id organizacije potrebni.' });
    }

    try {
        const result = await Organizacije.findOneAndUpdate(
            { name: name },
            { $pull: { zaposleni: { _id: mongoose.Types.ObjectId(id) } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Organizacija nije nadjena kao ni pozicija zaposlenog u organizaciji.' });
        }

        // console.log(result)
        res.status(200).json({ message: 'Uspesno izbrisana pozicija', organization: result });
    } catch (error) {
        console.error('Error brisanje pozicije:', error);
        res.status(500).json({ message: 'Error se desio kada se brisala pozicija.', error });
    }
};

//NAPISI STA JE 
const deletePozicijaZaposlenogUOrganizaciji = async (req, res) => {
    const { idOrg, idZap } = req.body
    console.log("Request data:", idOrg, idZap)

    if (!idOrg || !idZap) {
        return res.status(400).json({ message: 'Id pozicije i id organizacije potrebni.' });
    }

    try {
        const result = await Organizacije.findOneAndUpdate(
            { _id: idOrg },
            { $pull: { zaposleni: { _id: mongoose.Types.ObjectId(idZap) } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Organizacija nije nadjena kao ni pozicija zaposlenog u organizaciji.' });
        }

        // console.log(result)
        res.status(200).json({ message: 'Uspesno izbrisana pozicija', organization: result });
    } catch (error) {
        console.error('Error brisanje pozicije:', error);
        res.status(500).json({ message: 'Error se desio kada se brisala pozicija.', error });
    }
};

module.exports = {
    getAllOrganizacije,
    getAllOrganizacijeNames,
    getAllOrganizacijeSaPozicijama,
    createNewOrganizacije,
    createNewPozicijaOrganizaciji,
    updateOrganizacije,
    updatePozicijaOrganizaciji,
    updatePozicijaZaposlenogUOrganizaciji,
    deleteOrganizacije,
    deletePozicijaUOrganizaciji,
    deletePozicijaZaposlenogUOrganizaciji
}