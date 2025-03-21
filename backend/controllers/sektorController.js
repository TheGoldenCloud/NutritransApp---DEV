const Sektor = require("../models/Sektor");
const Organizacije = require("../models/Ogranizacije");

//MJODIFIKUJ
const getSektor = async (req, res) => {
  const sektor = await Sektor.find();

  // If no users
  if (!sektor?.length) {
    return res.status(400).json({ message: "Nisu nadjeni sektori" });
  }

  res.json(sektor);
};

//Saljemo sve objeket iz kolekcije ali samo sa _id i name
const getAllSektorNames = async (req, res) => {
  try {
    const sektor = await Sektor.find(
      { name: { $exists: true } },
      { name: 1 }
    ).exec();

    res.json(sektor);
    // console.log(sektor);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// RADI
const createNewSektor = async (req, res) => {
  const { name } = req.body;
  // console.log(name);

  // Confirm data
  if (!name) {
    return res.status(400).json({ message: "Sva poslja su potrebna" });
  }

  // Check for duplicate username
  const duplicate = await Sektor.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(400).json({ message: "Sektor već postoji" });
  }

  const sektor = await Sektor.create({ name });

  if (sektor) {
    //created
    res.status(201).json({ message: `Novi sektor ${name} napravljen` });
  } else {
    res.status(400).json({ message: "Nisu validni podaci" });
  }
};

//Updejtuje kolekciju i uslovno rekurzivno u organizacijama
const updateSektor = async (req, res) => {
  const { id, name } = req.body;

  try {
    const sektorData = await Sektor.findById(id).exec();

    sektorData.name = name;

    const organizacije = await Organizacije.find().exec();

    for (let i = 0; i < organizacije.length; i++) {
      const organizacija = organizacije[i];

      organizacija.zaposleni.forEach((zaposlen) => {
        if (zaposlen.sektor && zaposlen.sektor.sektorId === id) {
          zaposlen.sektor.sektorName = name;
        }
      });

      await organizacija.save();
      await sektorData.save();
    }

    res
      .status(200)
      .json({ message: "sektorName updated successfully in all organizacije" });
  } catch (error) {
    console.error("Error updating sektorName in organizacije:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// RADI
const deleteSektor = async (req, res) => {
  const { id } = req.body;
  // console.log(id);

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Tip sektor ID potreban" });
  }

  // Does the user exist to delete?
  const sektor = await Sektor.findById(id).exec();

  if (!sektor) {
    return res.status(400).json({ message: "Tip sektora nije nadjen" });
  }

  const result = await sektor.deleteOne();

  const reply = `Tip sektor ${result.name} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getSektor,
  getAllSektorNames,
  createNewSektor,
  updateSektor,
  deleteSektor,
};
