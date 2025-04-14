const Kod = require("../models/Kod");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// RADI
// const getAllKods = async (req, res) => {
//   const kods = await Kod.find();

//   if (!kods?.length) {
//     return res.status(400).json({ message: "Nisu nadjeni kodovi" });
//   }

//   res.json(kods);
// };
const getAllKods = async (req, res) => {
  try {
    const kods = await Kod.find();

    if (!kods?.length) {
      return res.status(400).json({ message: "Nisu nadjeni kodovi" });
    }

    const kodsWithUsers = await Promise.all(
      kods.map(async (kod) => {
        const korisnici = await User.find({ _id: { $in: kod.idUser } }).select(
          "name lastName mail"
        );

        return {
          ...kod.toObject(),
          korisnici,
        };
      })
    );

    res.json(kodsWithUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

//Sa smanjenim podacima za slanje i dodat paket
//Bitno je da ne vuce iz kesha u reduxu...
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find()
//       .select("name lastName mail pol komentar roles")
//       .lean();

//     if (!users?.length) {
//       return res.status(400).json({ message: "Nisu nadjeni korisnici" });
//     }

//     const usersWithPackages = await Promise.all(users.map(async (user) => {
//       const activePackage = await Paket.findOne({
//         idUser: user._id,
//         datum_isteka: { $gt: new Date() },
//         status: "Aktivan"
//       })
//       .sort({ datum_kreiranja: -1 })
//       .select("naziv_paketa datum_placanja");

//       return {
//         _id: user._id, //_id: user._id,
//         name: user.name,
//         lastName: user.lastName,
//         mail: user.mail,
//         pol: user.pol,
//         komentar: user.komentar,
//         lastActivePackage: activePackage
//       };
//     }));

//     res.json(usersWithPackages);
//   } catch (err) {
//     res.status(500).json({ message: "Došlo je do greške", error: err.message });
//   }
// };

//- PROVERI FUNKCIJU
const getOneKod = async (req, res) => {
  const { id } = req.params;

  const kod = await Kod.findById(id).exec();

  if (!kod) {
    return res.status(400).json({ message: "Nije nadjen kod" });
  }

  res.json(kod);
};

//Provera koda - PROVERI FUNKCIJU
// const proveriKod = async (req, res) => {
//   const { naziv, klijentId } = req.body;

//   try {
//     const kod = await Kod.findOne({ naziv });

//     if (!kod) {
//       return res
//         .status(404)
//         .json({ message: "Kod sa tim nazivom ne postoji." });
//     }

//     // if (kod.iskoriscen) {
//     //   return res.status(400).json({ message: "Kod je već iskorišćen." });
//     // }

//     // if (!kod.idUser) {
//     //   kod.idUser = klijentId;
//     // }
//     kod.idUser.push(klijentId);

//     // kod.iskoriscen = true;

//     await kod.save();

//     res.status(200).json({
//       message: "Kod je ispravan!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Došlo je do greške prilikom ažuriranja koda.",
//       error: error.message,
//     });
//   }
// };

// const proveriKod = async (req, res) => {
//   const { naziv, klijentId } = req.body;

//   try {
//     const kod = await Kod.findOne({ naziv });

//     if (!kod) {
//       return res
//         .status(404)
//         .json({ message: "Kod sa tim nazivom ne postoji." });
//     }

//     if (kod.idUser.includes(klijentId)) {
//       return res.status(400).json({
//         message: "Vec ste iskoristili ovaj kod!",
//       });
//     }

//     kod.idUserTreba.push(klijentId);

//     await kod.save();

//     res.status(200).json({
//       message: "Kod je ispravan!",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Došlo je do greške prilikom ažuriranja koda.",
//       error: error.message,
//     });
//   }
// };
const proveriKod = async (req, res) => {
  const { naziv, klijentId } = req.body;

  try {
    const kod = await Kod.findOne({ naziv });

    if (!kod) {
      return res
        .status(404)
        .json({ message: "Kod sa tim nazivom ne postoji." });
    }

    if (kod.idUserTreba.includes(klijentId)) {
      return res.status(200).json({
        message: "Kod je ispravan, uneli ste ga više puta!",
      });
    }

    if (!kod.idUserTreba.includes(klijentId)) {
      kod.idUserTreba.push(klijentId);
    }

    await kod.save();

    res.status(200).json({
      message: "Kod je ispravan!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Došlo je do greške prilikom ažuriranja koda.",
      error: error.message,
    });
  }
};

//Kreira kod ADMIN
const createKod = async (req, res) => {
  console.log(req.body);
  try {
    const { naziv, opis } = req.body;

    if ((!naziv, !opis)) {
      return res.status(400).json({
        message: "Naziv koda je obavezan.",
      });
    }

    const noviKod = new Kod({
      naziv,
      opis,
    });

    await noviKod.save();

    res.status(201).json({
      message: "Kod je uspešno kreiran",
    });
  } catch (error) {
    console.error("Greška prilikom kreiranja koda:", error);
    res.status(500).json({
      message: "Došlo je do greške prilikom kreiranja koda",
      error: error.message,
    });
  }
};

// // RADI
// // const createNewUser = async (req, res) => {
// //     const { name, lastName, jmbg, plata, username, password, roles, status, valuta } = req.body
// //     console.log(req.body);

// // if (!name || !lastName || !jmbg || !plata, !status, !valuta, !Array.isArray(roles)) {
// //     return res.status(400).json({ message: 'Sva poslja su potrebna' })
// // }

// // // Check for duplicate username PROVERI DA LI JE OR ILI AND!
// // const duplicate = await User.findOne({ jmbg }).collation({ locale: 'en', strength: 2 }).lean().exec()

// // if (duplicate) {
// //     return res.status(400).json({ message: 'Zaposleni već postoji' })
// // }

// // const hashedPwd = await bcrypt.hash(password, 10)

// // let userObject = "";
// // // (!Array.isArray(roles) || !roles.length)
// // //     ? { username, "password": hashedPwd }
// // //     : { username, "password": hashedPwd, roles }

// // //
// // if(roles.includes('Klijent')){
// //     userObject = {}
// //     console.log(userObject);
// // }else{
// //     userObject = { name, lastName , username, "password": hashedPwd, jmbg, roles, plata, status, valuta };
// //     console.log(userObject);
// // }

// // const user = await User.create(userObject)

// // if (user) { //created
// //     res.status(201).json({ message: `Novi korisnik ${username} napravljen` })
// // } else {
// //     res.status(400).json({ message: 'Nisu validni podaci' })
// // }
// // }

//Proveri kod - PROVERI FUNKCIJU mislim da radi sad
const updateKod = async (req, res) => {
  const { naziv, idUser } = req.body;

  try {
    const kod = await Kod.findOne({ naziv });

    if (!kod) {
      return res
        .status(404)
        .json({ message: "Kod sa tim nazivom ne postoji." });
    }

    if (kod.iskoriscen) {
      return res.status(400).json({ message: "Kod je već iskorišćen." });
    }

    if (!kod.idUser) {
      kod.idUser = idUser;
    }

    kod.iskoriscen = true;

    await kod.save();

    res.status(200).json({
      message: "Kod je ispravan!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Došlo je do greške prilikom ažuriranja koda.",
      error: error.message,
    });
  }
};

// // @desc Delete a user
// // @route DELETE /users
// // @access Private
// // RADI - Samo brisanje usera
// // const deleteUser = async (req, res) => {
// //   const { id } = req.body;

// //   // Confirm data
// //   if (!id) {
// //     return res.status(400).json({ message: "Korisnik ID potreban" });
// //   }

// //   const user = await User.findById(id).exec();

// //   if (!user) {
// //     return res.status(400).json({ message: "Korinsik nije nadjen" });
// //   }

// //   const result = await user.deleteOne();

// //   const reply = `Username ${result.username} with ID ${result._id} deleted`;

// //   res.json(reply);
// // };

// //Brisanje usera i svih njegovih paketa
const deleteKod = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Kod ID potreban" });
  }

  const user = await Kod.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Kod nije pronađen" });
  }

  const result = await user.deleteOne();

  const reply = `${result.naziv} kod izbrisan`;

  res.json(reply);
};

module.exports = {
  getAllKods,
  getOneKod,
  createKod,
  updateKod, //Je ustevari provera koda
  deleteKod,
  proveriKod,
};
