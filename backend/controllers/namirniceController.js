const Namirnice = require("../models/Namirnice");
const Ishrana = require("../models/Ishrana");
const Ciljevi = require("../models/Ciljevi");

// const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// PROVERI
// const getAllNamirnices = async (req, res) => {
//   try {
//     const Namirnices = await Namirnice.find().lean();

//     if (!Namirnices?.length) {
//       return res.status(400).json({ message: "Nisu nadjene namirnice" });
//     }

//     const Ishrane = await Ishrana.find().lean();

//     const namirniceSaIshranama = Namirnices.map((namirnica) => {

//       const ishraneZaNamirnicu = Ishrane.filter((ishrana) =>
//         ishrana.namirnice.some(
//           (namirnicaId) => namirnicaId.toString() === namirnica._id.toString()
//         )
//       ).map((ishrana) => ishrana.naziv);

//       return {
//         ...namirnica,
//         ishrane: ishraneZaNamirnicu,
//       };
//     });

//     res.json(namirniceSaIshranama);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Greška prilikom dobijanja namirnica." });
//   }
// };
const getAllNamirnices = async (req, res) => {
  try {
    // Prvo dobijamo sve namirnice
    const Namirnices = await Namirnice.find().lean();

    if (!Namirnices?.length) {
      return res.status(400).json({ message: "Nisu nadjene namirnice" });
    }

    // Dobijamo sve ishrane
    const Ishrane = await Ishrana.find().lean();

    // Dobijamo sve specifične ciljeve
    const specCiljevi = await Ciljevi.find({ tip: "specCilj" }).lean();

    // Mapiranje namirnica sa ishranama
    const namirniceSaIshranama = Namirnices.map((namirnica) => {
      const ishraneZaNamirnicu = Ishrane.filter((ishrana) =>
        ishrana.namirnice.some(
          (namirnicaId) => namirnicaId.toString() === namirnica._id.toString()
        )
      ).map((ishrana) => ishrana.naziv);

      // Pronalazimo namirnice iz specifičnih ciljeva
      const namirniceIzCiljeva = specCiljevi
        .filter(cilj =>
          cilj.namirnice.some(
            (namirnicaId) => namirnicaId.toString() === namirnica._id.toString()
          )
        )
        .map(cilj => cilj.naziv);

      return {
        ...namirnica,
        ishrane: ishraneZaNamirnicu,
        ciljevi: namirniceIzCiljeva, // Dodajemo ciljeve povezane sa namirnicom
      };
    });

    res.json(namirniceSaIshranama);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška prilikom dobijanja namirnica." });
  }
};


// OBICNO UZIMANJE SVIH NAMIRNICA
// const getAllNamirnices = async (req, res) => {

//   const Namirnices = await Namirnice.find().select().lean();

//   if (!Namirnices?.length) {
//     return res.status(400).json({ message: "Nisu nadjene namirnice" });
//   }

//   res.json(Namirnices);
// };

// const getOneNamirnice = async (req, res) => {

//   const { id } = req.params;

//   const Namirnice = await Namirnice.findById(id).exec();

//   if (!Namirnice) {
//     return res.status(400).json({ message: "Nije nadjen orisnik" });
//   }

//   res.json(Namirnice);

// };

//Saljemo sve objeket iz kolekcije ali samo sa _id i name getAllNamirniceIshrane
const getAllNamirniceNames = async (req, res) => {
  try {
    const zaposleni = await Namirnice.find(
      { name: { $exists: true } },
      { name: 1, jmbg: 1 }
    ).exec();

    console.log(zaposleni);
    res.json(zaposleni);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllNamirniceIshrane = async (req, res) => {

};

//Bez dodavanja referenci namirnice zadatoj ishrani
// const createNewNamirnice = async (req, res) => {
//     const { grupa, podtip, naziv, gluten, alergen, laktoza, odabraneIshrane } = req.body;
//     console.log("Namirnice add: ", req.body);
  
//     if (!grupa || !podtip || !naziv || gluten === undefined || alergen === undefined || laktoza === undefined) {
//       return res.status(400).json({ message: "Sva poslja su potrebna" });
//     }
  
//     // Check for duplicate username
//     const duplicate = await Namirnice.findOne({ naziv }).lean().exec();
  
//     if (duplicate) {
//       return res.status(400).json({ message: "Namirnica već postoji" });
//     }
  
//     const namirnica = await Namirnice.create({ naziv, grupa, podtip, alergen, gluten, laktoza });
  
//     if (namirnica) {
//       //created
//       res.status(201).json({ message: `Nova namirnica ${naziv} napravljena` });
//     } else {
//       res.status(400).json({ message: "Nisu validni podaci" });
//     }
// };

//Sa dodajom referenci
// const createNewNamirnice = async (req, res) => {
//     const { grupa, podtip, naziv, gluten, alergen, laktoza, odabraneIshrane, odabraniClijevi } = req.body;
//     console.log("Namirnice add: ", req.body);

//     if (!grupa || !podtip || !naziv || gluten === undefined || alergen === undefined || laktoza === undefined) {
//         return res.status(400).json({ message: "Sva polja su potrebna" });
//     }

//     // Check for duplicate namirnica
//     const duplicate = await Namirnice.findOne({ naziv }).lean().exec();

//     if (duplicate) {
//         return res.status(400).json({ message: "Namirnica već postoji" });
//     }

//     // Create new namirnica
//     const namirnica = await Namirnice.create({ naziv, grupa, podtip, alergen, gluten, laktoza });

//     if (namirnica) {
//         // If the namirnica was created, update the related Ishrana objects
//         if (odabraneIshrane && odabraneIshrane.length > 0) {
//             await Ishrana.updateMany(
//                 { _id: { $in: odabraneIshrane } }, // Find Ishrana by IDs in odabraneIshrane
//                 { $addToSet: { namirnice: namirnica._id } } // Add the new namirnica ID to the namirnice array
//             );
//         }

//         // Respond with success message
//         res.status(201).json({ message: `Nova namirnica ${naziv} napravljena` });
//     } else {
//         res.status(400).json({ message: "Nisu validni podaci" });
//     }
// };

const createNewNamirnice = async (req, res) => { 
  const { grupa, podtip, naziv, gluten, alergen, laktoza, odabraneIshrane, odabraniClijevi } = req.body;
  // console.log("Namirnice add: ", req.body);

  if (!grupa || !podtip || !naziv || gluten === undefined || alergen === undefined || laktoza === undefined) {
      return res.status(400).json({ message: "Sva polja su potrebna" });
  }

  // Provera za duplikate namirnica
  const duplicate = await Namirnice.findOne({ naziv }).lean().exec();

  if (duplicate) {
      return res.status(400).json({ message: "Namirnica već postoji" });
  }

  // Kreiranje nove namirnice
  const namirnica = await Namirnice.create({ naziv, grupa, podtip, alergen, gluten, laktoza });

  if (namirnica) {
      // Ako je namirnica kreirana, ažuriramo povezane Ishrana objekte
      if (odabraneIshrane && odabraneIshrane.length > 0) {
          await Ishrana.updateMany(
              { _id: { $in: odabraneIshrane } },
              { $addToSet: { namirnice: namirnica._id } }
          );
      }

      // Ažuriranje povezanih ciljeva (Ciljevi)
      if (odabraniClijevi && odabraniClijevi.length > 0) {
          await Ciljevi.updateMany(
              { _id: { $in: odabraniClijevi } },
              { $addToSet: { namirnice: namirnica._id } } // Pretpostavljamo da Ciljevi takođe imaju polje namirnice
          );
      }

      // Odgovor sa porukom o uspehu
      res.status(201).json({ message: `Nova namirnica ${naziv} napravljena` });
  } else {
      res.status(400).json({ message: "Nisu validni podaci" });
  }
};


//Odardi here
// const updateNamirnice = async (req, res) => {
//   const { IdNam, grupa, podtip, naziv, gluten, alergen, laktoza, odabraneIshrane, odabraniClijevi } = req.body;
//   // console.log("Namirnice update: ", req.body);

//   // Validate input fields
//   if (!grupa || !podtip || !naziv || gluten === undefined || alergen === undefined || laktoza === undefined) {
//       return res.status(400).json({ message: "Sva polja su potrebna" });
//   }

//   // Find the existing namirnica
//   const namirnica = await Namirnice.findById(IdNam).lean().exec();

//   if (!namirnica) {
//       return res.status(404).json({ message: "Namirnica nije pronađena" });
//   }

//   // Update properties
//   const updatedNamirnica = await Namirnice.findByIdAndUpdate(
//       IdNam, 
//       { grupa, podtip, naziv, gluten, alergen, laktoza },
//       { new: true } // Return the updated document
//   );

//   // Update related Ishrana objects
//   const existingIshrane = await Ishrana.find({ namirnice: IdNam }).lean().exec();

//   const existingIshraneIds = existingIshrane.map(ish => ish._id.toString());

//   // Determine which Ishrana should be updated
//   const newIshraneIds = odabraneIshrane || [];
  
//   // Add the namirnica to Ishrana that are in newIshraneIds but not in existingIshraneIds
//   const toAdd = newIshraneIds.filter(id => !existingIshraneIds.includes(id));
//   if (toAdd.length > 0) {
//       await Ishrana.updateMany(
//           { _id: { $in: toAdd } },
//           { $addToSet: { namirnice: updatedNamirnica._id } } // Add the updated namirnica ID
//       );
//   }

//   // Remove the namirnica from Ishrana that are in existingIshraneIds but not in newIshraneIds
//   const toRemove = existingIshraneIds.filter(id => !newIshraneIds.includes(id));
//   if (toRemove.length > 0) {
//       await Ishrana.updateMany(
//           { _id: { $in: toRemove } },
//           { $pull: { namirnice: IdNam } } // Remove the old namirnica ID
//       );
//   }

//   // Respond with success message
//   res.json({ message: `${updatedNamirnica.naziv} ažurirana` });
// };

const updateNamirnice = async (req, res) => {
  const { IdNam, grupa, podtip, naziv, gluten, alergen, laktoza, odabraneIshrane, odabraniClijevi } = req.body;
  console.log("Namirnice update: ", req.body);

  // Validacija ulaznih polja
  if (!grupa || !podtip || !naziv || gluten === undefined || alergen === undefined || laktoza === undefined) {
      return res.status(400).json({ message: "Sva polja su potrebna" });
  }

  // Pronaći postojeću namirnicu
  const namirnica = await Namirnice.findById(IdNam).lean().exec();

  if (!namirnica) {
      return res.status(404).json({ message: "Namirnica nije pronađena" });
  }

  // Ažurirati svojstva
  const updatedNamirnica = await Namirnice.findByIdAndUpdate(
      IdNam, 
      { grupa, podtip, naziv, gluten, alergen, laktoza },
      { new: true } // Vratiti ažurirani dokument
  );

  // Ažurirati povezane Ishrana objekte
  const existingIshrane = await Ishrana.find({ namirnice: IdNam }).lean().exec();
  const existingIshraneIds = existingIshrane.map(ish => ish._id.toString());

  const newIshraneIds = odabraneIshrane || [];

  // Dodati namirnicu u Ishrana koje su u newIshraneIds, ali nisu u existingIshraneIds
  const toAdd = newIshraneIds.filter(id => !existingIshraneIds.includes(id));
  if (toAdd.length > 0) {
      await Ishrana.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { namirnice: updatedNamirnica._id } } // Dodati ažurirani ID namirnice
      );
  }

  // Ukloniti namirnicu iz Ishrana koje su u existingIshraneIds, ali nisu u newIshraneIds
  const toRemove = existingIshraneIds.filter(id => !newIshraneIds.includes(id));
  if (toRemove.length > 0) {
      await Ishrana.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { namirnice: IdNam } } // Ukloniti stari ID namirnice
      );
  }

  // Ažurirati povezane ciljeve (Ciljevi)
  const existingCiljevi = await Ciljevi.find({ namirnice: IdNam }).lean().exec();
  const existingCiljeviIds = existingCiljevi.map(cilj => cilj._id.toString());

  const newCiljeviIds = odabraniClijevi || [];

  // Dodati namirnicu u Ciljevi koje su u newCiljeviIds, ali nisu u existingCiljeviIds
  const toAddCiljevi = newCiljeviIds.filter(id => !existingCiljeviIds.includes(id));
  if (toAddCiljevi.length > 0) {
      await Ciljevi.updateMany(
          { _id: { $in: toAddCiljevi } },
          { $addToSet: { namirnice: updatedNamirnica._id } } // Dodati ažurirani ID namirnice
      );
  }

  // Ukloniti namirnicu iz Ciljevi koje su u existingCiljeviIds, ali nisu u newCiljeviIds
  const toRemoveCiljevi = existingCiljeviIds.filter(id => !newCiljeviIds.includes(id));
  if (toRemoveCiljevi.length > 0) {
      await Ciljevi.updateMany(
          { _id: { $in: toRemoveCiljevi } },
          { $pull: { namirnice: IdNam } } // Ukloniti stari ID namirnice
      );
  }

  // Odgovor sa porukom o uspehu
  res.json({ message: `${updatedNamirnica.naziv} ažurirana` });
};



// @desc Delete a Namirnice
// @route DELETE /Namirnices
// @access Private
// RADI
const deleteNamirnice = async (req, res) => {
  const { id } = req.body;
  console.log('id', id)

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Potreban ID namirnice" });
  }

  const namirnica = await Namirnice.findById(id).exec();

  if (!namirnica) {
    return res.status(400).json({ message: "Namirnica nije nadjena" });
  }

  const result = await namirnica.deleteOne();

  const reply = `Namirnica ${result.naziv} izbrisana`;

  res.json(reply);
};

module.exports = {
  getAllNamirnices,
  getAllNamirniceNames,
  getAllNamirniceIshrane,
//   getOneNamirnice,
  createNewNamirnice,
  updateNamirnice,
  deleteNamirnice,
};
