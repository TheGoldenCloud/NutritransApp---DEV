const User = require("../models/User");
const Organizacije = require("../models/Ogranizacije");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Paket = require("../models/Paket");
const Kod = require("../models/Kod");

// RADI
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "Nisu nadjeni korisnici" });
  }

  res.json(users);
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

// const usersWithPackages = await Promise.all(users.map(async (user) => {
//   const activePackage = await Paket.findOne({
//     idUser: user._id,
//     datum_isteka: { $gt: new Date() },
//     status: "Aktivan"
//   })
//   .sort({ datum_kreiranja: -1 })
//   .select("naziv_paketa datum_placanja");

//   return {
//     _id: user._id, //_id: user._id,
//     name: user.name,
//     lastName: user.lastName,
//     mail: user.mail,
//     pol: user.pol,
//     komentar: user.komentar,
//     lastActivePackage: activePackage
//   };
// }));

//     res.json(usersWithPackages);
//   } catch (err) {
//     res.status(500).json({ message: "Došlo je do greške", error: err.message });
//   }
// };

//Salje usere sa paketom i sa kodom ako ima
const getAllUsersWithUsedCodes = async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "Nisu nadjeni korisnici" });
  }

  const usersWithPackages = await Promise.all(
    users.map(async (user) => {
      const activePackage = await Paket.findOne({
        idUser: user._id,
        datum_isteka: { $gt: new Date() },
        status: "Aktivan",
      })
        .sort({ datum_kreiranja: -1 })
        .select("naziv_paketa datum_placanja tip broj.full ");

      const usedCodes = await Kod.find({
        idUser: { $in: [user._id.toString()] },
      });

      return {
        ...user,
        lastActivePackage: activePackage,
        usedCodes, //
      };
    })
  );

  res.json(usersWithPackages);
};

const getOneUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Nije nadjen orisnik" });
  }

  res.json(user);
};

//Saljemo sve objeket iz kolekcije ali samo sa _id i name
const getAllUserNames = async (req, res) => {
  try {
    const zaposleni = await User.find(
      { name: { $exists: true } },
      { name: 1, jmbg: 1 }
    ).exec();

    // console.log(zaposleni);
    res.json(zaposleni);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: error.message });
  }
};

//Preko registra kreiramo acc
const createNewUser = async (req, res) => {
  const {
    name,
    lastName,
    username,
    password,
    jmbg,
    roles,
    plata,
    status,
    valuta,
    pozicijeUsera,
  } = req.body;

  try {
    const newUser = new User({
      name,
      lastName,
      username,
      password,
      jmbg,
      roles,
      plata,
      status,
      valuta,
    });

    const savedUser = await newUser.save();

    const updatePromises = Object.entries(pozicijeUsera).map(
      ([key, pozicija]) => {
        const updatedPozicija = {
          jmbg,
          fixUgovoren: pozicija.fixUgovoren,
          kafa: pozicija.kafa,
          zaRacDnev: pozicija.zaRacDnev,
          netopalataIzUgovora: pozicija.netopalataIzUgovora,
          //Dodle podaci
          pozicija: pozicija.pozicija,

          tipUgovora: pozicija.tipUgovora,

          sektor: pozicija.sektor,
        };

        // Update the organization in the database
        return Organizacije.updateOne(
          { _id: key },
          { $push: { zaposleni: updatedPozicija } }
        ).exec();
      }
    );

    await Promise.all(updatePromises);

    res.status(201).json({
      message: "User and organizations created and updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Creating user and updating organizations failed",
      error,
    });
  }
};

// RADI
// const createNewUser = async (req, res) => {
//     const { name, lastName, jmbg, plata, username, password, roles, status, valuta } = req.body
//     console.log(req.body);

// if (!name || !lastName || !jmbg || !plata, !status, !valuta, !Array.isArray(roles)) {
//     return res.status(400).json({ message: 'Sva poslja su potrebna' })
// }

// // Check for duplicate username PROVERI DA LI JE OR ILI AND!
// const duplicate = await User.findOne({ jmbg }).collation({ locale: 'en', strength: 2 }).lean().exec()

// if (duplicate) {
//     return res.status(400).json({ message: 'Zaposleni već postoji' })
// }

// const hashedPwd = await bcrypt.hash(password, 10)

// let userObject = "";
// // (!Array.isArray(roles) || !roles.length)
// //     ? { username, "password": hashedPwd }
// //     : { username, "password": hashedPwd, roles }

// //
// if(roles.includes('Klijent')){
//     userObject = {}
//     console.log(userObject);
// }else{
//     userObject = { name, lastName , username, "password": hashedPwd, jmbg, roles, plata, status, valuta };
//     console.log(userObject);
// }

// const user = await User.create(userObject)

// if (user) { //created
//     res.status(201).json({ message: `Novi korisnik ${username} napravljen` })
// } else {
//     res.status(400).json({ message: 'Nisu validni podaci' })
// }
// }

//OLD
// const updateUser = async (req, res) => {
//     const { id, username, roles, active, password } = req.body

//     // Confirm data
//     if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
//         return res.status(400).json({ message: 'All fields except password are required' })
//     }

//     // Does the user exist to update?
//     const user = await User.findById(id).exec()

//     if (!user) {
//         return res.status(400).json({ message: 'User not found' })
//     }

//     // Check for duplicate
//     const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

//     // Allow updates to the original user
//     if (duplicate && duplicate?._id.toString() !== id) {
//         return res.status(409).json({ message: 'Duplicate username' })
//     }

//     user.username = username
//     user.roles = roles
//     user.active = active

//     if (password) {
//         // Hash password
//         user.password = await bcrypt.hash(password, 10) // salt rounds
//     }

//     const updatedUser = await user.save()

//     res.json({ message: `${updatedUser.username} updated` })
// }

// const updateUser = async (req, res) => {
//   const {
//     id,
//     name_,
//     lastname,
//     mail,
//     datumRodjenja,
//     telefon,
//     pol,
//     visina,
//     tezina,
//     struka,
//     kukova,
//     vrat,
//     bloodType,
//     activityLevel,
//     tdee,
//     primcilj,
//     ukupnaKalVred,
//     motiv,
//     imunitet,
//     komentarCilja,
//     dijagnoza,
//     alergije
//   } = req.body;
//   console.log("Update controller data: ",req.body);

//   const user = await User.findById(id).exec();

//   user.name = name_;
//   user.lastName = lastname;
//   user.mail = mail;
//   user.datumRodjenja = datumRodjenja;
//   user.pol = pol;
//   user.telefon = telefon;
//   user.visina = visina;
//   user.tezina = tezina;
//   user.struk = struka;
//   user.kuk = kukova;
//   user.vrat = vrat;
//   user.krvGru = bloodType;
//   user.actlvl = activityLevel;
//   user.tdee = tdee;
//   user.primcilj = primcilj;
//   user.ukupnaKalVred = ukupnaKalVred;
//   user.motiv = motiv;
//   user.imunitet = imunitet;
//   user.komentarCilja = komentarCilja;
//   user.dijagnoza = dijagnoza;
//   user.alergije = alergije;

//   const updatedUser = await user.save();

//   res.json({ message: `${updatedUser.name} updejtovan` });
// };

//New
const updateUser = async (req, res) => {
  const {
    id,
    mail,
    name,
    lastname,
    datumRodjenja,
    telefon,
    pol,
    visina,
    tezina,
    struka,
    kukova,
    vrat,
    bloodType,
    activityLevel,
    tdee,
    primcilj,
    ukupnaKalVred,
    motiv,
    imunitet,
    komentarCilja,
    alergije,
    specilj,
    godine,
    dijagnoza,
    ucestBr,
    navikeUish,
    // namirnice,
    // namirniceDa,
    // selectedIshranaNaziv,
    voljeneNamirnice,
    neVoljeneNamirnice,
    bmi,
    nivoAkt,
    vrstaFiz,
    pus,
    alk,
    bmrValue,
    iskSaDijetama,
    intolerancija,
    kolicina,
    vrstaAlkohola,
    kolicinaCigara,
    selectedDefTip,
    allergiesEnabled,
    allergyChoice,
    highlighted,
    alergNamir,
  } = req.body;

  // console.log("Podaci podlsti: ", req.body);

  try {
    const user = await User.findById(id).exec();

    user.mail = mail;
    user.alergNamir = alergNamir;
    user.name = name;
    user.lastName = lastname;
    user.datumRodjenja = datumRodjenja;
    user.telefon = telefon;
    user.pol = pol;
    user.visina = visina;
    user.tezina = tezina;
    user.struk = struka;
    user.kuk = kukova;
    user.vrat = vrat;
    user.krvGru = bloodType;
    user.actlvl = activityLevel; //Mozda nije ovaj - Zato ih ja parsujem u broj???
    user.nivoAkt = nivoAkt;
    user.tdee = tdee;
    user.primcilj = primcilj;
    user.ukupnaKalVred = ukupnaKalVred;
    user.motiv = motiv;
    user.imunitet = imunitet;
    user.komCilja = komentarCilja;
    user.dijagnoza = dijagnoza;
    user.alergije = alergije;
    // user.specilj = specilj || user.specilj;
    user.godine = godine;
    user.ucestBr = ucestBr;
    user.navikeUish = navikeUish;
    // user.namirnice = namirnice || user.namirnice;
    // user.namirniceDa = namirniceDa || user.namirniceDa;
    // user.selectedIshranaNaziv = selectedIshranaNaziv || user.selectedIshranaNaziv;
    user.voljeneNamirnice = voljeneNamirnice;
    user.neVoljeneNamirnice = neVoljeneNamirnice;
    user.bmi = bmi;
    user.vrstaFiz = vrstaFiz;
    user.pus = pus;
    user.alk = alk;
    user.kolicina = kolicina;
    user.vrstaAlkohola = vrstaAlkohola;
    user.bmrValue = bmrValue;
    user.iskSaDijetama = iskSaDijetama;
    user.intolerancija = intolerancija;
    user.kolicinaCigara = kolicinaCigara;
    user.selectedDefTip = selectedDefTip;
    user.allergyChoice = allergyChoice;
    user.allergiesEnabled = allergiesEnabled;
    user.wellcomePanel = highlighted;

    // Save the updated user
    const updatedUser = await user.save();

    // Respond with success message
    res.json({
      message: `${updatedUser.name} has been updated successfully`,
      updatedUser,
    }); //Za sad ga stavljam se salje ceo objekat
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

// @desc Delete a user
// @route DELETE /users
// @access Private
// RADI - Samo brisanje usera
// const deleteUser = async (req, res) => {
//   const { id } = req.body;

//   // Confirm data
//   if (!id) {
//     return res.status(400).json({ message: "Korisnik ID potreban" });
//   }

//   const user = await User.findById(id).exec();

//   if (!user) {
//     return res.status(400).json({ message: "Korinsik nije nadjen" });
//   }

//   const result = await user.deleteOne();

//   const reply = `Username ${result.username} with ID ${result._id} deleted`;

//   res.json(reply);
// };

//Brisanje usera i svih njegovih paketa
const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Korisnik ID potreban" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Korisnik nije pronađen" });
  }

  // Obrisi sve pakete koji imaju idUser kao id
  const deletedPackages = await Paket.deleteMany({ idUser: id });

  // Ako su paketi obrisani, možemo nastaviti sa brisanjem korisnika
  const result = await user.deleteOne();

  // Odgovor sa informacijama
  const reply = `${result.username} izbrisan`;

  res.json(reply);
};

module.exports = {
  getAllUsers,
  getAllUserNames,
  getAllUsersWithUsedCodes,
  getOneUser,
  createNewUser,
  updateUser,
  deleteUser,
};
