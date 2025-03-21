const MojDnevnik = require("../models/MojDnevnik");
const User = require("../models/User");

//Bas sve dnevnike
const getAllMojDnevnik = async (req, res) => { 
    try {
        const fizickiParametar = await MojDnevnik.find();

        if (!fizickiParametar?.length) {
            return res.status(400).json({ message: 'Nisu nadjeni dnevnici' });
        }

        res.json(fizickiParametar);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

//Svi dnevnici za jednog korisnika
const getAllMojDnevnikKorisnik = async (req, res) => { 
    const { id } = req.params;

    try {
        const fizickiParametar = await MojDnevnik.find({ idKlijenta: id });

        if (!fizickiParametar?.length) {
            return res.status(400).json({ message: 'Nisu nadjeni dnevnici korisnika' });
        }

        res.json(fizickiParametar);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

//Jedan
const createMojDnevnik = async (req, res) => {
    const {
      id,
      datum,
      age,
      weight,
      height,
      waist,
      neck,
      hip,
      bmi,
      bodyFat,
      fatLossAmount,
      bodyFatCategory,
      bmiBodyFat,
      bodyFatToGain,
      idealBodyFat,
      leanBodyMass,
      bodyFatMass,
      isChecked,
      emojiIcon,
      komentar,
    } = req.body;
    console.log(
      "Dnevnik data",
      datum,
      bodyFat,
      age,
      weight,
      height,
      waist,
      neck,
      hip,
      bmi,
      fatLossAmount,
      bodyFatCategory,
      bmiBodyFat,
      bodyFatToGain,
      idealBodyFat,
      leanBodyMass,
      bodyFatMass,
      isChecked,
      emojiIcon,
      komentar
    );
  
    if (
      (!id,
      !datum,
      !bodyFat,
      !age,
      !weight,
      !height,
      !waist,
      !neck,
      !hip,
      !bmi,
      !fatLossAmount,
      !bodyFatCategory,
      !bmiBodyFat,
      !bodyFatToGain,
      !idealBodyFat,
      !leanBodyMass,
      !bodyFatMass,
      !emojiIcon)
    ) {
      return res.status(400).json({ message: "Sva poslja su potrebna" });
    }
    //Vrati se ovde
    // const duplicate = await MojDnevnik.findOne({ idKlijenta: id, datum }).collation({ locale: 'en', strength: 2 }).lean().exec();
  
    // if (duplicate) {
    //     return res.status(400).json({ message: 'Na ovaj datum ste već kreirali evidenciju!' });
    // }
  
    if (isChecked) {
      const fp = await MojDnevnik.create({
        idKlijenta: id,
        datum,
        god: age,
        tezina: weight,
        visina: height,
        struk: waist,
        vrat: neck,
        kuk: hip,
        bmi,
        smanjenje: fatLossAmount,
        kategorija: bodyFatCategory,
        telesnaMasaBmi: bmiBodyFat,
        povecanje: bodyFatToGain,
        idealneTelesneMasti: idealBodyFat,
        cistaTelesnaMast: leanBodyMass,
        telesnaMasa: bodyFatMass,
        procenatTelesneMase: bodyFat,
        emojiIcon,
        komentar,
      });
      const user = await User.findById(id).exec();
  
      user.visina = height;
      user.tezina = weight;
      user.struk = waist;
      user.vrat = neck;
      user.kuk = hip;
  
      const updatedUser = await user.save();
  
      if (fp && user && updatedUser) {
        res
          .status(201)
          .json({ message: `Uspešno čuvanje u profil i kreiranje evidencije` });
      } else {
        res.status(400).json({ message: "Nisu validni podaci" });
      }
    } else {
      const fp = await MojDnevnik.create({
        idKlijenta: id,
        datum,
        god: age,
        tezina: weight,
        visina: height,
        struk: waist,
        vrat: neck,
        kuk: hip,
        bmi,
        smanjenje: fatLossAmount,
        kategorija: bodyFatCategory,
        telesnaMasaBmi: bmiBodyFat,
        povecanje: bodyFatToGain,
        idealneTelesneMasti: idealBodyFat,
        cistaTelesnaMast: leanBodyMass,
        telesnaMasa: bodyFatMass,
        procenatTelesneMase: bodyFat,
        emojiIcon,
        komentar,
      });
  
      if (fp) {
        res
          .status(201)
          .json({ message: `Uspešno kreirana evidencija na datum ${datum}` });
      } else {
        res.status(400).json({ message: "Nisu validni podaci" });
      }
    }
  };

// const updateMojDnevnik = async (req, res) => {
//     const { id, naziv } = req.body;
//     console.log("Update fizi akt data: ", req.body);

//     if (!id) {
//         return res.status(400).json({ message: 'Fizicka aktivnost ID potreban' });
//     }
  
//     const cilj = await MojDnevnik.findById(id).exec();
    
//     if (!cilj) {
//         return res.status(400).json({ message: 'Fizicka aktivnost nije nadjena' });
//     }
  
//     const oldNaziv = cilj.naziv; // Store the old value
//     cilj.naziv = naziv;
  
//     const updatedCilj = await cilj.save();
  
//     res.json({ message: `Uspešna izmena ${oldNaziv} u ${updatedCilj.naziv}` });
// };


const deleteMojDnevnik = async (req, res) => {
    const { id } = req.body
    // console.log(id);

    if (!id) {
        return res.status(400).json({ message: 'Potreban ID dnevnika' })
    }

    const cilj = await MojDnevnik.findById(id).exec()
    // const cilj = await MojDnevnik.findOne({ _id: idDnevika }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (!cilj) {
        return res.status(400).json({ message: 'Dnevnik nije nadjen' })
    }

    const result = await cilj.deleteOne()

    const reply = `Evidencija izbrisana`

    res.json(reply)
}

module.exports = {
    getAllMojDnevnik,
    getAllMojDnevnikKorisnik,
    createMojDnevnik,
    // updateMojDnevnik,
    deleteMojDnevnik
}