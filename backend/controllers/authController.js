const User = require("../models/User");
const Paket = require("../models/Paket");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const path = require("path");
// const fs = require("node:fs");
require("dotenv").config();
// const GoogleStrategy = require("passport-google-oauth2").Strategy;

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// const login = async (req, res) => {
//   //username je ustvari email
//   const { email, password } = req.body;
//   // console.log(username);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email i lozinka su obavezni" });
//   }

//   if (email == " " && password == " ") {
//     return res.status(400).json({ message: "Neispravni podaci za prijavu" });
//   }

//   if (!isValidEmail(email)) {
//     return res.status(400).json({ message: "Neispravan format email adrese" });
//   }

//   const foundUser = await User.findOne({ mail: email }).exec();

//   // if (!foundUser || !foundUser.active) {
//   //     return res.status(401).json({ message: 'Unauthorized' })
//   // }

//   if (!foundUser) {
//     return res.status(401).json({ message: "Nalog nije pronađen" });
//   }

//   const match = await bcrypt.compare(password, foundUser.password);

//   if (!match) return res.status(401).json({ message: "Pogrešna lozinka" });

//   const accessToken = jwt.sign(
//     {
//       UserInfo: {
//         id: foundUser._id,
//         // jmbg: foundUser.jmbg,
//         email: foundUser.mail, //Je mail ovde
//         roles: foundUser.roles,
//       },
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: "30h" }
//   );

//   const refreshToken = jwt.sign(
//     { email: foundUser.mail },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: "7d" }
//   );

//   //Svaki put kad se neko uloguje onda se proverava da li postoji neki paket sa Datum placanja = null ili "Pending"
//   //da bi ocistili bazi
//   Paket.deleteMany({ status_placanja: "Pending" })
//     .then((result) => {
//       console.log(`${result.deletedCount} paketa su obrisana.`);
//     })
//     .catch((err) => {
//       console.error("Greška pri brisanju paketa:", err);
//     });

//   //Azurira sve pakete koji su istekli - GODISNJE SAMO - PREMESTENO U KRON
//   // const today = new Date();
//   // const paketi = await Paket.find({ idUser: foundUser._id, tip: "Godišnje" }); //tip: "Godišnje"
//   // const updatedPaketi = await Promise.all(
//   //   paketi.map(async (paket) => {
//   //     if (!(today >= paket.datum_placanja && today <= paket.datum_isteka)) {
//   //       paket.status = "Neaktivan";
//   //       await paket.save();
//   //     }
//   //     return paket;
//   //   })
//   // );

//   res.cookie("jwt", refreshToken, {
//     httpOnly: true, //accessible only by web server
//     secure: false, //true je za https - false je za http
//     same_site: "None", //cross-site cookie - iz sa sameSite u same_site
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   res.json({ accessToken });
// };

const login = async (req, res) => {
  let { email, password } = req.body;

  // Trim prazni karakteri
  email = email?.trim();
  password = password?.trim();

  // console.log("Email vrednost:", JSON.stringify(email));
  // console.log("Password vrednost:", JSON.stringify(password));

  // 5. Ako su oba uneta, ali su SAMO razmaci
  // const isOnlySpaces = (value) =>
  //   typeof value === "string" && value.trim() === "" && value.length > 0;

  // if (isOnlySpaces(email) || isOnlySpaces(password)) {
  //   return res.status(400).json({ message: "Neispravni podaci za prijavu." });
  // }

  // // 1. Provera: oba polja zaista prazna ("")
  // if (email === "" && password === "") {
  //   return res.status(400).json({ message: "Email i lozinka su obavezni." });
  // }

  // // 1. Prazan email i lozinka
  // if (!email && !password) {
  //   return res.status(400).json({ message: "Email i lozinka su obavezni." });
  // }

  // 7. Validan email, prazna lozinka
  if (email && !password) {
    return res.status(400).json({ message: "Lozinka je obavezna." });
  }

  // 8. Prazan email, uneta lozinka
  if (!email && password) {
    return res.status(400).json({ message: "Email je obavezan." });
  }

  // 2. Neispravan format email adrese
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Neispravan format email adrese." });
  }

  // 6. Velika/mala slova (case-sensitive login neuspeh) — email treba biti lowercase
  const foundUser = await User.findOne({ mail: email }).exec();
  if (!foundUser) {
    return res.status(401).json({ message: "Nalog nije pronađen." });
  }

  // 4. Pogrešna lozinka
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    return res.status(401).json({ message: "Pogrešna lozinka." });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
        // jmbg: foundUser.jmbg,
        email: foundUser.mail, //Je mail ovde
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30h" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.mail },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  //Svaki put kad se neko uloguje onda se proverava da li postoji neki paket sa Datum placanja = null ili "Pending"
  //da bi ocistili bazi
  Paket.deleteMany({ status_placanja: "Pending" })
    .then((result) => {
      console.log(`${result.deletedCount} paketa su obrisana.`);
    })
    .catch((err) => {
      console.error("Greška pri brisanju paketa:", err);
    });

  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: false, //true je za https - false je za http
    same_site: "None", //cross-site cookie - iz sa sameSite u same_site
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // 9. Vraćanje tokena i poruke
  res.json({ accessToken });
};

//
// const register = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Sva polja su potrebna" });
//   }

//   const duplicate = await User.findOne({ mail: email })
//     .collation({ locale: "en", strength: 2 })
//     .lean()
//     .exec();

//   if (duplicate) {
//     return res.status(409).json({ message: "Duplikat username" });
//   }

//   const userObject = { mail: email, password };

//   const user = await User.create(userObject);

//   if (user) {
//     res
//       .status(201)
//       .json({ message: `Novi user sa emailom ${email} napravljen` });
//   } else {
//     res.status(400).json({ message: "Ne validni podatci dobijeni" });
//   }
// };

//Old bez email sendera
// const register = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Sva polja su potrebna" });
//   }

//   try {
//     const duplicate = await User.findOne({ mail: email })
//       .collation({ locale: "en", strength: 2 })
//       .lean()
//       .exec();

//     if (duplicate) {
//       return res.status(409).json({ message: "Korinsik postoji" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userObject = { mail: email, password: hashedPassword };

//     // Create the user in the database
//     const user = await User.create(userObject);

//     if (user) {
//       res
//         .status(201)
//         .json({ message: `Novi user sa emailom ${email} napravljen` });
//     } else {
//       res.status(400).json({ message: "Ne validni podatci dobijeni" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//Sa verifikacijom
// const register = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Sva polja su potrebna" });
//   }

//   try {
//     const duplicate = await User.findOne({ mail: email })
//       .collation({ locale: "en", strength: 2 })
//       .lean()
//       .exec();

//     if (duplicate) {
//       return res.status(409).json({ message: "Korinsik postoji" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userObject = { mail: email, password: hashedPassword, isVerified: false };

//     const user = await User.create(userObject);

//     const verificationToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const verificationLink = `http://13.50.180.98:5000/verify-email?token=${verificationToken}`;

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.gmail.email",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.MAILUSER,
//         pass: process.env.MAILPASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.MAILUSER,
//       to: email,
//       subject: "Registracija profila",
//       html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//                 <h1 style="color: #333;">Dobrodošli na Nutri Trans!</h1>
//                 <p style="color: #555;">Da biste uspešno završili registraciju, kliknite na dugme ispod da biste aktivirali svoj nalog.</p>
//                 <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Aktivirajte svoj nalog</a>
//                 <p style="color: #555; margin-top: 20px;">Molimo vas da ne odgovarate na ovaj email. Hvala.</p>
//             </div>`,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         res.status(400).json({ message: "Nije uspelo slanje na mail" });
//       } else {
//         res.status(200).json({ message: "Obavestenje za aktivaciju poslat na vaš email." });
//       }
//     });

//     if (user) {
//       res.status(201).json({ message: `Novi user sa emailom ${email} napravljen` });
//     } else {
//       res.status(400).json({ message: "Ne validni podatci dobijeni" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// Lazarevac22@

// ORIGINAL
// const register = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   const emailRegex =
//     /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)\.){3}(?:(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)|\[(?:[0-9a-fA-F]{1,4}:){1,6}:(?:[0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\]))$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ message: "Neispravan format email adrese." });
//   }

//   //ODKOMENTARISI Abcdef1!  jovanovicv420@gmail.com
//   const strongPasswordRegex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
//   if (!strongPasswordRegex.test(password)) {
//     return res.status(400).json({
//       message:
//         "Lozinka mora imati najmanje 8 karaktera, uključujući veliko slovo, malo slovo, broj i specijalni karakter.",
//     });
//   }

//   try {
//     const duplicate = await User.findOne({ mail: email })
//       .collation({ locale: "en", strength: 2 })
//       .lean()
//       .exec();

//     if (duplicate) {
//       if (duplicate.isVerified) {
//         return res
//           .status(409)
//           .json({ message: "Korisnik već postoji i verifikovan je" });
//       } else {
//         return res
//           .status(409)
//           .json({ message: "Korisnik postoji, ali nije verifikovan" });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userObject = {
//       mail: email,
//       password: hashedPassword,
//       isVerified: false,
//     };

//     //Creating user
//     const user = await User.create(userObject);

//     //Creating base paket
//     // const paketObjekat = {
//     //   orgderId: "",
//     //   naziv_paketa: "Starter", // Svi novi useri ce imati starter paket
//     //   cena: 0,
//     //   valuta: "RSD",
//     //   status_placanja: "Plaćeno",
//     //   status: "Aktivan",
//     //   tip: "",
//     //   broj: {
//     //     full: "0",
//     //     base: "0",
//     //   },
//     //   datum_kreiranja: new Date(),
//     //   datum_isteka: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//     //   datum_placanja: new Date(),
//     //   // datum_otkazivanja:,
//     //   idUser: user._id,
//     //   transakcioni_id: "",
//     //   metoda_placanja: "",
//     //   TransId: "",
//     //   recurringID: "",
//     //   userMail: user.mail,
//     // };

//     //Radi ok!
//     // const paket = await Paket.create(paketObjekat);

//     const verificationToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     user.currentToken = verificationToken;
//     await user.save();
//     //?showLogin=true
//     const verificationLink = `${process.env.FRONTEND_URL}:5000/verify-email?token=${verificationToken}&showLogin=true`;
//     // const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.gmail.email",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.MAILUSER,
//         pass: process.env.MAILPASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.MAILUSER,
//       to: email,
//       subject: "Registracija profila",
//       // html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//       //           <h1 style="color: #333;">Dobrodošli na Nutri Trans!</h1>
//       //           <p style="color: #555;">Da biste uspešno završili registraciju, kliknite na dugme ispod da biste aktivirali svoj nalog.</p>
//       //           <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Aktivirajte svoj nalog</a>
//       //           <p style="color: #555; margin-top: 20px;">Molimo vas da ne odgovarate na ovaj email. Hvala.</p>
//       //       </div>`,
//       html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
//                 <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
//                 <h1 style="color: #333; font-size: 28px;">🎉 Dobrodošli na Nutri Trans! 🎉</h1>
//                 <p style="color: #555; font-size: 18px;">Da biste uspešno završili registraciju, kliknite na dugme ispod da biste aktivirali svoj nalog.</p>

//                 <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; font-size: 18px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">✅ Aktivirajte svoj nalog</a>

//                 <p style="color: #777; font-size: 14px; margin-top: 30px;">Ako niste kreirali ovaj nalog, slobodno ignorišite ovaj email.</p>

//                 <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🚀</p>
//             </div>
//             `,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.error("Greška pri slanju prvog emaila:", error);
//         return res.status(400).json({ message: "Greška pri slanju emaila" });
//       } else {
//         console.log("Email za verifikaciju poslat:", info.response);

//         // Drugi email - saljemo pdf...
//         const secondMailOptions = {
//           from: process.env.MAILUSER,
//           to: profile.emails[0].value,
//           subject: "Propratne informacije",
//           html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
//                 <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
//                 <h1 style="color: #333; font-size: 28px;">📃 Uputstvo za Nutri Trans! 📃</h1>
//                 <p style="color: #555; font-size: 18px;">U prilogu Vam šaljemo PDF dokument vezan za Nutri Trans aplikaciju. Molimo Vas da ga pregledate i javite nam ako imate bilo kakvih pitanja ili potrebna dodatna pojašnjenja.</p>

//                 <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🚀</p>
//             </div>`,
//           attachments: [
//             {
//               filename: "vodic.pdf",
//               path: "./vodic.pdf",
//               contentType: "application/pdf",
//             },
//           ],
//         };

//         transporter.sendMail(secondMailOptions, (err, info) => {
//           if (err) {
//             console.error("Greška pri slanju drugog email-a:", err);
//           } else {
//             console.log("Drugi email poslat sa PDF prilogom:", info.response);
//           }
//         });
//       }
//     });

//     if (user) {
//       return res
//         .status(201)
//         .json({ message: `Novi user sa emailom ${email} napravljen` });
//     } else {
//       res.status(400).json({ message: "Ne validni podatci dobijeni" });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const register = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  const emailRegex =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)\.){3}(?:(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)|\[(?:[0-9a-fA-F]{1,4}:){1,6}:(?:[0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\]))$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Neispravan format email adrese." });
  }

  //ODKOMENTARISI Abcdef1!  jovanovicv420@gmail.com
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Lozinka mora imati najmanje 8 karaktera, uključujući veliko slovo, malo slovo, broj i specijalni karakter.",
    });
  }

  try {
    const duplicate = await User.findOne({ mail: email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      if (duplicate.isVerified) {
        return res
          .status(409)
          .json({ message: "Korisnik već postoji i verifikovan je" });
      } else {
        return res
          .status(409)
          .json({ message: "Korisnik postoji, ali nije verifikovan" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObject = {
      mail: email,
      password: hashedPassword,
      isVerified: false,
    };

    //Creating user
    const user = await User.create(userObject);

    //Creating base paket
    // const paketObjekat = {
    //   orgderId: "",
    //   naziv_paketa: "Starter", // Svi novi useri ce imati starter paket
    //   cena: 0,
    //   valuta: "RSD",
    //   status_placanja: "Plaćeno",
    //   status: "Aktivan",
    //   tip: "",
    //   broj: {
    //     full: "0",
    //     base: "0",
    //   },
    //   datum_kreiranja: new Date(),
    //   datum_isteka: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    //   datum_placanja: new Date(),
    //   // datum_otkazivanja:,
    //   idUser: user._id,
    //   transakcioni_id: "",
    //   metoda_placanja: "",
    //   TransId: "",
    //   recurringID: "",
    //   userMail: user.mail,
    // };

    //Radi ok!
    // const paket = await Paket.create(paketObjekat);

    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.currentToken = verificationToken;
    await user.save();
    //?showLogin=true
    const verificationLink = `${process.env.FRONTEND_URL}:5000/verify-email?token=${verificationToken}&showLogin=true`;
    // const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILUSER,
      to: email,
      subject: "Registracija profila",
      // html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      //           <h1 style="color: #333;">Dobrodošli na Nutri Trans!</h1>
      //           <p style="color: #555;">Da biste uspešno završili registraciju, kliknite na dugme ispod da biste aktivirali svoj nalog.</p>
      //           <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Aktivirajte svoj nalog</a>
      //           <p style="color: #555; margin-top: 20px;">Molimo vas da ne odgovarate na ovaj email. Hvala.</p>
      //       </div>`,
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #333; font-size: 28px;">🎉 Dobrodošli na Nutri Trans! 🎉</h1>
                <p style="color: #555; font-size: 18px;">Da biste uspešno završili registraciju, kliknite na dugme ispod da biste aktivirali svoj nalog.</p>

                <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; font-size: 18px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">✅ Aktivirajte svoj nalog</a>

                <p style="color: #777; font-size: 14px; margin-top: 30px;">Ako niste kreirali ovaj nalog, slobodno ignorišite ovaj email.</p>

                <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🚀</p>
            </div>
            `,
    };

    // Drugi email - saljemo pdf...
    const secondMailOptions = {
      from: process.env.MAILUSER,
      to: email,
      subject: "Propratne informacije",
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #333; font-size: 28px;">📃 Uputstvo za Nutri Trans! 📃</h1>
                <p style="color: #555; font-size: 18px;">U prilogu Vam šaljemo PDF dokument vezan za Nutri Trans aplikaciju. Molimo Vas da ga pregledate i javite nam ako imate bilo kakvih pitanja ili potrebna dodatna pojašnjenja.</p>

                <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🚀</p>
            </div>`,
      attachments: [
        {
          filename: "vodic.pdf",
          path: "./vodic.pdf",
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Greška pri slanju prvog emaila:", error);
        return res.status(400).json({ message: "Greška pri slanju emaila" });
      }

      console.log("Prvi email poslat:", info.response);

      // Slanje drugog mejla
      transporter.sendMail(secondMailOptions, function (err, info2) {
        if (err) {
          console.error("Greška pri slanju drugog emaila:", err);
          // Ali ovde NE šaljemo response ponovo, samo logujemo
        } else {
          console.log("Drugi email poslat:", info2.response);
        }

        // ✅ Na kraju - response šaljemo samo jednom, ovde
        return res
          .status(201)
          .json({ message: `Novi user sa emailom ${email} napravljen` });
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const registerA = async (req, res) => {
  const { email, password } = req.body;

  // ... validacije emaila i lozinke, kao u tvojoj funkciji

  try {
    const duplicate = await User.findOne({ mail: email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      if (duplicate.isVerified) {
        return res
          .status(409)
          .json({ message: "Korisnik već postoji i verifikovan je" });
      } else {
        return res
          .status(409)
          .json({ message: "Korisnik postoji, ali nije verifikovan" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      mail: email,
      password: hashedPassword,
      isVerified: false,
    });

    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.currentToken = verificationToken;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}:5000/verify-email?token=${verificationToken}&showLogin=true`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILUSER,
      to: email,
      subject: "Registracija profila",
      html: `<p>Dobrodošli... Kliknite za verifikaciju</p>`, // skraceno
    };

    const secondMailOptions = {
      from: process.env.MAILUSER,
      to: email,
      subject: "Propratne informacije",
      html: `<p>Uputstvo i PDF u prilogu</p>`,
      attachments: [
        {
          filename: "vodic.pdf",
          path: "./vodic.pdf",
          contentType: "application/pdf",
        },
      ],
    };

    // Slanje prvog maila
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Greška pri slanju prvog emaila:", error);
        return res.status(400).json({ message: "Greška pri slanju emaila" });
      }

      console.log("Prvi email poslat:", info.response);

      // Slanje drugog mejla
      transporter.sendMail(secondMailOptions, function (err, info2) {
        if (err) {
          console.error("Greška pri slanju drugog emaila:", err);
          // Ali ovde NE šaljemo response ponovo, samo logujemo
        } else {
          console.log("Drugi email poslat:", info2.response);
        }

        // ✅ Na kraju - response šaljemo samo jednom, ovde
        return res
          .status(201)
          .json({ message: `Novi user sa emailom ${email} napravljen` });
      });
    });
  } catch (err) {
    console.error("Greška:", err);
    return res.status(500).json({ message: "Greška prilikom registracije." });
  }
};

const forgot_password = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);

  try {
    const foundUser = await User.findOne({ mail: email }).exec();

    if (!foundUser) {
      return res.status(401).json({ message: "Korisnik nije nadjen" });
    }

    const secret = process.env.JWT_SECRET + foundUser.password;
    const token = jwt.sign(
      { id: foundUser._id, email: foundUser.mail },
      secret,
      {
        expiresIn: "5m",
      }
    );

    const link = `${process.env.FRONTEND_URL}:5000/auth/reset_password/${foundUser._id}/${token}`;
    // const link = `http://localhost:5000/auth/reset_password/${foundUser._id}/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS,
      },
    });

    var mailOptions = {
      from: process.env.MAILUSER,
      to: email,
      subject: "Password Reset",
      // text: link,
      // html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      //         <h1 style="color: #333;">Zahtev za resetovanje šifre</h1>
      //         <p style="color: #555;">Dobili smo zahtrev za resetovanje Vase šifre, kliknite dole da bi ste je resetovali</p>
      //         <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resetuj lozinku</a>
      //         <p style="color: #555; margin-top: 20px;">Ako niste poslali zahtev za resetovanje šifre onda ignorišite ovaj mail.</p>
      //       </div>`,
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #333; font-size: 28px;">🔒 Zahtev za aktivaciju profila 🔒</h1>
                <p style="color: #555; font-size: 18px;">Dobili smo zahtev za resetovanje Vaše šifre. Kliknite na dugme ispod da biste je resetovali.</p>
                
                <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; font-size: 18px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">🔑 Resetuj lozinku</a>
                
                <p style="color: #777; font-size: 14px; margin-top: 30px;">Ako niste poslali zahtev za resetovanje šifre, slobodno ignorišite ovaj email.</p>
                
                <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🔐</p>
            </div>
            `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);
        res.status(400).json({ message: `Nije uspelo slanje na mail` });
      } else {
        res
          .status(200)
          .json({ message: `Resetovanje lozinke poslato na ${email}` });
        // console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (err) {
    console.log(err);
  }
};

//Forma za resetovanje lozinke posle kliktanja na mail
let reset_password = async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const foundUser = await User.findOne({ _id: id }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Korisnik nije nadjen" });
  }

  const secret = process.env.JWT_SECRET + foundUser.password;

  try {
    const verify = jwt.verify(token, secret);
    // res.send("Verified");
    res.render("resetLozinke", { email: verify.email });
  } catch (err) {
    res.send("Not verified");
  }

  // res.send("Done");
};
//jovanovicv420@gmail.com - 1111
//Povratna poruka da je uspeno odradio promenu i redirekcija na login
let reset_password_post = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const foundUser = await User.findOne({ _id: id }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Korisnik nije nadjen" });
  }

  const secret = process.env.JWT_SECRET + foundUser.password;

  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );

    res.render("usepsnoPoruka", { email: verify.email, status: "verified" });
    // res.json({ status: "Password updated" });
  } catch (err) {
    console.log(err);
    res.json({ status: "Something Went Wrong" });
  }

  // res.send("Done");
};

const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({
        mail: decoded.email,
      }).exec();

      if (!foundUser)
        return res.status(401).json({ message: "Korisnik nije nadjen" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
            // jmbg: foundUser.jmbg,
            email: foundUser.mail,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

//Example
const home = (req, res) => {
  res.render("home");
};

module.exports = {
  login,
  home,
  register,
  forgot_password,
  reset_password,
  reset_password_post,
  refresh,
  logout,
};

//====

// const login = async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const foundUser = await User.findOne({ username }).exec();

//   // if (!foundUser || !foundUser.active) {
//   //     return res.status(401).json({ message: 'Unauthorized' })
//   // }

//   if (!foundUser) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const match = await bcrypt.compare(password, foundUser.password);

//   if (!match) return res.status(401).json({ message: "Unauthorized" });

//   const accessToken = jwt.sign(
//     {
//       UserInfo: {
//         id: foundUser._id,
//         jmbg: foundUser.jmbg,
//         username: foundUser.username,
//         roles: foundUser.roles,
//       },
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: "15m" }
//   );

//   const refreshToken = jwt.sign(
//     { username: foundUser.username },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: "7d" }
//   );

//   res.cookie("jwt", refreshToken, {
//     httpOnly: true, //accessible only by web server
//     secure: false, //https
//     same_site: "None", //cross-site cookie - iz sa sameSite u same_site
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   res.json({ accessToken });
// };

// const register = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "Sva polja su potrebna" });
//   }

//   try {
//     // Check for duplicate user
//     const duplicate = await User.findOne({ mail: email })
//       .collation({ locale: "en", strength: 2 })
//       .lean()
//       .exec();

//     if (duplicate) {
//       return res.status(409).json({ message: "Duplikat username" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user object with the hashed password
//     const userObject = { mail: email, password: hashedPassword };

//     // Create the user in the database
//     const user = await User.create(userObject);

//     if (user) {
//       res
//         .status(201)
//         .json({ message: `Novi user sa emailom ${email} napravljen` });
//     } else {
//       res.status(400).json({ message: "Ne validni podatci dobijeni" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/google/callback",
//       passReqToCallback: true,
//     },
//     //Ova funkcija sluzi da se napravi novi user i da se pronadje
//     function (request, accessToken, refreshToken, profile, done) {
//       // User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       //   return done(err, user);
//       // });
//       return done(null);
//     }
//   )
// );
