require("dotenv").config();
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const https = require("https"); //Za produkciju
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const fs = require("fs");
const multer = require("multer");
const openai = require("./config/openaiConfig"); //
// const { Configuration, OpenAIApi } = require('openai');
// const { Configuration } = require('openai');
const pdfService = require("./pdf-service");
// const { LLMChain } = require("langchain/chains");
// const { OpenAI } = require("openai");
const OpenAI = require("openai");
// const { PromptTemplate } = require("@langchain/core");
const { z } = require("zod");
const { zodFunction, zodResponseFormat } = require("openai/helpers/zod");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const User = require("./models/User");
const Prompt = require("./models/Promptovi");
const crypto = require("crypto");
const Paket = require("./models/Paket");
const Ciljevi = require("./models/Ciljevi");
const ChatKonverzacija = require("./models/ChatKonverzacija");
const Namirnice = require("./models/Namirnice");
const Blog = require("./models/Blog");

const ejs = require("ejs");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

console.log("Tip => ", process.env.NODE_ENV); //development

// const User = require("./models/User");
const jwt = require("jsonwebtoken");

connectDB();

app.use(logger);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: true },
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true },
  })
);

function isLogedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

//ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false, extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use("/", express.static(path.join(__dirname, "public"))); //Za static fajlove

//Premesti u rute
//Ovo baca na gui za izbor mejlova
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

//Kada se autentifikujemo dobro onda se ide na ovu stranicu
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/google/callback",
//       passReqToCallback: true,
//     },
//     //Ova funkcija sluzi da se napravi novi user i da se pronadje
//     async (request, accessToken, refreshToken, profile, done) => {
//       const email = profile.emails[0].value;
//       const foundUser = await User.findOne({ email }).exec();

//       console.log(email);

//       if (!foundUser) {
//         // If the user does not exist, create a new user
//         foundUser = await User.create({
//           // googleId: profile.id,
//           // username: profile.displayName,
//           email: profile.emails[0].value,
//         });
//       }
//       return done(null, user);

//       // return done(null);
//     }
//   )
// );
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/google/callback",
//       passReqToCallback: true,
//     },
//     async function (request, accessToken, refreshToken, profile, done) {
//       try {
//         // Check if the user already exists in the database
//         const existingUser = await User.findOne({
//           googleId: profile.id,
//         }).exec();

//         if (existingUser) {
//           // User exists, generate access and refresh tokens
//           const accessToken = jwt.sign(
//             {
//               UserInfo: {
//                 id: existingUser._id,
//                 email: existingUser.email,
//                 roles: existingUser.roles,
//               },
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "15m" }
//           );

//           const refreshToken = jwt.sign(
//             { email: existingUser.email },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: "7d" }
//           );

//           // Return user with tokens
//           return done(null, { accessToken, refreshToken });
//         } else {
//           // If user doesn't exist, create a new user in the database
//           const newUser = new User({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             name: profile.displayName,
//             roles: ["user"], // Default role for new users
//           });

//           await newUser.save();

//           // Generate tokens for the newly created user
//           const accessToken = jwt.sign(
//             {
//               UserInfo: {
//                 id: newUser._id,
//                 email: newUser.email,
//                 roles: newUser.roles,
//               },
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "15m" }
//           );

//           const refreshToken = jwt.sign(
//             { email: newUser.email },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: "7d" }
//           );

//           // Return the new user with tokens
//           return done(null, { accessToken, refreshToken });
//         }
//       } catch (err) {
//         console.error(err);
//         return done(err, false, { message: "Server error" });
//       }
//     }
//   )
// );

// app.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/succcesLogin",
//     failureRedirect: "/failLogin",
//   })
// );

// app.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     if (req.user && req.user.accessToken && req.user.refreshToken) {
//       // Set refreshToken in a cookie and send the accessToken as a JSON response
//       res.cookie("jwt", req.user.refreshToken, {
//         httpOnly: true,
//         secure: true, // ensure HTTPS is used in production
//         sameSite: "None",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       });

//       return res.json({ accessToken: req.user.accessToken });
//     }

//     res.status(400).json({ message: "Authentication failed" });
//   }
// );

// passport.serializeUser(function (done) {
//   done(null);
// });

// passport.deserializeUser(function (done) {
//   done(null);
// });

// app.get("/succcesLogin", (req, res) => {
//   res.status(200).json({ message: "Ulogovani ste!" });
// });

// app.get("/failLogin", isLogedIn, (req, res) => {
//   res.status(400).json({ message: "Nije uspesno logovanje sa googlom" });
// });

//
// const corsOptions = {
//   origin: 'https://nutritrans.rs/',  // Explicitly define the frontend address
//   credentials: true,  // This allows cookies to be sent with requests
//   optionsSuccessStatus: 200,  // Legacy browser support
// };

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use("/files", express.static("files")); //Za PDF-ove

//Za PDF-ove
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

// Storage za slike
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    const userId = req.params.id;
    cb(null, `${userId}${path.extname(file.originalname)}`); // Ime slike je ID korisnika
  },
});

const uploadImages = multer({ storage: imageStorage });

// Endpoint za upload slike
// app.post(
//   "/api/users/:id/upload",
//   uploadImages.single("image"),
//   async (req, res) => {
//     const userId = req.params.id;

//     if (!req.file) {
//       return res.status(400).json({ message: "Greška pri uploadu slike" });
//     }

//     const imageUrl = `/images/${userId}${path.extname(req.file.originalname)}`;

//     try {
//       // Ažuriraj URL slike u bazi
//       const user = await User.findByIdAndUpdate(
//         userId,
//         { imageUrl },
//         { new: true }
//       );

//       if (!user) {
//         return res.status(404).json({ message: "Korisnik nije pronađen" });
//       }

//       res.json({ message: "Profilna slika uspešno postavljena", imageUrl });
//     } catch (error) {
//       res.status(500).json({ message: "Greška pri čuvanju slike", error });
//     }
//   }
// );

app.post(
  "/api/users/:id/upload",
  uploadImages.single("image"),
  async (req, res) => {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "Greška pri uploadu slike" });
    }

    const imageUrl = `/images/${userId}${path.extname(req.file.originalname)}`;
    const imagePath = path.join(__dirname, "public", imageUrl); // Putanja do slike na serveru

    try {
      // Prvo proverite da li već postoji slika sa istim imenom
      const user = await User.findById(userId);

      if (user && user.imageUrl) {
        const oldImagePath = path.join(__dirname, "public", user.imageUrl);

        // Ako slika postoji, obrišite je
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Ažurirajte URL slike u bazi
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Korisnik nije pronađen" });
      }

      res.json({ message: "Profilna slika uspešno postavljena", imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Greška pri čuvanju slike", error });
    }
  }
);

// Endpoint za dohvat korisnika
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    let usrImg = user.imageUrl;

    res.json(usrImg);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatu korisnika", error });
  }
});

// Endpoint za serviranje slika
app.use("/images", express.static(path.join(__dirname, "images")));

//Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID_PRODUCTION,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_PRODUCTION,
      callbackURL: "/auth/google/callback", //ili sa full pathom... http://localhost:5000/auth/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log("Google user => ", profile); //Dobijeni podaci od googla

      try {
        let user = await User.findOne({ mail: profile.emails[0].value });

        // let lastname_ = profile.name.familyName;
        // let name_ = profile.name.givenName;
        // let mail_ = profile.emails[0].value;

        // console.log("Ime: ", name_);
        // console.log("Prezime: ", lastname_);
        // console.log("Mail: ", mail_);

        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;

        const formattedFirstName =
          firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const formattedLastName =
          lastName.charAt(0).toUpperCase() + lastName.slice(1);

        if (!user) {
          //Keriranje usera
          user = await User.create({
            googleId: profile.id,
            mail: profile.emails[0].value,
            name: formattedFirstName,
            lastName: formattedLastName,
            primcilj: "Mršavljenje",
            roles: ["Klijent"],
            actlvl: 1.2, //Ovaj se mozda ne koristi...
            nivoAkt: 1.2, //
            selectedIshrana: "Tvoja ishrana",
            selectedIshranaNaziv: "Tvoja ishrana",
            allergiesEnabled: "ne",
            allergyChoice: "no",
            pus: "ne",
            alk: "ne",
            isVerifiedGoogle: true, //isVerified
          });

          //Creating base paket
          const paketObjekat = {
            orgderId: "",
            naziv_paketa: "Starter", // Svi novi useri ce imati starter paket
            cena: 0,
            valuta: "RSD",
            status_placanja: "Plaćeno",
            status: "Aktivan",
            tip: "",
            broj: {
              full: "1",
              base: "0",
            },
            datum_kreiranja: new Date(),
            datum_isteka: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ),
            datum_placanja: new Date(),
            // datum_otkazivanja:,
            idUser: user._id, //Proveri da li radi?
            transakcioni_id: "",
            metoda_placanja: "",
            TransId: "",
            recurringID: "",
            userMail: user.mail,
          };

          // console.log('user._id - GOOGLE: ', user._id);

          //Radi ok!
          const paket = await Paket.create(paketObjekat);

          const verificationToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          //Promeni pri produkciji na https://nutritrans.rs:5000
          // const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;
          const verificationLink = `${process.env.FRONTEND_URL}:5000/verify-email?token=${verificationToken}`;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.email",
            port: 587,
            secure: false,
            auth: {
              user: "office@nutritrans.com",
              pass: "jezq ddqo aynu qucx",
            },
          });

          const mailOptions = {
            //work here
            from: "office@nutritrans.com",
            to: profile.emails[0].value,
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

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Greška pri slanju email-a:", err);
            } else {
              console.log("Email za verifikaciju poslat:", info.response);

              // Drugi email - saljemo pdf...
              const secondMailOptions = {
                from: "office@nutritrans.com",
                to: profile.emails[0].value,
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

              transporter.sendMail(secondMailOptions, (err, info) => {
                if (err) {
                  console.error("Greška pri slanju drugog email-a:", err);
                } else {
                  console.log(
                    "Drugi email poslat sa PDF prilogom:",
                    info.response
                  );
                }
              });
            }
          });
        }

        done(null, user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

//Za saving user data inside the session
passport.serializeUser((user, done) => {
  console.log("serialize user", user);
  done(null, user.id);
});

//Za retriving user data from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); //Kako by id, mozda da ga trazim po mailu?
    console.log("DEserialize user", user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) //Retrivujemo???
);

//Vraca se na callback???
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/`,
  }), //Ako je fail
  (req, res) => {
    //Ako je success?
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: req.user._id,
          email: req.user.mail,
          name: req.user.name,
          roles: req.user.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30h" }
    );

    // const refreshToken = jwt.sign(
    //   { id: req.user._id },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: "7d",
    //   }
    // );

    const refreshToken = jwt.sign(
      { email: req.user.mail },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: false, //true je za https - false je za http
      same_site: "None", //cross-site cookie - iz sa sameSite u same_site
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}`
    );
    // res.json({ accessToken });
  }
);

// app.get("/auth/user", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json(req.user);
//   } else {
//     res.status(401).json({ message: "Niste prijavljeni" });
//   }
// });

// app.get("/auth/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.error(err);
//     }
//     res.redirect("/");
//   });
// });

//Test ===
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/googleFail" }), //Ako je fail
//   (req, res) => {
//     res.redirect("/googleSuccess");
//   }
// );

// app.get("/googleSuccess", (req, res) => {
//   res.json({ message: "Rout GOOD" });
// });

// app.get("/googleFail", (req, res) => {
//   res.json({ message: "Rout BAD" });
// });
//Test ===

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails"); //Kolekcija za bazu
const upload = multer({ storage: storage });

// app.post("/upload-files", upload.single("file"), async (req, res) => {
//   console.log(req.file);
//   const title = req.body.title;
//   const fileName = req.file.filename;
//   try {
//     await PdfSchema.create({ title: title, pdf: fileName });
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

//Vraca sve fajlove klijentu
// app.get("/get-files/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     PdfSchema.find({ idKlijenta: id }).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });

//Vraca sve fajlove klijentu i updejtuje stanja
app.get("/get-files/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await PdfSchema.find({ idKlijenta: id });

    for (let document of data) {
      if (document.datumKraj) {
        const today = new Date();

        const datumKrajParts = document.datumKraj.split(".");
        const datumKrajFormatted = new Date(
          `${datumKrajParts[2]}-${datumKrajParts[1]}-${datumKrajParts[0]}`
        );

        if (datumKrajFormatted < today) {
          // Ažuriraj status u bazi podataka
          const updatedDocument = await PdfSchema.findByIdAndUpdate(
            document._id,
            { status: "Neaktivan" },
            { new: true }
          );

          // if (updatedDocument) {
          //   console.log(
          //     `Document with ID ${document._id} updated to 'Neaktivan'`
          //   );
          // } else {
          //   console.log(`Failed to update document with ID ${document._id}`);
          // }
        }
      }
    }

    // Ponovo učitajte sve podatke nakon ažuriranja statusa
    const updatedData = await PdfSchema.find({ idKlijenta: id });

    // Vraćanje odgovora sa ažuriranim podacima
    res.send({ status: "ok", data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", message: "Došlo je do greške" });
  }
});

//Vraca samo poslednja 2 fajla ( izvestaja ) klijentu
app.get("/get-files/two/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await PdfSchema.find({ idKlijenta: id })
      .sort({ _id: -1 })
      .limit(1); // Vraća poslednja dva zapisa, bilo je 2 sad prebaceno na 1

    res.send({ status: "ok", data: data });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Nesto se desilo lose sa uzimanjem poslednja 2 iz baze!",
    });
  }
});

// Download file
app.get("/files/:filename", (req, res) => {
  const filePath = path.join(__dirname, "files", req.params.filename);
  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file.");
    }
  });
});

// API to delete a file and its reference from MongoDB
app.delete("/delete-file/:id", async (req, res) => {
  try {
    // Find the document by ID in the database
    const pdf = await PdfSchema.findById(req.params.id);
    const filePath = path.join(__dirname, "files", pdf.pdf);

    // Remove the file from the file system
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res
          .status(500)
          .send({ status: "error", message: "File deletion failed" });
      }

      // Remove the document from the database
      await PdfSchema.findByIdAndDelete(req.params.id);
      res.send({ status: "ok", message: "File deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).send({ status: "error", message: "File not found" });
  }
});

//Vraca sve pakete klijentu
// app.get("/get-pakete/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     Paket.find({ idUser: id }).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });

//Azurira
app.get("/get-pakete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const today = new Date();
    const paketi = await Paket.find({ idUser: id }); //tip: "Godišnje"

    // Proveri i ažuriraj pakete
    const updatedPaketi = await Promise.all(
      paketi.map(async (paket) => {
        if (!(today >= paket.datum_placanja && today <= paket.datum_isteka)) {
          paket.status = "Neaktivan";
          await paket.save();
        }
        return paket;
      })
    );

    res.send({ status: "ok", data: updatedPaketi });
  } catch (error) {
    console.error("Error ne mogu da se fetuju paketi:", error);
    res.status(500).send({ status: "error", message: "Server error" });
  }
});

//Samo sa statusom neaktivan
// app.get("/get-pakete/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const pakets = await Paket.find({
//       idUser: id,
//       status: "Neaktivan"
//     });
//     res.send({ status: "ok", data: pakets });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ status: "error", message: "Error fetching pakets" });
//   }
// });

app.get("/date", (req, res) => {
  res.status(200).json({
    date: new Date().toISOString(),
  });
});

//Manuelno dodeljivanje paketa od strane admina
app.post("/add-paket", async (req, res) => {
  try {
    const { idUser, mail, imePaketa, brJelovnika, tipPaketa, cena } = req.body;

    const datumIsteka =
      tipPaketa === "Mesečno"
        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const newPaket = new Paket({
      orderId: "",
      naziv_paketa: imePaketa,
      cena: parseInt(cena),
      valuta: "RSD",
      status_placanja: "Plaćeno",
      status: "Aktivan",
      tip: tipPaketa || "",
      broj: {
        full: brJelovnika,
        base: "0",
      },
      datum_kreiranja: new Date(),
      datum_isteka: datumIsteka,
      datum_placanja: new Date(),
      idUser,
      transakcioni_id: "",
      metoda_placanja: "",
      TransId: "",
      recurringID: "",
      userMail: mail,
    });

    await newPaket.save();

    res.status(201).json({
      success: true,
      message: "Paket uspešno dodat!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Došlo je do greške prilikom dodavanja paketa",
      error: error.message,
    });
  }
});

app.post("/delete-paket", async (req, res) => {
  const { id } = req.body;

  try {
    const rezultat = await Paket.findByIdAndDelete(id);

    if (rezultat) {
      res.status(200).json({ success: true, message: "Paket obrisan" });
    } else {
      res.status(404).json({ success: false, message: "Paket nije pronađen" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Greška prilikom brisanja paketa" });
  }
});

app.post("/update-paket-izvestaji-full", async (req, res) => {
  const { idIzv, inputValue } = req.body;

  try {
    const izvestaj = await Paket.findById(idIzv);

    if (izvestaj) {
      izvestaj.broj.full = inputValue;

      await izvestaj.save();

      res
        .status(200)
        .json({ success: true, message: "Paket uspešno ažuriran" });
    } else {
      res.status(404).json({ success: false, message: "Paket nije pronađen" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Greška prilikom ažuriranja paketa" });
  }
});

// <!-- <script>
// var status = '<%- JSON.stringify(status) %>';

// if (JSON.parse(status) == "verified") {
//   if (confirm("Do u want to login?")) {
//     window.location.href = "http://localhost:3000/";
//   }
// }
// </script> -->

// app.use("/", express.static(path.join(__dirname, "public")));
// app.use("/css", express.static("dist"));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/ciljevi", require("./routes/ciljeciRoutes"));
app.use("/fizickeAktivnosti", require("./routes/fizickeAktivnostiRoute"));
app.use("/ishrane", require("./routes/ishranaRoutes"));
app.use("/namirnice", require("./routes/namirniceRoutes"));
app.use("/mojDnevnik", require("./routes/mojDnevnikRoutes"));
app.use("/prompts", require("./routes/promptRoutes"));
app.use("/chatKonv", require("./routes/chatKonvRoutes"));
app.use("/blog", require("./routes/blogRoutes"));
app.use("/tag", require("./routes/tagRoutes"));

//AI
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
// app.use("/openai", require("./routes/openaiRoutes")); //Ako hocemo preko rutera

// app.use("/openai", async (req, res) => {
//   const { title } = req.body;

//   //Jedan text prompt
//   const description = await openai.chat.completions.create({
//     model: "gpt-4o-2024-08-06",
//     messages: [
//       {
//         role: "user",
//         content: `${title}`,
//       },
//     ],
//     max_tokens: 1000, // Povecaj jos ako treba
//   });

//   // console.log("Object:", description.choices[0].message.content);

//   res.status(200).json({
//     description: description.choices[0].message.content,
//   });
// });

//Za admin chat
app.post("/adminChat", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Potreno pitanje" });
    }

    const description = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: `"${title}"`,
        },
      ],
    });

    let odgovor = description.choices[0]?.message?.content?.trim();
    odgovor = odgovor.replace(/[#!&*ü!_?-@**]/g, "");

    // console.log("OpenAI Response:", description.data);
    res.status(200).json({
      description: odgovor,
    });
  } catch (error) {
    console.error("Error generating description:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the description" });
  }
});

//Prompt
// Kreiraj mi sedmodnevni plan ishrane sa ciljem Povećanje mišićne mase. Moja dnevna kalorijska vrednost iznosi 2665.52. Koji pokrivaju samo obroke: doručak, užina, ručak, užina, večera, a namirnice koje želim da koristim su: Narandža,Limun,Grejpfrut,Mandarina,Kukuruz,Malina,Borovnica,Kupina,Ribizla,Breskva,Šljiva,Trešnja,Kajsija,Višnja,Banana,Mango,Ananas,Papaja,Kivi,Jabuka,Kruška,Lubenica,Dinja,Spanać,Blitva,Kelj,Zelena Salata,Rukola,Matovilac,Celer,Šargarepa,Cvekla,Krompir,Batat,Rotkva,Bundeva,Tikvica,Krastavac,Crni luk,Beli luk,Praziluk,Paradajz,Paprika,Čili papričice,Grašak,Pasulj,Sočivo,Leblebija,Soja,Badem,Orasi,Lešnici,Indijski orah,Kikiriki,Suncokret,Lan,Susam,Semenke bundeve,Kravlje,Kozje,Sojino,Bademovo,Obični,Grčki,Voćni,Gauda,Edamer,Feta,Parmezan,Mozzarela,Rikota,Kisela Pavlaka,Slatka Pavlaka,Maslac,Govedina,Teletina,Svinjetina,Jagnjetina,Konjetina,Piletina,Ćuretina,Pačetina,Guščetina,Šaran,Som,Pastrmka,Smuđ,Deverika,Kečiga,Štuka,Losos,Tuna,Skuša,Bakalar,Škampi,Lignje,Šunka,Slanina,Kobasice,Salama,Pašteta,Mesni Narezak,Pileća,Prepeličja,Maslinovo,Suncokretovo,Kokosovo,Laneno,Ulje repice,Mlečni maslac (puter),Margarin,Voćni sokovi,Povrćni sokovi,Smutiji,Crna kafa,Zeleni čaj,Crni čaj,Biljni čaj,Kefir,Kiselo mleko. Volim naminice: , dok ne želim da uključim . Ispiši mi prvo neki kratak nutricionistički opis pa ispod plan ishrane dan ispod dana i na kraju jedan mali zaključak. Nemoj da ispisuješ ove karaktere: #, &, *,**, -,ü, !, _, ?,",'. Ispiši mi dan za danom Dan 1, Dan 2...
//Jedan nacin - Original
app.use("/openai", async (req, res) => {
  const { title, metaData: newData } = req.body;

  // Jedan text prompt
  const description = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "user",
        content: `${title}`,
      },
    ],
    max_tokens: 3000, // Povećaj još ako treba
  });

  const content = description.choices[0].message.content;
  const content_ = description.choices[0].message.content;

  // Generisanje PDF-a
  const fileName = `${newData.primcilj}_${Date.now()}_${Math.floor(
    Math.random() * 100000000000
  )}.pdf`; // Ime datoteke
  const filePath = `./files/${fileName}`;

  // Koristi prazan buffer za čuvanje chunk-ova
  const chunks = [];

  pdfService.buildPDF(
    content,
    newData,
    (chunk) => chunks.push(chunk), // Sakupljaj chunk-ove
    async () => {
      // Čuvanje PDF-a na disk
      await fs.promises.writeFile(filePath, Buffer.concat(chunks));

      // Upisivanje u bazu podataka
      try {
        await PdfSchema.create({
          title: newData.primcilj,
          pdf: fileName,
          idKlijenta: newData.id,
          datumKreir: new Date(),
        });
        res.json({
          status: "ok",
          message: "PDF je uspešno generisan i sačuvan.",
          fileName,
          mojPrompt: content_,
        });
      } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).json({
          status: "error",
          message: "Greška prilikom čuvanja u bazu.",
        });
      }
    }
  );
});

//
// const joke = z.object({
//   setup: z.string().describe("The setup of the joke"),
//   punchline: z.string().describe("The punchline to the joke"),
//   rating: z.number().optional().describe("How funny the joke is, from 1 to 10"),
// });

// // Kreiranje modela sa strukturiranim izlazom
// const structuredLlm = openai.withStructuredOutput(joke);

// // Middleware za generisanje šale
// app.use('/joke', async (req, res) => {
//   try {
//     // Pozivamo model da generišemo šalu o mačkama
//     const result = await structuredLlm.invoke("Tell me a joke about cats");

//     // Validacija rezultata pomoću Zod-a
//     const parsedResult = joke.parse(result); // Parsiranje rezultata sa zod validacijom

//     // Vraćamo uspešan odgovor sa šalom
//     res.json(parsedResult);  // Vraćamo strukturirani rezultat

//   } catch (error) {
//     // Ako dođe do greške tokom poziva modela ili validacije
//     console.error('Error generating joke:', error);
//     res.status(500).json({ error: 'An error occurred while generating the joke' });
//   }
// });

//Kreiranje obroka po danima
const MealSchema = z.object({
  opis: z.string(),
  sastojci: z.string(),
  instrukcije: z.string(),
  kalorije: z.number(),
  // cena: z.number(),
  nutritivna_vrednost: z.string(), //Added
  Makronutrijenti: z.object({
    Proteini: z.number(),
    Ugljeni_hidrati: z.number(),
    Masti: z.number(),
  }),
});

//Kreiranje dana
const generateDaySchema = (chosenObroci) => {
  const daySchemaDefinition = { dan: z.string() };

  if (chosenObroci.includes("doručak"))
    daySchemaDefinition.dorucak = MealSchema;
  if (chosenObroci.includes("užina1")) daySchemaDefinition.uzina1 = MealSchema;
  if (chosenObroci.includes("ručak")) daySchemaDefinition.rucak = MealSchema;
  if (chosenObroci.includes("užina2")) daySchemaDefinition.uzina2 = MealSchema;
  if (chosenObroci.includes("večera")) daySchemaDefinition.vecera = MealSchema;

  return z.object(daySchemaDefinition);
};

app.post("/generate-plan", async (req, res) => {
  const { brojDana, obroci } = req.body;

  if (!brojDana || typeof brojDana !== "number") {
    return res
      .status(400)
      .json({ message: "Molimo unesite validan broj dana." });
  }

  const validObroci = ["doručak", "užina1", "ručak", "užina2", "večera"];
  const chosenObroci =
    Array.isArray(obroci) &&
    obroci.every((obrok) => validObroci.includes(obrok))
      ? obroci
      : ["doručak", "užina1", "ručak", "užina2", "večera"];

  const obrociPrompt = chosenObroci
    .map((obrok) => {
      switch (obrok) {
        case "doručak":
          return "doručak";
        case "užina1":
          return "užina";
        case "ručak":
          return "ručak";
        case "užina2":
          return "druga užina";
        case "večera":
          return "večera";
        default:
          return obrok;
      }
    })
    .join(", ");

  const DaySchema = generateDaySchema(chosenObroci);
  const FullWeekSchema = z.object({
    days: z.array(DaySchema),
  });

  try {
    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "Ti si korisni nutricionista. Generiši plan ishrane u JSON formatu koristeći samo zadatu šemu. Nazivi dana treba da budu 'Dan 1', 'Dan 2', i tako dalje, a ne imena dana u nedelji.",
        },
        {
          role: "user",
          content: `Napravi plan ishrane za ${brojDana} dana sa sledećim obrocima: ${obrociPrompt}. Nemoj uključivati obroke koji nisu navedeni.`,
        },
      ],
      response_format: zodResponseFormat(FullWeekSchema, "mealPlan"),
    });

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
      console.log("Generisani plan ishrane:", message.parsed);
      res.json(message.parsed);
    } else {
      console.log("Odbijeno:", message.refusal);
      res.json({ message: "Odbijeno", refusal: message.refusal });
    }
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      status: "error",
      message: "Greška u generisanju plana ishrane.",
    });
  }
});

//Ovo radi samo ga optimizuj!
app.use("/op", async (req, res) => {
  const description = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Ti si asistent za planiranje ishrane." },
      {
        role: "user",
        content: `Kreiraj mi trodnevni plan ishrane sa ciljem Mršavljenje. Moja dnevna kalorijska vrednost iznosi 2566.3. Namirnice koje preferiram u ishrani: meso, mleko. Namirnice koje ne preferiram u ishrani: hleb.
        
        Struktura plana ishrane treba biti sledeća:
        - Naslov: Trodnevni Plan Ishrane za Mršavljenje
        - Uvod: Kratki uvodni tekst o planu ishrane 
        - Dan 1:
          - Doručak:
            - Opis: opis doručka
            - Sastojci: sastojci doručka
            - Instrukcije: instrukcije pripreme doručka
            - Kalorije: broj kalorija tog doručka
          - Užina 1:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Ručak:
            - Opis: opis ručka
            - Sastojci: sastojci ručka
            - Instrukcije: instrukcije pripreme ručka
            - Kalorije: broj kalorija te ručka
          - Užina 2:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Večera:
            - Opis: opis večere
            - Sastojci: sastojci večere
            - Instrukcije: instrukcije pripreme večere
            - Kalorije: broj kalorija te večere
            
        - Dan 2:
          - Doručak:
            - Opis: opis doručka
            - Sastojci: sastojci doručka
            - Instrukcije: instrukcije pripreme doručka
            - Kalorije: broj kalorija tog doručka
          - Užina 1:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Ručak:
            - Opis: opis ručka
            - Sastojci: sastojci ručka
            - Instrukcije: instrukcije pripreme ručka
            - Kalorije: broj kalorija te ručka
          - Užina 2:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Večera:
            - Opis: opis večere
            - Sastojci: sastojci večere
            - Instrukcije: instrukcije pripreme večere
            - Kalorije: broj kalorija te večere

        - Dan 3:
          - Doručak:
            - Opis: opis doručka
            - Sastojci: sastojci doručka
            - Instrukcije: instrukcije pripreme doručka
            - Kalorije: broj kalorija tog doručka
          - Užina 1:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Ručak:
            - Opis: opis ručka
            - Sastojci: sastojci ručka
            - Instrukcije: instrukcije pripreme ručka
            - Kalorije: broj kalorija te ručka
          - Užina 2:
            - Opis: opis užine
            - Sastojci: sastojci užine
            - Instrukcije: instrukcije pripreme užine
            - Kalorije: broj kalorija te užine
          - Večera:
            - Opis: opis večere
            - Sastojci: sastojci večere
            - Instrukcije: instrukcije pripreme večere
            - Kalorije: broj kalorija te večere

        - Zaključak: Završna motivacija za plan ishrane
        
        Svaki obrok treba da bude opisan detaljno, sa navedenim sastojcima, koracima za pripremu (instrukcijama), i tačnim brojem kalorija po obroku. Koristi tačno navedenu strukturu i stavi ključne reči kao 'Naslov:', 'Uvod:', 'Opis:', 'Sastojci:', 'Instrukcije:', 'Kalorije:' tačno u ovom formatu sa dvotačkom.
        Ne smeš menjati ovu strukturu ni redosled elemenata. Svaki obrok treba biti detaljan i uključivati tačan broj kalorija. Svaki deo mora biti tačno kao što je opisano.`,
      },
    ],
    max_tokens: 3500,
  });

  let content = description.choices[0].message.content;
  content = content.replace(/[#!&*ü!_?-]/g, ""); //Ovde sam dodao -

  console.log("DATA:", content);
  // Main meal plan schema
  const mealPlan = {
    naslov: "",
    uvod: "",
    dani: [],
    zakljucak: "",
  };

  // Parsing functions for each section
  function parseTitle(line) {
    if (line.startsWith("Naslov:")) {
      mealPlan.naslov = line.replace("Naslov:", "").trim();
    }
  }

  function parseIntroduction(line) {
    if (line.startsWith("Uvod:")) {
      mealPlan.uvod = line.replace("Uvod:", "").trim();
    }
  }

  function startNewDay(dayNumber) {
    return {
      dan: `Dan ${dayNumber}`,
      obroci: {
        dorucak: { opis: "", sastojci: [], instrukcije: "", kalorije: 0 },
        uzina1: { opis: "", sastojci: [], instrukcije: "", kalorije: 0 },
        rucak: { opis: "", sastojci: [], instrukcije: "", kalorije: 0 },
        uzina2: { opis: "", sastojci: [], instrukcije: "", kalorije: 0 },
        vecera: { opis: "", sastojci: [], instrukcije: "", kalorije: 0 },
      },
    };
  }

  function parseMealDetail(line, meal) {
    if (line.startsWith("Opis:")) {
      meal.opis = line.replace("Opis:", "").trim();
    } else if (line.startsWith("Sastojci:")) {
      meal.sastojci = line
        .replace("Sastojci:", "")
        .split(",")
        .map((item) => item.trim());
    } else if (line.startsWith("Instrukcije:")) {
      meal.instrukcije = line.replace("Instrukcije:", "").trim();
    } else if (line.startsWith("Kalorije:")) {
      meal.kalorije = parseInt(line.replace("Kalorije:", "").trim()) || 0;
    }
  }

  function parseConclusion(line) {
    if (line.startsWith("Zaključak:")) {
      mealPlan.zakljucak = line.replace("Zaključak:", "").trim();
    }
  }

  // Parsing the content line by line
  let currentDay = null;
  let currentMeal = null;

  const lines = content.split("\n").map((line) => line.trim());
  lines.forEach((line) => {
    parseTitle(line);
    parseIntroduction(line);

    if (line.startsWith("Dan")) {
      const dayNumber = mealPlan.dani.length + 1;
      currentDay = startNewDay(dayNumber);
      mealPlan.dani.push(currentDay);
      currentMeal = null;
    } else if (line.includes("Doručak:")) {
      currentMeal = currentDay.obroci.dorucak;
    } else if (line.includes("Užina 1:")) {
      currentMeal = currentDay.obroci.uzina1;
    } else if (line.includes("Ručak:")) {
      currentMeal = currentDay.obroci.rucak;
    } else if (line.includes("Užina 2:")) {
      currentMeal = currentDay.obroci.uzina2;
    } else if (line.includes("Večera:")) {
      currentMeal = currentDay.obroci.vecera;
    } else if (currentMeal) {
      parseMealDetail(line, currentMeal);
    }

    parseConclusion(line);
  });

  res.status(200).json({ planIshrane: mealPlan });
});

//
app.use("/ministest", async (req, res) => {
  res.send({ Test: "Success" });
});

//Holisticki pristup
const holPristupShema = z.object({
  fizickoZdravlje: z.string().min(1, "Fizičko zdravlje mora biti opisano"),
  zdraveNavike: z.string().min(1, "Zdrave navike moraju biti opisane"),
  preventivnaNega: z.string().min(1, "Preventivna nega mora biti opisana"),
  odrzavanjeBilansa: z.string().min(1, "Održavanje bilansa mora biti opisano"),
});

// Ruta za holistički pristup
app.get("/hol", async (req, res) => {
  try {
    const holPristupResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that provides detailed and clearly structured explanations on holistic approaches to health and wellness.",
        },
        {
          role: "user",
          content: `Molim te da pružiš jasan i organizovan opis holističkog pristupa zdravlju, podeljen u posebne odeljke:
                    1. Fizičko zdravlje: Kratak opis
                    2. Zdrave navike: Kratak opis
                    3. Preventivna nega: Kratak opis
                    4. Održavanje bilansa: Kratak opis
            Neka odgovori budu jasno strukturirani sa tačno definisanim odeljcima: 
            '1. Fizičko zdravlje:', 
            '2. Zdrave navike:', 
            '3. Preventivna nega:', 
            '4. Održavanje bilansa:' sa dvotačkom na kraju svakog naslova.`,
        },
      ],
    });

    // Generisani odgovor
    let odgovor = holPristupResult.choices[0].message.content;
    odgovor = odgovor.replace(/[#!&*ü!_?-@**]/g, "");

    // console.log("odgovor:", odgovor);

    // Provera da li su svi odeljci prisutni u odgovoru
    if (
      !odgovor.includes("1. Fizičko zdravlje:") ||
      !odgovor.includes("2. Zdrave navike:") ||
      !odgovor.includes("3. Preventivna nega:") ||
      !odgovor.includes("4. Održavanje bilansa:")
    ) {
      return res
        .status(400)
        .json({ error: "Odgovor nije u ispravnom formatu." });
    }

    //Defoltno ako nema defoltne vrenosti
    const defaultHol = {
      fizickoZdravlje:
        "Fizičko zdravlje se odnosi na dobrobit i funkcionalnost našeg tela. To uključuje stanje naših unutrašnjih organa, mišića, kostiju, kao i našu telesnu kondiciju i snagu. Holistički pristup fizičkom zdravlju prepoznaje da su svi ovi aspekti međusobno povezani i da su svi od suštinskog značaja za sveukupno zdravlje. To znači da se fokusiramo ne samo na lečenje simptoma, već i na razumijevanje i tretiranje uzroka.",
      zdraveNavike:
        "Zdrave navike su ponašanja koja često praktikujemo i koja pozitivno utiču na naše fizičko, emocionalno i mentalno zdravlje. To može uključivati redovnu fizičku aktivnost, uravnoteženu ishranu, dovoljno sna, hidrataciju, kao i izbegavanje štetnih navika poput pušenja ili prekomernog konzumiranja alkohola. Holistički pristup zdravim navikama prepoznaje da su sve ove aktivnosti povezane i da promena jedne navike može imati širok spektar uticaja na naše zdravlje.",
      preventivnaNega:
        "Preventivna nega je pristup zdravlju koji se fokusira na sprečavanje bolesti i stanja pre nego što se pojave, umesto da se bave samo njihovim lečenjem. To može uključivati redovne lekarske preglede, vakcinaciju, skrining za određene bolesti, kao i vođenje zdravog životnog stila. Holistički pristup prepoznaje važnost preventivne nege u održavanju dugoročnog zdravlja i dobrobiti.",
      odrzavanjeBilansa:
        "Održavanje bilansa odnosi se na pronalaženje ravnoteže između različitih aspekata našeg života, uključujući fizičko zdravlje, emocionalno blagostanje, socijalne odnose, duhovnost i rad. Holistički pristup održavanju bilansa prepoznaje da su svi ovi aspekti međusobno povezani i da promene u jednom aspektu mogu uticati na druge. To znači da se teži za ravnotežom u svim oblastima života, a ne samo u jednoj.",
    };

    // Podela odgovora u odgovarajuću strukturu
    const hol = {
      fizickoZdravlje:
        odgovor
          .split("1. Fizičko zdravlje:")[1]
          .split("2. Zdrave navike:")[0]
          .trim() || defaultHol.fizickoZdravlje,
      zdraveNavike:
        odgovor
          .split("2. Zdrave navike:")[1]
          .split("3. Preventivna nega:")[0]
          .trim() || defaultHol.zdraveNavike,
      preventivnaNega:
        odgovor
          .split("3. Preventivna nega:")[1]
          .split("4. Održavanje bilansa:")[0]
          .trim() || defaultHol.preventivnaNega,
      odrzavanjeBilansa:
        odgovor.split("4. Održavanje bilansa:")[1].trim() ||
        defaultHol.odrzavanjeBilansa,
    };

    // Validacija odgovora prema Zod shemi
    holPristupShema.parse(hol);

    console.log("odgovor: ", odgovor);

    // Slanje odgovora korisniku
    res.json({ hol });
  } catch (error) {
    // Ako se desi greška (npr. u validaciji ili pri pozivu OpenAI)
    res.status(500).json({
      error:
        error.message || "Došlo je do greške prilikom generisanja odgovora.",
    });
  }
});

//DODAJ JOS AKO TREBA
// 5. Emocionalno zdravlje: Kratak opis
// 6. Mentalno zdravlje: Kratak opis
// 7. Socijalno zdravlje: Kratak opis
// 8. Duhovno zdravlje: Kratak opis

//Ostali generisani hupiti
const planShema = z.object({
  // voda: z.string().min(1, "Plan za unos vode mora biti prisutan"),
  // spavanje: z.string().min(1, "Plan za spavanje mora biti prisutan"),
  // podrska: z.string().min(1, "Podrška imunološkom sistemu mora biti prisutna"),
  // plan: z.string().min(1, "Plan fizičke aktivnosti mora biti prisutan"),
  // uvod: z.string().min(1, "Uvod mora biti prisutan"),
  zakljucak: z.string().min(1, "Zaključak mora biti prisutan"),
});

//Defoltne vrednosti za kratke upite
const kratki = {
  voda: "Unos vode je ključan za pravilan rad i funkciju našeg tela. Stručnjaci preporučuju dnevni unos od oko 2 litre vode, iako to može varirati ovisno o individualnim potrebama, naporima i klimatskim uvjetima. Hidracija pomaže u reguliranju tjelesne temperature, podmazivanju zglobova, prenošenju hranjivih tvari do stanica i ispiranju otpadnih materija iz tijela. Nedostatak vode može dovesti do dehidracije, što može uzrokovati umor, glavobolju i brojne druge zdravstvene probleme. Stoga je važno obratiti pažnju na unos vode i paziti na znakove dehidracije. Voda se ne treba konzumirati samo kada smo žedni, već kontinuirano tijekom cijeloga dana.",
  spavanje:
    "Poboljšanje spavanja može dramatično utjecati na vaše opće blagostanje i kvalitetu života. Postojanje kvalitetnih rutina prije spavanja i stvaranje okoline pogodne za spavanje mogu pomoći u postizanju dubokog i korisnog sna. Ovo uključuje redukciju svjetlosti i buke, kao i osiguranje da je vaš krevet udoban i podržavajući. Također, važno je paziti na prehranu i unos kofeina, često vježbati te pokušati ići u krevet i buditi se u isto vrijeme svaki dan kako bi se regulirao cirkadijanski ritam. Dobar san može poboljšati koncentraciju, produktivnost i također igrati ključnu ulogu u regulaciji tjelesne težine i smanjenju rizika od bolesti.",
  podrska:
    "Imunološka podrška vrlo je važna za jačanje tjelesne obrane od raznih bolesti i infekcija. Održavanje snažnog imunološkog sustava zahtijeva ravnotežu pravilne prehrane, redovitog vježbanja, adekvatnog sna i manje stresa. Dodaci prehrani s vitaminima i mineralima poput vitamina C, D, E, cinka, selenija i drugih snažni su imunomodulatori. Također, probiotici mogu pružiti važnu podršku za imunološki sustav jer većina našeg imuniteta zapravo dolazi iz crijeva. Važno je posjetiti liječnika ili stručnjaka za prehranu prije početka bilo kakve prehrambene terapije.",
  plan: "Plan fizičke aktivnosti od vitalne je važnosti za održavanje dobrog zdravlja i forme. U idealnom slučaju, taj plan bi trebao uključivati različite aktivnosti koje se miješaju tijekom tjedna. Kardio trening, poput trčanja, vožnje biciklom ili brzog hodanja, obično se smatra osnovom bilo kojeg plana fizičke aktivnosti. Osim toga, trening snage, kao što je dizanje utega, može pomoći u izgradnji i održavanju mišićne mase. Fleksibilnost i balansirane vježbe, poput joge, mogu poboljšati koordinaciju i smanjiti rizik od ozljeda. Cilj je biti aktivan barem 30 minuta dnevno, većinom dana u tjednu.",
  uvod: "Nutritivni plan je prilagođeni program ishrane koji se sastavlja kako bi podržao specifične ciljeve pojedinca u pogledu zdravlja, fizičke aktivnosti i životnih navika. On uzima u obzir potrebe organizma za osnovnim nutrijentima – poput ugljenih hidrata, proteina, masti, vitamina i minerala – kako bi se postigao optimalan balans i poboljšalo opšte stanje zdravlja. Nutritivni plan može biti osmišljen za različite ciljne grupe, poput osoba koje žele da izgube težinu, povećaju mišićnu masu, poboljšaju energiju ili unaprede zdravlje srca. On se bazira na naučno potkrepljenim principima ishrane, s ciljem da pruži odgovarajuće količine hrane za postizanje održivih i dugoročnih zdravstvenih koristi.",
  zakljucak:
    "Nutritivni plan je ključan alat za postizanje i održavanje optimalnog zdravlja. Pravilno balansiran plan ishrane pomaže u poboljšanju fizičkog zdravlja, povećanju energije i smanjenju rizika od različitih bolesti. Prilagođen svakom pojedincu, nutricionistički plan može biti od pomoći u postizanju ciljeva poput mršavljenja, poboljšanja kondicije ili očuvanja opšteg blagostanja. Uz pravilnu edukaciju i primenu, nutricionistički plan postaje temelj zdravog načina života koji doprinosi dugoročnom fizičkom i mentalnom zdravlju.",
};

//================
// Definisanje Zod šeme za motivacioni uvod
const uvodSchema = z.object({
  prviPasus: z.string().min(1, "Prvi pasus je obavezan"),
  drugiPasus: z.string().min(1, "Drugi pasus je obavezan"),
});

// Za sad je ovde hadkodovano
const korisnik = {
  ime: "Marko Marković",
  datumRodjenja: "1985-06-15",
  visina: 180,
  tezina: 85,
  primcilj: "povećanje mišićne mase",
  speccilj: "dobiti 5 kg mišićne mase u narednih 3 meseca",
  motivacija: "želja da poboljša svoju fizičku spremnost i zdravlje",
};

//Samo uvod
app.get("/ostali", async (req, res) => {
  const uvodPrompt = `
    Napiši motivacioni uvod za ${korisnik.ime}, rođenog ${
    korisnik.datumRodjenja
  }, koji ima ${
    new Date().getFullYear() - new Date(korisnik.datumRodjenja).getFullYear()
  } godina, visinu ${korisnik.visina} cm i trenutnu težinu ${
    korisnik.tezina
  } kg. Njegov/a primarni cilj ishrane je ${
    korisnik.primcilj
  }, sa specifičnim ciljem da ${
    korisnik.speccilj
  }. Korisnik je motivisan da promeni svoje navike zato što ${
    korisnik.motivacija
  }.
    Prvi pasus treba da bude bogat, detaljan, sa puno informacija i inspiracije. Započni ga sa motivacijom korisnika, navodeći specifične aspekte njegovog napretka. Koristi puno detalja i proširi odgovor, koristeći primere i detalje o njegovim naporima da poveća mišićnu masu. Neka odgovor bude što duži, sa puno entuzijazma, podrške i divljenja.
    Drugi pasus neka naglasi važnost dugoročnog održavanja zdravih navika i koristi koje će korisnik imati, poput poboljšanja zdravstvenog stanja, povećane energije i boljeg kvaliteta života. Uvod treba da bude pisan u drugom licu jednine, obraćajući se direktno korisniku, i treba da ima podržavajući i inspirativan ton.
  `;

  try {
    const uvodResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: uvodPrompt }],
      max_tokens: 1500,
      temperature: 0.9, // Maštovitiji odgovor
      top_p: 1, // Veci broj reci
    });

    // Prečišćavanje rezultata
    let uvod =
      uvodResult.choices[0]?.message?.content?.trim() ||
      "Početak nije bio uspešan.";
    uvod = uvod.replace(/[#!&*ü!_?-@**]/g, ""); // Prečišćavanje neželjenih karaktera

    // Podela generisanog uvoda na pasuse
    const [prviPasus, drugiPasus] = uvod
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Validacija pomoću Zod-a
    const parsedUvod = uvodSchema.safeParse({
      prviPasus: prviPasus,
      drugiPasus: drugiPasus,
    });

    if (parsedUvod.success) {
      // Ako je validacija uspešna, šaljemo odgovor
      res.json({
        prviPasus: parsedUvod.data.prviPasus,
        drugiPasus: parsedUvod.data.drugiPasus,
      });
    } else {
      // Ako postoji greška u validaciji
      res.status(400).json({
        error: "Greška u generisanju uvoda",
        details: parsedUvod.error.errors,
      });
    }
  } catch (error) {
    // Ako dođe do greške tokom API poziva
    res.status(500).json({
      error: "Došlo je do greške pri generisanju motivacionog uvoda.",
      details: error.message,
    });
  }
});
//================

//Simple PDF
app.use("/test", async (req, res) => {
  try {
    const pdfDoc = new PDFDocument();

    // Registrujte fontove
    pdfDoc.registerFont(
      "OpenSans_Condensed-Regular",
      "./fonts/OpenSans_Condensed-Regular.ttf"
    );
    pdfDoc.registerFont(
      "OpenSans_Condensed-Bold",
      "./fonts/OpenSans_Condensed-Bold.ttf"
    );
    pdfDoc.font("OpenSans_Condensed-Regular"); // Postavite default font na regular

    // Novi objekat mydata
    const mydata = {
      odgovor: {
        voda: "Unos vode ključan je za pravilno funkcioniranje tijela i održavanje zdravlja. Tijelo ljudi se sastoji od oko 60% vode i svakodnevno gubi dio te tekućine kroz znoj, urin i disanje. Preporučeni dnevni unos vode varira, ali opća preporuka je oko 2 litre dnevno, odnosno osam čaša. Unos vode posebno treba povećati tijekom vježbanja ili kod visokih temperatura kada je gubitak vode kroz znojenje veći. Redoviti unos vode pomaže u probavi, regulaciji tjelesne temperature, podmazivanju zglobova i održavanju zdrave kože. Poremećaji u unosu vode, poput dehidracije, mogu prouzročiti ozbiljne zdravstvene probleme.",
        spavanje:
          "Poboljšanje kvalitete spavanja može značajno utjecati na naše ukupno zdravlje i dobrobit. Nedostatak kvalitetnog sna može dovesti do problema kao što su povećani rizik od kroničnih bolesti, pad koncentracije, umora i raspoloženja. Nekoliko je načina na koje možete poboljšati svoj san. Redovita tjelesna aktivnost može pomoći u regulaciji vaših bioritama i promicanju dubljeg i opuštenijeg sna. Također, izbjegavanje alkohola, kofeina i teške hrane nekoliko sati prije spavanja može poboljšati kvalitetu sna. Dodatno, održavanje redovitog rasporeda spavanja, čak i vikendom, može pomoći u regulaciji unutarnjeg biološkog sata. Naposljetku, optimiziranje vašeg okruženja za spavanje, uključujući udoban madrac i jastuk, tamnu, hladnu i tiho sobu mogu doslovno napraviti svijet razlike.",
        podrska:
          "Imunološka podrška odnosi se na poticanje i jačanje našeg imunološkog sustava koji je zadužen za obranu tijela od različitih bolesti. To se može postići uravnoteženom prehranom bogatom vitaminima i mineralima, redovitom tjelesnom aktivnošću, dovoljnom količinom sna i izbjegavanjem stresnih situacija. Također, postoji niz suplemenata i biljnih pripravaka koji se koriste za dodatno jačanje imunološkog sustava. Pravilna imunološka podrška ključna je za očuvanje i unapređenje općeg zdravstvenog stanja.",
        plan: "Fizička aktivnost ima brojne koristi za tijelo i um, doprinoseći boljem zdravlju i svakodnevnom raspoloženju. Plan fizičke aktivnosti stoga bi trebao biti dio naše svakodnevnice. Kroz plan, cilj je postići pravilnu ravnotežu između aerobnih, anaerobnih i fleksibilnosti vježbi. \n\nPonedjeljkom se možete odlučiti za trčanje ili bicikliranje kako biste povećali svoju izdržljivost kroz kardio vježbe. Utorkom biste mogli koristiti utege za jačanje glavnih mišićnih skupina. U srijedu može biti dan za odmor. U četvrtak se može izvesti raznovrsna serija pliometrijskih vježbi za razvoj snage i agilnosti, a petak odabrati za pilates ili jogu za razvoj fleksibilnosti i koncentracije. Vikend može biti posvećen aktivnostima na otvorenom poput planinarenja ili plivanja.\n\nIstaknite da je ovo samo primjer, zajedno s pravilnom prehranom i dovoljno sna, vaš plan fizičke aktivnosti treba biti prilagođen vašim potrebama, mogućnostima i ciljevima kako biste ostali motivirani i vidjeli kontinuirani napredak.",
        uvod: "Nutritivni plan je prilagođeni program ishrane koji se sastavlja kako bi podržao specifične ciljeve pojedinca u pogledu zdravlja, fizičke aktivnosti i životnih navika. On uzima u obzir potrebe organizma za osnovnim nutrijentima – poput ugljenih hidrata, proteina, masti, vitamina i minerala – kako bi se postigao optimalan balans i poboljšalo opšte stanje zdravlja. Nutritivni plan može biti osmišljen za različite ciljne grupe, poput osoba koje žele da izgube težinu, povećaju mišićnu masu, poboljšaju energiju ili unaprede zdravlje srca. On se bazira na naučno potkrepljenim principima ishrane, s ciljem da pruži odgovarajuće količine hrane za postizanje održivih i dugoročnih zdravstvenih koristi.",
        zakljucak:
          " Nutritivni plan je ključan alat za postizanje i održavanje optimalnog zdravlja. Pravilno balansiran plan ishrane pomaže u poboljšanju fizičkog zdravlja, povećanju energije i smanjenju rizika od različitih bolesti. Prilagođen svakom pojedincu, nutricionistički plan može biti od pomoći u postizanju ciljeva poput mršavljenja, poboljšanja kondicije ili očuvanja opšteg blagostanja. Uz pravilnu edukaciju i primenu, nutricionistički plan postaje temelj zdravog načina života koji doprinosi dugoročnom fizičkom i mentalnom zdravlju.",
      },
      hol: {
        fizickoZdravlje:
          "Fizičko zdravlje je osnovni aspekt holističkog pristupa i odnosi se na stanje tela i njegovu sposobnost da funkcioniše optimalno. Uključuje pravilnu ishranu, redovnu fizičku aktivnost, dovoljno sna i održavanje zdrave telesne težine. Fizičko zdravlje podrazumeva i redovne lekarske preglede kako bi se pratile vitalne funkcije i rano otkrili potencijalni zdravstveni problemi.",
        zdraveNavike:
          "Zdrave navike igraju ključnu ulogu u održavanju opšteg blagostanja. One obuhvataju usvajanje dnevnih rutina koje podržavaju zdravlje, kao što su uravnotežena ishrana bogata voćem i povrćem, adekvatna hidratacija, redovno vežbanje, tehnike opuštanja poput meditacije ili joge, i izbegavanje štetnih supstanci poput alkohola i duvana. Razvijanje ovih navika doprinosi dugoročnoj vitalnosti i smanjenju rizika od hroničnih bolesti.",
        preventivnaNega:
          "Preventivna nega je ključni aspekt holističkog pristupa i uključuje sve mere koje se preduzimaju kako bi se sprečio razvoj bolesti ili otkrili zdravstveni problemi u ranoj fazi. To podrazumeva vakcinacije, redovne zdravstvene preglede, skrining testove, kao i edukaciju o zdravim životnim stilovima. Cilj preventivne nege je da se smanji potreba za lečenjem i poboljša kvalitet života.",
        odrzavanjeBilansa:
          "Održavanje bilansa u holističkom pristupu znači postizanje i održavanje harmonije između različitih aspekata života — fizičkog, mentalnog, emocionalnog i duhovnog. To podrazumeva upravljanje stresom, balansiranje između posla i privatnog života, negovanje odnosa sa drugima i rad na ličnom razvoju. Kada su svi ovi aspekti u ravnoteži, osoba je sposobnija da se nosi sa izazovima i živi ispunjenim životom.",
      },
      message: {
        days: [
          {
            dan: "Dan 1",
            rucak: {
              opis: "Grilovana piletina sa povrćem",
              sastojci: "Pileći file...",
              instrukcije: "Zagrejte gril tiganj...",
              kalorije: 450,
            },
            uzina2: {
              opis: "Jogurt sa orasima",
              sastojci: "Grčki jogurt...",
              instrukcije: "Pomešajte grčki jogurt...",
              kalorije: 250,
            },
            vecera: {
              opis: "Losos na žaru sa spanaćem",
              sastojci: "Filet lososa...",
              instrukcije: "Zagrejte tiganj...",
              kalorije: 500,
            },
          },
          {
            dan: "Dan 2",
            rucak: {
              opis: "Quinoa salata sa avokadom",
              sastojci: "Quinoa...",
              instrukcije: "Skuvajte quinou...",
              kalorije: 550,
            },
            uzina2: {
              opis: "Smoothie od banana",
              sastojci: "Banana...",
              instrukcije: "Sve sastojke stavite u blender...",
              kalorije: 300,
            },
            vecera: {
              opis: "Ćuretina u sosu",
              sastojci: "Mlevena ćuretina...",
              instrukcije: "Na tiganju sa malo ulja...",
              kalorije: 480,
            },
          },
        ],
      },
    };

    // Dodaj uvodni tekst
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Nutricionistički izveštaj", { align: "center" });
    pdfDoc.moveDown(2);
    pdfDoc
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.odgovor.uvod);
    pdfDoc.addPage();

    // Dodaj obroke po danima, svaki na zasebnoj stranici u obliku tabele
    mydata.message.days.forEach((day) => {
      pdfDoc.fontSize(14).font("OpenSans_Condensed-Bold").text(day.dan);
      pdfDoc.moveDown(1);

      // Pozicije i širine kolona tabele
      const startX = 50;
      const startY = pdfDoc.y;
      const columnWidths = [80, 150, 150, 100, 60];
      const rowHeight = 60;

      // Dodaj zaglavlja kolona
      const headers = ["Obrok", "Opis", "Sastojci", "Instrukcije", "Kalorije"];
      headers.forEach((header, index) => {
        pdfDoc
          .rect(
            startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
            startY,
            columnWidths[index],
            rowHeight / 2
          )
          .stroke();
        pdfDoc
          .font("OpenSans_Condensed-Bold")
          .fontSize(10)
          .text(
            header,
            startX +
              columnWidths.slice(0, index).reduce((a, b) => a + b, 0) +
              5,
            startY + 5,
            { width: columnWidths[index] - 10, align: "center" }
          );
      });

      // Crtanje linije ispod zaglavlja
      pdfDoc
        .moveTo(startX, startY + rowHeight / 2)
        .lineTo(
          startX + columnWidths.reduce((a, b) => a + b, 0),
          startY + rowHeight / 2
        )
        .stroke();

      // Dodaj redove za svaki obrok
      let currentY = startY + rowHeight / 2;
      ["rucak", "uzina2", "vecera"].forEach((mealType) => {
        const meal = day[mealType];
        if (meal) {
          // Dodaj ćelije u redovima
          pdfDoc.rect(startX, currentY, columnWidths[0], rowHeight).stroke();
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(
              mealType.charAt(0).toUpperCase() + mealType.slice(1),
              startX + 5,
              currentY + 5
            );

          pdfDoc
            .rect(
              startX + columnWidths[0],
              currentY,
              columnWidths[1],
              rowHeight
            )
            .stroke();
          pdfDoc.text(meal.opis, startX + columnWidths[0] + 5, currentY + 5, {
            width: columnWidths[1] - 10,
          });

          pdfDoc
            .rect(
              startX + columnWidths[0] + columnWidths[1],
              currentY,
              columnWidths[2],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.sastojci,
            startX + columnWidths[0] + columnWidths[1] + 5,
            currentY + 5,
            { width: columnWidths[2] - 10 }
          );

          pdfDoc
            .rect(
              startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
              currentY,
              columnWidths[3],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.instrukcije,
            startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
            currentY + 5,
            { width: columnWidths[3] - 10 }
          );

          pdfDoc
            .rect(
              startX +
                columnWidths[0] +
                columnWidths[1] +
                columnWidths[2] +
                columnWidths[3],
              currentY,
              columnWidths[4],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.kalorije.toString(),
            startX +
              columnWidths[0] +
              columnWidths[1] +
              columnWidths[2] +
              columnWidths[3] +
              5,
            currentY + 5,
            { width: columnWidths[4] - 10, align: "center" }
          );

          currentY += rowHeight;
        }
      });

      pdfDoc.addPage();
    });

    // Dodaj sekciju "Fizičko zdravlje" i druge iz holističkog pristupa
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Fizičko zdravlje");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.hol.fizickoZdravlje);
    pdfDoc.addPage();

    Object.entries(mydata.hol).forEach(([title, content]) => {
      if (title !== "fizickoZdravlje") {
        pdfDoc
          .fontSize(18)
          .font("OpenSans_Condensed-Bold")
          .text(
            title.charAt(0).toUpperCase() +
              title.slice(1).replace(/([A-Z])/g, " $1")
          );
        pdfDoc
          .moveDown(1)
          .fontSize(12)
          .font("OpenSans_Condensed-Regular")
          .text(content);
        pdfDoc.addPage();
      }
    });

    // Dodaj zaključak
    pdfDoc.fontSize(18).font("OpenSans_Condensed-Bold").text("Zaključak");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.odgovor.zakljucak);

    // Kreirajte PDF i sačuvajte ga
    const fileName = `Nutricionisticki_Izvestaj_${Date.now()}_${Math.floor(
      Math.random() * 100000000000
    )}.pdf`;
    const filePath = path.join(__dirname, "files", fileName);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", async () => {
      await fs.promises.writeFile(filePath, Buffer.concat(chunks));

      // Snimanje u bazu podataka
      try {
        await PdfSchema.create({
          title: "Nutricionistički Izveštaj",
          pdf: fileName,
          path: filePath,
        });
        console.log("PDF report saved successfully.");
        res.download(filePath);
      } catch (err) {
        console.error("Error saving PDF to database:", err);
        res.status(500).send("Error saving PDF report.");
      }
    });

    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});

//Formatiranje vremena za pdf
function getCurrentTime() {
  let now = new Date();

  now.setUTCHours(now.getUTCHours() + 1);

  let hours = now.getUTCHours();
  let minutes = now.getUTCMinutes();
  let seconds = now.getUTCSeconds();

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${hours}:${minutes}:${seconds}`;
}

//Formatiranje datuma za pdf
// function formatDate(date) {
//   const day = String(date.getDate()).padStart(2, "0");  19.11.2024
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();

//   return `${day}-${month}-${year}`; klijentData:
// }

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}-${milliseconds}`;
}

//Proveravamo da li primarni cilj ima razmak
function replaceSpacesWithUnderscore(inputString) {
  if (inputString.includes(" ")) {
    return inputString.replace(/\s+/g, "_");
  }
  return inputString;
}

//Test - sa fetchevima
app.use("/test1", async (req, res) => {
  let { brojDana, obroci, data_ } = req.body;

  let brojDanaInt = Number(brojDana);
  const pdfDoc = new PDFDocument();

  // Registrujte fontove
  pdfDoc.registerFont(
    "OpenSans_Condensed-Regular",
    "./fonts/OpenSans_Condensed-Regular.ttf"
  );
  pdfDoc.registerFont(
    "OpenSans_Condensed-Bold",
    "./fonts/OpenSans_Condensed-Bold.ttf"
  );
  pdfDoc.font("OpenSans_Condensed-Regular"); // Postavite default font na regular

  // Novi objekat mydata
  try {
    // prompt - uvod
    const uvodResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki uvodni text o ishrani sa primarnim ciljem: ${data_.primcilj}`,
        },
      ],
      max_tokens: 1000,
    });
    let uvod = uvodResult.choices[0]?.message?.content?.trim() || kratki.uvod;
    uvod = uvod.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - zakljucak
    const zakljucakResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki zaključak text o ishrani sa primarnim ciljem: ${data_.primcilj}`,
        },
      ],
      max_tokens: 1000,
    });
    let zakljucak =
      zakljucakResult.choices[0]?.message?.content?.trim() || kratki.zakljucak;
    zakljucak = zakljucak.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - plan fizicke aktivnosti
    const planFizAktResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o planu fizičke aktivnosti",
        },
      ],
      max_tokens: 1000,
    });
    let planFizAkt =
      planFizAktResult.choices[0]?.message?.content?.trim() || kratki.plan;
    planFizAkt = planFizAkt.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('planFizAkt:', planFizAkt);

    // prompt - imunološka podrška
    const podrzkaImunResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki tekst o imunološku podršku",
        },
      ],
      max_tokens: 1000,
    });
    let podrzkaImun =
      podrzkaImunResult.choices[0]?.message?.content?.trim() || kratki.podrska;
    podrzkaImun = podrzkaImun.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('podrzkaImun:', podrzkaImun);

    // prompt - savet za spavanje
    const spavanjeSavetResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o poboljšanje spavanja",
        },
      ],
      max_tokens: 1000,
    });
    let spavanjeSavet =
      spavanjeSavetResult.choices[0]?.message?.content?.trim() ||
      kratki.spavanje;
    spavanjeSavet = spavanjeSavet.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('spavanjeSavet:', spavanjeSavet);

    // prompt - preporuka za unos vode
    const prepVodaResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: "Kreiraj mi kratki text o unos vode" },
      ],
      max_tokens: 1000,
    });
    let prepVoda =
      prepVodaResult.choices[0]?.message?.content?.trim() || kratki.voda;
    prepVoda = prepVoda.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('prepVoda:', prepVoda);

    // Kreiranje odgovora
    const odgovor = {
      voda: prepVoda,
      spavanje: spavanjeSavet,
      podrska: podrzkaImun,
      plan: planFizAkt,
      uvod: uvod,
      zakljucak: zakljucak,
    };

    //Za ostale upite
    planShema.parse(odgovor);

    //Za dane
    if (!brojDanaInt || typeof brojDanaInt !== "number") {
      return res
        .status(400)
        .json({ message: "Molimo unesite validan broj dana." });
    }

    const validObroci = ["doručak", "užina1", "ručak", "užina2", "večera"];
    const chosenObroci =
      Array.isArray(obroci) &&
      obroci.every((obrok) => validObroci.includes(obrok))
        ? obroci
        : ["doručak", "užina1", "ručak", "užina2", "večera"];

    ["doručak", "užina", "ručak", "užina", "večera"];

    const obrociPrompt = chosenObroci
      .map((obrok) => {
        switch (obrok) {
          case "doručak":
            return "doručak";
          case "užina1":
            return "užina";
          case "ručak":
            return "ručak";
          case "užina2":
            return "druga užina";
          case "večera":
            return "večera";
          default:
            return obrok;
        }
      })
      .join(", ");

    const DaySchema = generateDaySchema(chosenObroci);
    const FullWeekSchema = z.object({
      days: z.array(DaySchema),
    });
    //- Obrok treba da sadrži realne i dostupne namirnice iz srbije.
    console.log("Ukupna kalorijska vrednost: ", data_.ukupnaKalVred);
    console.log("Tdee: ", data_.tdee);

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      // messages: [
      //   {
      //     role: "system",
      //     content: "Ti si korisni nutricionista. Generiši plan ishrane u JSON formatu koristeći samo zadatu šemu. Nazivi dana treba da budu 'Dan 1', 'Dan 2', i tako dalje, a ne imena dana u nedelji.",
      //   },
      //   {
      //     role: "user",
      //     content: `Napravi plan ishrane za ${brojDanaInt} dana sa sledećim obrocima: ${obrociPrompt}. Primarni cilj je ${data_.primcilj}, moja ukupna kalorijska vrednost unosa hrane treba da iznosi tačno ${data_.ukupnaKalVred} kcal za taj dan, naminice koje preferiram u ishrani: ${data_.voljeneNamirnice}, naminice koje ne preferiram u ishrani: ${data_.neVoljeneNamirnice}. Nemoj uključivati obroke koji nisu navedeni.`,
      //   },
      // ],
      messages: [
        {
          role: "system",
          content: `
              Ti si nutricionista specijalizovan za precizne planove ishrane. Tvoja odgovornost je da generišeš plan ishrane u JSON formatu koristeći samo zadatu šemu.
              
              Pravila:
              - Nemoj da raspodelis kalorijsku vrednost ravnomerno između obroka.
              - Koristi samo zadate namirnice i izbegavaj isključene namirnice.
              - Nazivi dana treba da budu 'Dan 1', 'Dan 2', itd., bez imena dana u nedelji.
              - Za svaki obrok navedi tačnu kalorijsku vrednost.
              `,
        },
        {
          role: "user",
          content: `
              Napravi plan ishrane za ${brojDanaInt} dana sa sledećim obrocima: ${obrociPrompt}.
              
              Primarni cilj: ${data_.primcilj}.
              Ukupna kalorijska vrednost: ${data_.ukupnaKalVred} kcal po danu.
              Preferirane namirnice: ${data_.voljeneNamirnice}.
              Izbegavati sledeće namirnice: ${data_.neVoljeneNamirnice}.
              
              Svi obroci moraju imati precizne kalorijske vrednosti koje doprinose ukupnom dnevnom unosu kalorija. Ne uključuj obroke koji nisu navedeni.
              `,
        },
      ],
      response_format: zodResponseFormat(FullWeekSchema, "mealPlan"),
    });

    let message = completion.choices[0]?.message.parsed; //OVDE MOZDA PUKNE! ZBOG KARAKTERA
    // message = message.replace(/[#!&*ü!_?-@**]/g, "");  //OVDE

    // FullWeekSchema.parse(hol);

    //Za holisticki pristup
    const holPristupResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that provides detailed and clearly structured explanations on holistic approaches to health and wellness.",
        },
        {
          role: "user",
          content: `Molim te da pružiš jasan i organizovan opis holističkog pristupa zdravlju, podeljen u posebne odeljke:
                      1. Fizičko zdravlje: Kratak opis
                      2. Zdrave navike: Kratak opis
                      3. Preventivna nega: Kratak opis
                      4. Održavanje bilansa: Kratak opis
              Neka odgovori budu jasno strukturirani sa tačno definisanim odeljcima: 
              '1. Fizičko zdravlje:', 
              '2. Zdrave navike:', 
              '3. Preventivna nega:', 
              '4. Održavanje bilansa:' sa dvotačkom na kraju svakog naslova.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Generisani odgovor
    let odgovor1 = holPristupResult.choices[0].message.content;
    odgovor1 = odgovor1.replace(/[#!&*ü!_?-@**]/g, "");

    // Provera da li su svi odeljci prisutni u odgovoru
    if (
      !odgovor1.includes("1. Fizičko zdravlje:") ||
      !odgovor1.includes("2. Zdrave navike:") ||
      !odgovor1.includes("3. Preventivna nega:") ||
      !odgovor1.includes("4. Održavanje bilansa:")
    ) {
      return res
        .status(400)
        .json({ error: "Odgovor nije u ispravnom formatu." });
    }

    //Defoltno ako nema defoltne vrenosti
    const defaultHol = {
      fizickoZdravlje:
        "Fizičko zdravlje se odnosi na dobrobit i funkcionalnost našeg tela. To uključuje stanje naših unutrašnjih organa, mišića, kostiju, kao i našu telesnu kondiciju i snagu. Holistički pristup fizičkom zdravlju prepoznaje da su svi ovi aspekti međusobno povezani i da su svi od suštinskog značaja za sveukupno zdravlje. To znači da se fokusiramo ne samo na lečenje simptoma, već i na razumijevanje i tretiranje uzroka.",
      zdraveNavike:
        "Zdrave navike su ponašanja koja često praktikujemo i koja pozitivno utiču na naše fizičko, emocionalno i mentalno zdravlje. To može uključivati redovnu fizičku aktivnost, uravnoteženu ishranu, dovoljno sna, hidrataciju, kao i izbegavanje štetnih navika poput pušenja ili prekomernog konzumiranja alkohola. Holistički pristup zdravim navikama prepoznaje da su sve ove aktivnosti povezane i da promena jedne navike može imati širok spektar uticaja na naše zdravlje.",
      preventivnaNega:
        "Preventivna nega je pristup zdravlju koji se fokusira na sprečavanje bolesti i stanja pre nego što se pojave, umesto da se bave samo njihovim lečenjem. To može uključivati redovne lekarske preglede, vakcinaciju, skrining za određene bolesti, kao i vođenje zdravog životnog stila. Holistički pristup prepoznaje važnost preventivne nege u održavanju dugoročnog zdravlja i dobrobiti.",
      odrzavanjeBilansa:
        "Održavanje bilansa odnosi se na pronalaženje ravnoteže između različitih aspekata našeg života, uključujući fizičko zdravlje, emocionalno blagostanje, socijalne odnose, duhovnost i rad. Holistički pristup održavanju bilansa prepoznaje da su svi ovi aspekti međusobno povezani i da promene u jednom aspektu mogu uticati na druge. To znači da se teži za ravnotežom u svim oblastima života, a ne samo u jednoj.",
    };

    // Podela odgovora u odgovarajuću strukturu
    const hol = {
      fizickoZdravlje:
        odgovor1
          .split("1. Fizičko zdravlje:")[1]
          .split("2. Zdrave navike:")[0]
          .trim() || defaultHol.fizickoZdravlje,
      zdraveNavike:
        odgovor1
          .split("2. Zdrave navike:")[1]
          .split("3. Preventivna nega:")[0]
          .trim() || defaultHol.zdraveNavike,
      preventivnaNega:
        odgovor1
          .split("3. Preventivna nega:")[1]
          .split("4. Održavanje bilansa:")[0]
          .trim() || defaultHol.preventivnaNega,
      odrzavanjeBilansa:
        odgovor1.split("4. Održavanje bilansa:")[1].trim() ||
        defaultHol.odrzavanjeBilansa,
    };

    // Validacija odgovora prema Zod shemi
    holPristupShema.parse(hol);

    let mydata = {
      odgovor,
      hol,
      message,
    };
    // let data_ = { id, tezina, visina, pol, primcilj, specilj, godine, dijagnoza, ucestBr, navikeUish, namirnice, voljeneNamirnice, neVoljeneNamirnice, ukupnaKalVred, selectedValueBrDana, tdee, bmi, kuk,vrat,struk,motiv,nivoAkt,vrstaFiz,alerg,pus,alk,datumRodjenja }
    // Dodaj metadata
    pdfDoc
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(`${data_?.ime || ""} ${data_?.prezime || ""}`, { x: 10, y: 30 })
      .text(`TDEE:${data_?.tdee || ""} kcal/dan`, { x: 10, y: 50 })
      .text(`BMI:${data_?.bmi || ""} kg/m2`, { x: 10, y: 70 })
      .text(
        `Ukupna kalorijska vrednost:${data_?.ukupnaKalVred || ""} kcal/dan`,
        { x: 10, y: 90 }
      );
    // .text(`BMR:${data_?.bmrValue || ""} kcal/dan`, { x: 10, y: 90 });

    // Dodaj sliku na desnoj strani
    pdfDoc.image("./public/logoo.png", 500, 50, { width: 50, height: 50 }); // Slika pozicionirana na desnoj strani (x: 500 je približno desna ivica)
    pdfDoc.moveDown(1);

    // Dodaj hadkodovani naslov
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Nutricionistički izveštaj", { align: "center" });
    pdfDoc.moveDown(1);
    // Dodaj uvodni tekst
    pdfDoc
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.odgovor.uvod);
    pdfDoc.addPage();

    // Dodaj obroke po danima, svaki na zasebnoj stranici u obliku tabele
    mydata.message.days.forEach((day) => {
      pdfDoc.fontSize(14).font("OpenSans_Condensed-Bold").text(day.dan);
      pdfDoc.moveDown(1);

      // Pozicije i širine kolona tabele
      const startX = 50;
      const startY = pdfDoc.y;
      const columnWidths = [80, 150, 150, 100, 60];
      const rowHeight = 60;

      // Dodaj zaglavlja kolona
      const headers = ["Obrok", "Opis", "Sastojci", "Instrukcije", "Kalorije"];
      headers.forEach((header, index) => {
        pdfDoc
          .rect(
            startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
            startY,
            columnWidths[index],
            rowHeight / 2
          )
          .stroke();
        pdfDoc
          .font("OpenSans_Condensed-Bold")
          .fontSize(10)
          .text(
            header,
            startX +
              columnWidths.slice(0, index).reduce((a, b) => a + b, 0) +
              5,
            startY + 5,
            { width: columnWidths[index] - 10, align: "center" }
          );
      });

      // Crtanje linije ispod zaglavlja
      pdfDoc
        .moveTo(startX, startY + rowHeight / 2)
        .lineTo(
          startX + columnWidths.reduce((a, b) => a + b, 0),
          startY + rowHeight / 2
        )
        .stroke();

      // Dodaj redove za svaki obrok
      let currentY = startY + rowHeight / 2;
      Object.keys(day).forEach((mealType) => {
        if (mealType !== "dan") {
          const meal = day[mealType];
          pdfDoc.rect(startX, currentY, columnWidths[0], rowHeight).stroke();
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(
              mealType.charAt(0).toUpperCase() + mealType.slice(1),
              startX + 5,
              currentY + 5
            );

          pdfDoc
            .rect(
              startX + columnWidths[0],
              currentY,
              columnWidths[1],
              rowHeight
            )
            .stroke();
          pdfDoc.text(meal.opis, startX + columnWidths[0] + 5, currentY + 5, {
            width: columnWidths[1] - 10,
          });

          pdfDoc
            .rect(
              startX + columnWidths[0] + columnWidths[1],
              currentY,
              columnWidths[2],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.sastojci,
            startX + columnWidths[0] + columnWidths[1] + 5,
            currentY + 5,
            { width: columnWidths[2] - 10 }
          );

          pdfDoc
            .rect(
              startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
              currentY,
              columnWidths[3],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.instrukcije,
            startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
            currentY + 5,
            { width: columnWidths[3] - 10 }
          );

          pdfDoc
            .rect(
              startX +
                columnWidths[0] +
                columnWidths[1] +
                columnWidths[2] +
                columnWidths[3],
              currentY,
              columnWidths[4],
              rowHeight
            )
            .stroke();
          pdfDoc.text(
            meal.kalorije.toString(),
            startX +
              columnWidths[0] +
              columnWidths[1] +
              columnWidths[2] +
              columnWidths[3] +
              5,
            currentY + 5,
            { width: columnWidths[4] - 10, align: "center" }
          );

          currentY += rowHeight;
        }
      });

      pdfDoc.addPage();
    });

    // Dodaj sekciju "Fizičko zdravlje" i druge iz holističkog pristupa
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Fizičko zdravlje");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.hol.fizickoZdravlje);
    pdfDoc.addPage();

    Object.entries(mydata.hol).forEach(([title, content]) => {
      if (title !== "fizickoZdravlje") {
        pdfDoc
          .fontSize(18)
          .font("OpenSans_Condensed-Bold")
          .text(
            title.charAt(0).toUpperCase() +
              title.slice(1).replace(/([A-Z])/g, " $1")
          );
        pdfDoc
          .moveDown(1)
          .fontSize(12)
          .font("OpenSans_Condensed-Regular")
          .text(content);
        pdfDoc.addPage();
      }
    });

    // Dodaj zaključak
    pdfDoc.fontSize(18).font("OpenSans_Condensed-Bold").text("Zaključak");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.odgovor.zakljucak);

    // Kreirajte PDF i sačuvajte ga
    const fileName = `Nutricionisticki_Izvestaj_${Date.now()}_${Math.floor(
      Math.random() * 100000000000
    )}.pdf`; //
    const filePath = path.join(__dirname, "files", fileName);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", async () => {
      await fs.promises.writeFile(filePath, Buffer.concat(chunks));

      // Snimanje u bazu podataka
      const today = new Date();
      const formattedDate = today.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); //Za danasnji dan

      const today1 = new Date();
      today1.setDate(today1.getDate() + 1); // Dodajemo jedan dan
      const formattedDatePlus1 = today1.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const todayKraj = new Date();
      todayKraj.setDate(todayKraj.getDate() + data_.selectedValueBrDana + 1); // Dodajemo izabrani broj dana
      const formattedDateKraj = todayKraj.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      let klijentData = {
        tez: data_.tezina,
        visina: data_.visina || "",
        primCilj: data_.primcilj || "",
        specCilj: data_.specilj || "",
        motiv: data_.motiv || "",
        nivoAkt: data_.nivoAkt || "",
        datumRodj: data_.datumRodjenja || "",
        tdee: data_.tdee || "",
        vrstaFiz: data_.vrstaFiz || "",
        struk: data_.struk || "",
        kuk: data_.kuk || "",
        krv: data_.krvGru || "",
        dijag: data_.dijagnoza || "",
        alerg: data_.alerg || "",
        ish: data_.selectedIshranaNaziv || "",
        obr: data_.ucestBr || "",
        pus: data_.pus || "",
        alk: data_.alk || "",
        ukupnaKalVred: data_.ukupnaKalVred || "",
        bmi: data_.bmi || "",
        bmrValue: data_.bmrValue || "",
      };

      try {
        const vreme = getCurrentTime();
        await PdfSchema.create({
          title: data_.primcilj,
          pdf: fileName,
          idKlijenta: data_.id,
          datumKreir: formattedDate,
          datumPoc: formattedDatePlus1,
          datumKraj: formattedDateKraj,
          status: "Aktivan",
          tip: data_.selectedValueBrDana,
          vreme,
          klijentData,
        });
        console.log("PDF report saved successfully.");

        let foundUser = await User.findOne({ mail: data_.email }).exec();

        if (!foundUser) {
          return res.status(401).json({ message: "Korisnik nije nadjen" });
        }

        // const secret = process.env.JWT_SECRET + foundUser.password;
        // const token = jwt.sign(
        //   { id: foundUser._id, email: foundUser.mail },
        //   secret,
        //   {
        //     expiresIn: "5m",
        //   }
        // );

        //Send email
        let link = `https://13.50.180.98:3000/dash/user/${foundUser._id}`; //Zameni localhost sa lajvom

        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.email",
          port: 587,
          secure: false,
          auth: {
            user: "office@nutritrans.com",
            pass: "jezq ddqo aynu qucx",
          },
        });

        var mailOptions = {
          from: "office@nutritrans.com",
          to: data_.email,
          subject: "Generisanje Izveštaja",
          // text: link,
          html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                      <h1 style="color: #333;">Uspešno kreirana ishrana!</h1>
                      <p style="color: #555;">Vaš izveštaj je u obliku PDF-a, kliknite dole da bi ste ga pogledali</p>
                      <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Idi na aplikaciju</a>
                      <p style="color: #555; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj mail, Hvala.</p>
                  </div>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            // console.log(error);
            res.status(400).json({ message: `Nije uspelo slanje na mail` });
          } else {
            res.status(200).json({
              message: `Obavestenje za kreiran pdf poslato na ${email}`,
            });
            // console.log("Email sent: " + info.response);
          }
        });

        res.json({
          status: "ok",
          message: "PDF je uspešno generisan i sačuvan.",
        });
      } catch (err) {
        console.error("Error saving PDF to database:", err);
        res.status(500).send("Error saving PDF report.");
      }
    });

    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});

const nivoiFizickihAktivnosti = {
  sedentarni: {
    naziv: "Sedentaran",
    faktorAktivnosti: 1.2,
  },
  laganaAktivnost: {
    naziv: "Lagano aktivan",
    faktorAktivnosti: 1.375,
  },
  umerenaAktivnost: {
    naziv: "Umereno aktivan",
    faktorAktivnosti: 1.55,
  },
  intenzivnaAktivnost: {
    naziv: "Veoma aktivan",
    faktorAktivnosti: 1.725,
  },
  vrloIntenzivnaAktivnost: {
    naziv: "Ekstremno aktivan",
    faktorAktivnosti: 1.9,
  },
};

function getNivoFizickeAktivnosti(faktorAktivnosti) {
  if (typeof faktorAktivnosti === "string") {
    faktorAktivnosti = parseFloat(faktorAktivnosti);
  }
  for (let nivo in nivoiFizickihAktivnosti) {
    if (nivoiFizickihAktivnosti[nivo].faktorAktivnosti === faktorAktivnosti) {
      return nivoiFizickihAktivnosti[nivo].naziv;
    }
  }
  return "Nepoznat nivo aktivnosti"; // Ako faktor aktivnosti nije pronađen
}

//Neki test za bazu
app.get("/baza", async (req, res) => {
  try {
    // const specCiljevi = await Ciljevi.find(
    //   { tip: "specCilj" },
    //   { _id: 1, naziv: 1 }
    // ).lean();

    // const specCiljeviSaStringId = specCiljevi.map((cilj) => ({
    //   ...cilj,
    //   _id: cilj._id.toString(), // Konverzija u string
    // }));

    // console.log("Svi ciljevi => ", specCiljevi);
    // console.log("Nazivi => ", specCiljeviSaStringId); 8 imam 14

    let glutenListId = [
      "671f82735997900563cead4c",
      "671f829b5997900563cead5b",
      "671f82b35997900563cead6a",
      "671f82c75997900563cead79",
      "671f82e45997900563cead88",
      "671f83c65997900563ceade7",
      "671f83e85997900563ceadf6",
      "671f840a5997900563ceae05",
      "671f84315997900563ceae14",
      "671f84755997900563ceae32",
      "671f849a5997900563ceae41",
      "671f84b55997900563ceae50",
    ];

    const objectIds = glutenListId.map((id) => new mongoose.Types.ObjectId(id));

    Namirnica.find({ _id: { $in: objectIds } }, { naziv: 1, _id: 0 })
      .lean()
      .then((namirnice) => {
        console.log(namirnice);
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.error("Error fetching SpecCiljevi:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Test za dane
app.get("/dani", async (req, res) => {
  const pdfDoc = new PDFDocument();

  const ObrokSchema = z.object({
    opis: z.string(),
    sastojci: z.string(),
    instrukcije: z.string(),
    kalorije: z.number(),
    cena: z.number(),
    nutritivna_vrednost: z.string(),
    Makronutrijenti: z.object({
      Proteini: z.number(),
      Ugljeni_hidrati: z.number(),
      Masti: z.number(),
    }),
  });

  const kreirajDanSchema = (chosenObroci) => {
    const daySchemaDefinition = { dan: z.string() };

    if (chosenObroci.includes("doručak"))
      daySchemaDefinition.dorucak = ObrokSchema;
    if (chosenObroci.includes("uzina1"))
      daySchemaDefinition.uzina1 = ObrokSchema;
    if (chosenObroci.includes("ručak")) daySchemaDefinition.rucak = ObrokSchema;
    if (chosenObroci.includes("uzina2"))
      daySchemaDefinition.uzina2 = ObrokSchema;
    if (chosenObroci.includes("večera"))
      daySchemaDefinition.vecera = ObrokSchema;

    return z.object(daySchemaDefinition);
  };

  try {
    const chosenObroci = ["doručak", "uzina1", "ručak", "večera", "uzina2"];
    const DanSchema = kreirajDanSchema(chosenObroci);

    // console.log("Generated DanSchema:", DanSchema.shape);

    const SedmicniPlanSchema = z.object({
      days: z.array(DanSchema),
    });

    //Old
    let daniPredprompt = `
      Ti si nutricionista specijalizovan za precizne planove ishrane. Tvoja odgovornost je da generišeš plan ishrane u JSON formatu koristeći samo zadatu šemu.
      
      Pravila:
      - Ukupna dnevna kalorijska vrednost mora biti precizno raspoređena u skladu sa zadatim brojem obroka.
      - Ne raspoređuj kalorije ravnomerno, već koristi precizne procente raspodele, koji su definisani u korisničkom zahtevu.
      - Minimalna tolerancija odstupanja u kalorijama: ±2%, kako bi plan ostao realističan
      - Koristi samo preferirane namirnice i izbegavaj isključene namirnice.
      - Nazivi dana treba da budu 'Dan 1', 'Dan 2', itd., bez imena dana u nedelji.
      - Namirnice moraju biti izražene u gramima.
      - Nutritivna vrednost svakog obroka mora biti navedena u jednoj rečenici.
    `;

    let daniPrmpt = `
      Napravi plan ishrane (Keto) za tačno 3 dana sa sledećim obrocima: [Doručak, ručak, večera]
      - Primarni cilj: Mršavljenje
      - Ukupna kalorijska vrednost: 2500 kcal po danu.
      - Preferirane namirnice: sir, maslina, krastavac, paprika, parmezan, pršut, salama, tunjevina, krumpir, kiseli kupus, bakar, dagnje, tuna, kamenice, piletina, govedina, račići, jaja, sardine
      - Izbegavati sledeće namirnice: sardinela, bacon, dimljeni losos, zeleni grah, kvasac, suhi grah, maslinovo ulje, dimljena šunka, feta sir, pire krumpir, lignje, sušeni paradajz, crni luk, mladi luk, avokado, školjke, šunka, kupus, povrće u ulju
      
      Raspodela kalorija među obrocima treba da prati sledeća pravila:
        - Ako su dva obroka dnevno:
            Doručak 40% kalorija
            Večera: 60% kalorija
        - Ako su dva obroka dnevno:
            Doručak: 40% kalorija
            Ručak: 60% kalorija
        - Ako su dva obroka dnevno:
            Ručak: 50% kalorija
            Večera: 50% kalorija
        - Ako su tri obroka dnevno:
            Doručak: 30% kalorija
            Ručak: 40% kalorija
            Večera: 30% kalorija
        - Ako su četiri obroka dnevno:
            Doručak: 30% kalorija
            Užina: 10% kalorija
            Ručak: 35% kalorija
            Večera: 25% kalorija
        - Ako su pet obroka dnevno:
            Doručak: 25% kalorija
            Užina 1: 10% kalorija
            Ručak: 35% kalorija
            Užina 2: 10% kalorija
            Večera: 20% kalorija
      
      Minimalna tolerancija odstupanja u kalorijama je ±2%.

      Svaki obrok mora sadržavati PROCENTE makronutrijenata:
      - Proteini:
      - Ugljeni hidrati:
      - Masti:
    `;

    //New
    //     let daniPredprompt = `
    //   Ti si nutricionista specijalizovan za precizne i personalizovane planove ishrane.
    //   Tvoja odgovornost je da generišeš  detaljan plan ishrane  u JSON formatu koristeći  zadatu šemu .
    //   Plan ishrane mora biti prilagođen  godinama korisnika, polu, ciljevima i dijetetskim ograničenjima .

    //   ## PRAVILA ZA GENERISANJE PLANA ISHRANE:
    //   1.  Ukupna dnevna kalorijska vrednost  mora biti precizno raspoređena među obrocima, uz  minimalno odstupanje ±2% .
    //   2.  Ne raspoređuj kalorije ravnomerno  – koristi  precizne procente raspodele kalorija  prema broju obroka.
    //   3.  Svaki obrok mora sadržavati tačne količine makronutrijenata  izražene u  gramima :
    //     -  Proteini (g)
    //     -  Ugljeni hidrati (g)
    //     -  Masti (g)
    //   4.  Koristi samo preferirane namirnice , izbegavaj isključene namirnice.
    //   5.  Nazivi dana  moraju biti ‘Dan 1’, ‘Dan 2’, itd.
    //   6.  Nutritivna vrednost  svakog obroka mora biti  navedena u jednoj rečenici .
    //   7.  Tekst mora biti napisan isključivo na čistom srpskom jeziku, uz pravilnu upotrebu gramatike i padeža. Izbegavaj bilo kakve dijalekte, regionalizme, jekavicu ili ekavicu – koristi standardni srpski književni jezik. Tekst treba biti gramatički i pravopisno ispravan, prirodan i lako razumljiv. .

    // `;

    // let daniPrmpt = `
    //   Napravi plan ishrane za tačno 3 dana sa sledećim obrocima: [Doručak, ručak, večera].
    //   Primarni cilj: Mrsavljenje
    //   Ukupna kalorijska vrednost: 2569 kcal po danu
    //   Preferirane namirnice: Maline, Kupine, Hleb, Mleko
    //   Izbegavati sledeće namirnice: Sir, Krompir, Paradajz
    //   ## RASPODELA KALORIJA PO BROJU OBROKA:
    //   -  2 obroka dnevno :
    //     - Doručak:  40% kalorija
    //     - Večera:  60% kalorija
    //   -  3 obroka dnevno :
    //     - Doručak:  30% kalorija
    //     - Ručak:  40% kalorija
    //     - Večera:  30% kalorija
    //   -  4 obroka dnevno :
    //     - Doručak:  30% kalorija
    //     - Užina:  10% kalorija
    //     - Ručak:  35% kalorija
    //     - Večera:  25% kalorija
    //   -  5 obroka dnevno :
    //     - Doručak:  25% kalorija
    //     - Užina 1:  10% kalorija
    //     - Ručak:  35% kalorija
    //     - Užina 2:  10% kalorija
    //     - Večera:  20% kalorija

    //   ## PRILAGOĐAVANJE MAKRONUTRIJENATA PREMA CILJU:
    //   -  Mršavljenje : Povećaj unos proteina, smanji unos ugljenih hidrata za  10-20% .
    //   -  Održavanje : Koristi standardnu raspodelu makronutrijenata.
    //   -  Povećanje mišićne mase : Povećaj unos ugljenih hidrata i proteina, smanji unos masti.

    //   ## LISTA NAMIRNICA ZA KUPOVINU:
    //   - Na osnovu svih planiranih obroka, generiši  personalizovanu listu namirnica  sa ukupnim količinama izraženim u gramima.
    //   - Lista namirnica treba biti grupisana prema kategorijama (proteini, povrće, voće, žitarice, mlečni proizvodi itd.).

    //   ## JSON FORMAT ODGOVORA:
    //   Odgovor mora biti strukturiran u JSON formatu kao u sledećem primeru:

    //   json
    //   {
    //     "plan_ishrane": {
    //       "dan_1": {
    //         "dorucak": {
    //           "opis": "Zobena kaša sa voćem",
    //           "sastojci": {
    //             "zobene_pahuljice": "100g",
    //             "banane": "50g",
    //             "bademi": "30g"
    //           },
    //           "kalorije": 880,
    //           "makronutrijenti": {
    //             "proteini": "25g",
    //             "ugljeni_hidrati": "120g",
    //             "masti": "30g"
    //           },
    //         }
    //       }
    //     },
    //     "lista_namirnica": {
    //       "proteini": {
    //         "tofu": "500g",
    //         "sočivo": "1kg"
    //       },
    //       "povrće": {
    //         "paradajz": "300g",
    //         "krastavac": "200g"
    //       },
    //       "žitarice": {
    //         "smeđa riža": "500g",
    //         "zobene pahuljice": "1kg"
    //       },
    //     }
    //   }

    // `;

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: daniPredprompt },
        { role: "user", content: daniPrmpt },
      ],
      // response_format: zodResponseFormat(SedmicniPlanSchema, "mealPlan"),
    });

    let message = completion.choices[0]?.message.parsed;

    // console.log("DANI =>", message);

    // message.days.forEach((day) => {
    //   // Naslov za dan
    //   pdfDoc.fontSize(14).text(day.dan);
    //   pdfDoc.moveDown(1);

    //   // Iteracija kroz obroke za taj dan
    //   Object.keys(day).forEach((mealType) => {
    //     if (mealType !== "dan") {
    //       const meal = day[mealType];

    //       // Ispis naziva obroka
    //       pdfDoc
    //         .fontSize(12)
    //         .text(`  ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:`); // Indentacija za obrok

    //       // Bold-italic samo za "Opis:"
    //       pdfDoc
    //         .text(`    Opis:`, { continued: true });

    //       // Regularan font za sadržaj
    //       pdfDoc.font("OpenSans_Condensed-Regular").text(`    ${meal.opis}`);

    //       pdfDoc
    //         .text(`    Sastojci:`, { continued: true });
    //       pdfDoc
    //         .text(`    ${meal.sastojci}`);

    //       pdfDoc
    //         .text(`    Instrukcije:`, { continued: true });
    //       pdfDoc
    //         .text(`    ${meal.instrukcije}`);

    //       pdfDoc
    //         .text(`    Kalorije:`, { continued: true });
    //       pdfDoc
    //         .text(`    ${meal.kalorije} kcal`);

    //       pdfDoc
    //         .text(`    Nutritivna vrednost:`, { continued: true });
    //       pdfDoc
    //         .text(`    ${meal.nutritivna_vrednost}`);

    //       pdfDoc
    //         .text(`    Cena:`, { continued: true });
    //       pdfDoc
    //         .text(`    ~${meal.cena} rsd`);

    //       pdfDoc.fontSize(12).text("Makronutrijenti:");
    //       pdfDoc.fontSize(12)
    //       pdfDoc.text(`- Proteini: ${meal.Makronutrijenti.Proteini} %`);
    //       pdfDoc.text(`- Ugljeni hidrati: ${meal.Makronutrijenti.Ugljeni_hidrati} %`);
    //       pdfDoc.text(`- Masti: ${meal.Makronutrijenti.Masti} %`);

    //       pdfDoc.moveDown(1);
    //     }
    //   });

    //   pdfDoc.moveDown(1);
    // });

    return res.json(message);
  } catch (error) {
    console.error("Error dani:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Ovaj koristim!
app.use("/test2", async (req, res) => {
  let { brojDana, obroci, data_ } = req.body;

  let stanjeImun = data_.imunitet === "Da" ? "jak imunitet" : "slab imunitet";

  //Prebacujemo id u imena specificnim ciljevima
  if (data_.specilj != []) {
    try {
      const specCiljevi = await Ciljevi.find(
        { tip: "specCilj" },
        { _id: 1, naziv: 1 }
      ).lean();

      const specCiljeviSaStringId = specCiljevi.map((cilj) => ({
        ...cilj,
        _id: cilj._id.toString(), // Konverzija u string
      }));

      let specCiljeviNazivi = specCiljeviSaStringId
        .filter((objekat) => data_.specilj.includes(objekat._id))
        .map((poklapanje) => poklapanje.naziv);

      // console.log("Svi ciljevi => ", specCiljevi);
      // console.log("Data.speciclj => ", data_.specilj);
      // console.log("Nazivi => ", specCiljeviNazivi);

      data_.specilj = specCiljeviNazivi;
    } catch (error) {
      console.error("Error fetching SpecCiljevi:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //

  const prompt = await Prompt.findOne({ prompt: "1" });
  // console.log('Prompt: ', prompt);  //Taj njegov jedan prompt iz baze

  // Check if the prompt is null or undefined
  if (!prompt) {
    return res.status(400).json({ message: "Nisu nadjeni prompti" });
  }

  //Nadjem njegov aktivni paket i ako ima onda u zavisnoti da li ima premium onda renderujem sve
  //promptove a ako nema (full) onda prelazi da renderuje samo (base) promptove i ako nema ni jedan onda se prekida sve isalje se poruka klijentu!

  //PRONADJI NJEGOV PAKET I VIDI STA I KOLIKO MU JE OSTALO PA PO TOME NAPRAVI DA SE ODREDNJENI PROMPTOVI SALJU!!!
  // let status_paketa = {
  //   naziv: "Standard",  // ili "Standard"
  //   broj: 5
  // };

  // function ispisiTest(status) {
  //     if (status.broj > 0) {
  //         if (status.naziv === "Premium") {
  //             console.log("TEST");
  //             status.broj--;
  //         } else if (status.naziv === "Standard") {
  //             if (status.broj === 5) {
  //                 console.log("TEST");
  //             } else {
  //                 console.log("TEST AGAIN");
  //             }
  //             status.broj--;
  //         }
  //     } else {
  //         console.log("Broj je 0, ne može se dalje ispisivati.");
  //     }
  // }

  // // Testiranje funkcije
  // ispisiTest(status_paketa); // Prvi put
  // ispisiTest(status_paketa); // Drugi put
  // ispisiTest(status_paketa); // Treći put
  // ispisiTest(status_paketa); // Četvrti put
  // ispisiTest(status_paketa); // Peti put
  // ispisiTest(status_paketa); // Ne može dalje, broj je 0

  // res.json(prompt);

  //Ako conditional sentance renedring
  function generisiPlanMetaData(data_) {
    let tekst =
      "Ti si veštačka inteligencija koja nudi personalizovan plan fizičke aktivnosti. Pružaj detaljna objašnjenja za ";

    if (data_.name && data_.lastName) {
      tekst += `${data_.name} ${data_.lastName} `;
    }

    if (data_.godine) {
      tekst += `sa godinama: ${data_.godine}`;
    }

    if (data_.visina) {
      tekst += `, visina:  ${data_.visina}`;
    }

    if (data_.tezina) {
      tekst += `, sa težinom:  ${data_.tezina}`;
    }

    if (data_.pol) {
      tekst += `, pol: ${data_.pol}`;
    }

    if (data_.primcilj) {
      tekst += ` koji ima primaran cilj ${data_.primcilj} `;
    }

    if (data_.specilj) {
      tekst += `a specifične ciljeve ${data_.primcilj} `;
    }

    if (data_.tezina) {
      tekst += `koji ima ${data_.tezina} kg `;
    }

    if (data_.visina) {
      tekst += `i visok je ${data_.visina} cm, `;
    }

    if (data_.struk) {
      tekst += `obim struka mu je ${data_.struk} cm, `;
    }

    if (data_.nivoAkt) {
      tekst += `sa nivoom fizičke aktivnosti ${getNivoFizickeAktivnosti(
        data_.nivoAkt
      )}.`;
    }

    if (data_.motiv) {
      tekst += `Motivacija za potrebu fizičkih aktivnosti uključuje ${data_.motiv}, `;
    }

    if (data_.dijagnoza) {
      tekst += `a ima dijagnozu ${data_.dijagnoza}.`;
    }

    return tekst;
  }

  // let data_ = { id, tezina, visina, pol, primcilj, specilj, godine, dijagnoza, ucestBr, navikeUish, namirnice, voljeneNamirnice, neVoljeneNamirnice, ukupnaKalVred, selectedValueBrDana, tdee, bmi, kuk,vrat,struk,motiv,nivoAkt,vrstaFiz,alerg,pus,alk,datumRodjenja }

  let brojDanaInt = Number(brojDana);
  const pdfDoc = new PDFDocument();
  // const pdfDoc = new PDFDocument({
  //   size: 'A4',
  //   margin: 0 // Bez margina kako bi slika popunila celu stranicu
  // });

  // Registrujte fontove
  pdfDoc.registerFont(
    "OpenSans_Condensed-Regular",
    "./fonts/OpenSans_Condensed-Regular.ttf"
  );
  pdfDoc.registerFont(
    "OpenSans_Condensed-Bold",
    "./fonts/OpenSans_Condensed-Bold.ttf"
  );
  pdfDoc.registerFont(
    "OpenSans_Condensed-BoldItalic",
    "./fonts/OpenSans_Condensed-BoldItalic.ttf"
  );
  pdfDoc.font("OpenSans_Condensed-Regular"); // Postavite default font na regular

  //Kreiranje prve dve stranice?

  // Novi objekat mydata
  try {
    // prompt - uvod - STARI
    // const uvodResult = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: `Kreiraj mi kratki uvodni text o ishrani sa primarnim ciljem: ${data_.primcilj}` }],
    //   max_tokens: 1000,
    // });
    // let uvod = uvodResult.choices[0]?.message?.content?.trim() || kratki.uvod;
    // uvod = uvod.replace(/[#!&*ü!_?-@**]/g, "");

    // let uvodPrompt = `
    //   Napiši motivacioni uvod za ${data_?.ime}, rođenog ${data_?.datumRodjenja}, ${data_?.pol} godina, koji ima ${data_?.godine} godina, visinu ${data_?.visina} cm i trenutnu težinu ${data_?.tezina} kg. Njegov/a primarni cilj ishrane je ${data_?.primcilj},
    // `;

    // if (data_?.specilj) {
    //   uvodPrompt += `sa specifičnim ciljem da ${data_?.specilj}. `;
    // }

    // if (data_?.motiv) {
    //   uvodPrompt += `Korisnik je motivisan da promeni svoje navike zato što ${data_?.motiv}. `;
    // }

    // uvodPrompt += `
    // Prvi pasus treba da bude bogat, detaljan, sa puno informacija i inspiracije. Započni ga sa motivacijom korisnika, navodeći specifične aspekte njegovog napretka. Koristi puno detalja i proširi odgovor, koristeći primere i detalje o njegovim naporima da poveća mišićnu masu. Neka odgovor bude što duži, sa puno entuzijazma, podrške i divljenja.
    // Drugi pasus neka naglasi važnost dugoročnog održavanja zdravih navika i koristi koje će korisnik imati, poput poboljšanja zdravstvenog stanja, povećane energije i boljeg kvaliteta života. Uvod treba da bude pisan u drugom licu jednine, obraćajući se direktno korisniku, i treba da ima podržavajući i inspirativan ton.
    // `;

    let uvodPredprompt = `Ti si veštačka inteligencija koja nudi uvod o planu ishrane. Pružaj detaljna objašnjenja za ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}. Njegov/a primarni cilj ishrane je ${data_?.primcilj}.`;
    const uvodPredpromptNew = `Ti si najbolji nutricionista na svetu. Tvoj zadatak je da napišeš personalizovani uvod za plan ishrane za korisnika sa sledećim podacima:
    ● Ime i prezime: ${data_.name} ${data_.lastName}
    ● Godine: ${data_.godine}
    ● Visina: ${data_.visina} cm
    ● Težina: ${data_.tezina} kg
    ● Pol: ${data_.pol}
    ● Primarni cilj: ${data_.primcilj}
    ● Motivacija za promenu: ${data_.motiv}
    ● Trenutne navike u ishrani: ${data_.navikeUish} 
    ● Nivo aktivnosti: ${getNivoFizickeAktivnosti(data_.nivoAkt)}
    ● Prethodna iskustva sa dijetama: ${data_.iskSaDijetama}
    ● Alergije: ${data_.alerg}
    ● Namirnice koje voli: ${data_.voljeneNamirnice}
    ● Namirnice koje ne voli: ${data_.neVoljeneNamirnice}
    ● Učestalost obroka: ${data_.ucestBr}
    Tvoj zadatak je da na osnovu ovih podataka napišeš uvod koji:
    ● Personalizovano se obraća korisniku.
    ● Kratko analizira trenutno stanje korisnika i ističe ključne informacije.
    ● Motivacionim tonom ohrabruje korisnika za promenu.
    ● Nagoveštava sledeći deo izveštaja ('Holistički pristup').
    Pravila za uvod:
    1. Izbegavaj formalne fraze poput 'Srdačno' ili 'S poštovanjem.'
    2. Završetak uvoda treba da ostavlja pozitivan utisak i prirodno vodi korisnika ka sledećem delu izveštaja.
    3. Održavaj ton profesionalnim, empatičnim i motivišućim.
    4. Izbegavaj preopterećenje podacima, fokusiraj se na ključne tačke.
    Na kraju uvoda, koristi frazu poput: 'U narednom delu istražićemo holistički pristup vašem zdravlju i ishrani, povezujući fizičko i mentalno blagostanje.'`;

    let promptUvod = `${prompt.uvod.text} Neka broj karaktera bude tačno: ${prompt.uvod.brKar}.`;
    const uvodResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: uvodPredpromptNew,
        },
        {
          role: "user",
          // content: prompt.uvod.text,
          content: promptUvod,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.uvod.brKar) / 4),
    });

    // console.log("Uvod tokens => ", Math.floor(Number(prompt.uvod.brKar) / 4));

    // Prečišćavanje rezultata
    let uvod = uvodResult.choices[0]?.message?.content?.trim();
    uvod = uvod.replace(/[#!&*ü!_?@**]/g, "");

    // Podela generisanog uvoda na pasuse
    // const [prviPasus, drugiPasus] = uvod.split("\n").filter(line => line.trim() !== "");

    // Validacija pomoću Zod-a
    // const parsedUvod = uvodSchema.safeParse({
    //   prviPasus: prviPasus,
    //   drugiPasus: drugiPasus,
    // });

    // prompt - zakljucak
    let zakljucakPredprompt = `Ti si veštačka inteligencija koja nudi zakljucak o planu ishrane. Pružaj detaljna objašnjenja za ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}. Njegov/a primarni cilj ishrane je ${data_?.primcilj}.`;
    let promptZakljucak = `${prompt.zakljucak.text} Neka broj karaktera bude tačno: ${prompt.zakljucak.brKar}`;
    const zakljucakResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: zakljucakPredprompt,
        },
        {
          role: "user",
          // content: prompt.zakljucak.text,
          content: promptZakljucak,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.zakljucak.brKar) / 4),
    });

    // console.log(
    //   "Zakljucak tokens => ",
    //   Math.floor(Number(prompt.zakljucak.brKar) / 4)
    // );

    let zakljucak =
      zakljucakResult.choices[0]?.message?.content?.trim() || kratki.zakljucak;
    zakljucak = zakljucak.replace(/[#!&*ü!_?@**]/g, "");

    // prompt - smernice za ishranu
    let smernicePredprompt = `Ti si veštačka inteligencija koja nudi smernice za ishranu. Pružaj detaljna objašnjenja za ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}.`;
    let promptSmernice = `${prompt.smernice.text} Neka broj karaktera bude tačno: ${prompt.smernice.brKar}`;
    const smerniceResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: smernicePredprompt,
        },
        {
          role: "user",
          // content: prompt.smernice.text,
          content: promptSmernice,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.smernice.brKar) / 4),
    });

    // console.log(
    //   "Smernice tokens => ",
    //   Math.floor(Number(prompt.smernice.brKar) / 4)
    // );

    let smernice = smerniceResult.choices[0]?.message?.content?.trim();
    smernice = smernice.replace(/[#!&*ü!_?@**]/g, "");

    // console.log('Smernice => ', smernice); //Lepo ispisuje

    // prompt - plan fizicke aktivnosti
    let fizAktPredprompt = generisiPlanMetaData(data_);
    let fizAktPromt = `${prompt.fizAkt.text} Neka broj karaktera bude tačno: ${prompt.fizAkt.brKar}`;
    const planFizAktResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: fizAktPredprompt,
          // content: `Ti si veštačka inteligencija koja nudi personalizovan plan fizičke aktivnosti. Pružaj detaljna objašnjenja za ${data_.ime} ${data_.prezime} koji ima ${data_.tezina} kg i visok je ${data_.visina} cm, obim struka mu je ${data_.struk} cm, sa odabranim fizičkim aktivnostima ${data_.vrstaFiz}. Motivacija za potrebu fizičkih aktivnosti uključuje ${data_.motiv}, a ima dijagnozu ${data_.dijagnoza}.`
        },
        {
          role: "user",
          // content: prompt.fizAkt.text,
          content: fizAktPromt,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.fizAkt.brKar) / 4),
    });

    // console.log(
    //   "fizAkt tokens => ",
    //   Math.floor(Number(prompt.fizAkt.brKar) / 4)
    // );

    let planFizAkt = planFizAktResult.choices[0]?.message?.content?.trim();
    planFizAkt = planFizAkt.replace(/[#!&*ü!_?@**]/g, "");
    // console.log('planFizAkt:', planFizAkt);

    // let vrstaImuniteta = data_.imunitet == "Da" ? "jak imunitet" : "slab imunitet";
    function generisiPreporuke(data_) {
      let vrstaImuniteta =
        data_.imunitet === "Da" ? "jak imunitet" : "slab imunitet";

      let tekst =
        "Ti si veštačka inteligencija koja nudi preporuke za brigu o imunitetu. Pružaj detaljno objašnjenje o tome kako ";

      // Provera i dodavanje imena i prezimena
      if (data_.name && data_.lastName) {
        tekst += `${data_.name} ${data_.lastName} `;
      }

      if (data_.godine) {
        tekst += `sa godinama: ${data_.godine}`;
      }

      if (data_.visina) {
        tekst += `, visina:  ${data_.visina}`;
      }

      if (data_.tezina) {
        tekst += `, sa težinom:  ${data_.tezina}`;
      }

      if (data_.pol) {
        tekst += `, pol: ${data_.pol}`;
      }

      if (vrstaImuniteta) {
        tekst += `može poboljšati svoj imunitet, imajući u vidu da ima ${vrstaImuniteta} `;
      }

      if (data_.motiv) {
        tekst += `i motivaciju za promenu: ${data_.motiv}. `;
      }

      if (data_.specilj) {
        tekst += `Njegovi specificni ciljevi su ${data_.specilj}.`;
      }

      if (data_.navikeUish) {
        tekst += `Njegove navike u ishrani su ${data_.navikeUish}.`;
      }

      if (data_.alerg) {
        tekst += `Njegove alergije su ${data_.alerg}.`;
      }

      if (data_.intolerancije) {
        tekst += `Njegove intolerancije su ${data_.intolerancije}.`;
      }

      return tekst;
    }

    // prompt - imunološka podrška
    let imunPredprompt = generisiPreporuke(data_);
    let imunPrompt = `${prompt.imun.text} Neka broj karaktera bude tačno: ${prompt.imun.brKar}`;
    const podrzkaImunResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: imunPredprompt,
          // content: `Ti si veštačka inteligencija koja nudi preporuke za brigu o imunitetu. Pružaj detaljno objašnjenje o tome kako ${data_.ime} ${data_.prezime} može poboljšati svoj imunitet, imajući u vidu da ima ${vrstaImuniteta} i motivaciju za promenu: ${data_.motiv}. Njegovi specificni ciljevi su ${data_.specilj}`
        },
        {
          role: "user",
          // content: prompt.imun.text
          content: imunPrompt,
        },
      ],
      // max_tokens: Math.floor(Number(prompt.imun.brKar)/ 4)
    });

    // console.log("imun tokens => ", Math.floor(Number(prompt.imun.brKar) / 4));

    let podrzkaImun = podrzkaImunResult.choices[0]?.message?.content?.trim();
    podrzkaImun = podrzkaImun.replace(/[#!&*ü!_?@**]/g, "");
    // console.log('podrzkaImun:', podrzkaImun);

    // prompt - perosnalizovan plan ishrane - text pre dana
    let perosnalPredprompt = `Ti si veštačka inteligencija koja nudi uvod o personlanizovanom planu ishrane, pružaj detaljno objašnjenje za ${data_.name} ${data_.lastName} sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}, sa primaranim ciljem ${data_.primcilj}`;
    const perosnalPredpromptNew = `
    Ti si najbolji nutricionista na svetu specijalizovan za kreiranje personalizovanih planova ishrane prilagođenih individualnim potrebama i ciljevima korisnika.
    Na osnovu sledećih podataka o korisniku:
    ● Ime i prezime: ${data_.name} ${data_.lastName}
    ● Godine: ${data_.godine}
    ● Visina: ${data_.visina} cm
    ● Težina: ${data_.tezina} kg
    ● Pol: ${data_.pol}
    ● Primarni cilj: ${data_.primcilj}
    ● Motivacija za promenu: ${data_.motiv}
    ● Nivo aktivnosti: ${getNivoFizickeAktivnosti(data_.nivoAkt)}
    ● Trenutne navike u ishrani: ${data_.navikeUish}
    ● Namirnice koje voli: ${data_.voljeneNamirnice}
    ● Namirnice koje ne voli: ${data_.neVoljeneNamirnice}
    ● Stil ishrane: ${data_.selectedIshranaNaziv}
    ● Stanje imuniteta: ${stanjeImun}

    Tvoj zadatak je da napišeš segment pod nazivom 'Personalizovani plan ishrane' koji korisniku pruža sledeće:

    1. Ciljevi i principi plana:
      ○ Jasno definiši korisnikov primarni cilj i ključne principe koji će mu pomoći da ga postigne.
      ○ Objasni kako će plan doprineti ostvarenju njegovih ciljeva (npr. balansirana ishrana, unos makronutrijenata).

    2. Lista dozvoljenih i izbegavanih namirnica:
      ○ Navedite konkretne namirnice koje su preporučene na osnovu korisnikovih potreba i preferencija.
      ○ Napravite listu namirnica koje treba izbegavati zbog alergija, zdravstvenih problema ili ciljeva.

    3. Nutritivne smernice:
      ○ Definiši ukupan dnevni kalorijski unos i preporučenu raspodelu makronutrijenata (ugljeni hidrati, masti, proteini).
      ○ Istakni važnost hidratacije i preporuči optimalni dnevni unos vode.

    4. Praktične napomene o pripremi hrane:
      ○ Objasni metode pripreme koje su deo plana (pečenje, kuvanje na pari, izbegavanje prženja).
      ○ Naglasi važnost korišćenja svežih i neprerađenih namirnica.

    5. Učestalost i struktura obroka:
      ○ Navedite preporučeni broj obroka dnevno (npr. tri glavna obroka i dve užine).
      ○ Predložite optimalno vreme za obroke (npr. doručak do 9h, večera do 19h).

    Strukturiši segment sa jasnim podnaslovima, preglednim listama i praktičnim savetima kako bi sadržaj bio lako razumljiv i primenljiv. Ton treba da bude profesionalan, motivacioni i empatičan, sa fokusom na podršku korisniku u njegovom procesu promene.

    Pravila:
    ● Nemoj koristiti previše stručne termine – objašnjenja moraju biti jasna i razumljiva.
    ● Nemoj koristiti formalne fraze poput 'Srdačno' ili 'S poštovanjem'.
    ● Fokusiraj se na motivisanje korisnika da započne primenu saveta iz ove sekcije.
    `;
    let promptPersonal = `${prompt.planIsh.text} Neka broj karaktera bude tačno: ${prompt.planIsh.brKar}`;
    const personalIshraneResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          //Upotpuni ovo podacima
          content: perosnalPredpromptNew,
        },
        {
          role: "user",
          // content:  prompt.planIsh.text,
          content: promptPersonal,
        },
      ],
      // max_tokens: Math.floor(Number(prompt.planIsh.brKar) / 4)
    });
    let personalIshrane =
      personalIshraneResult.choices[0]?.message?.content?.trim();
    personalIshrane = personalIshrane.replace(/[#!&*ü!_?@**]/g, "");

    // console.log(
    //   "planIsh tokens => ",
    //   Math.floor(Number(prompt.planIsh.brKar) / 4)
    // );

    function generisiPreporukeZaSan(data_) {
      let tekst =
        "Ti si veštačka inteligencija koja nudi preporuke za brigu o snu. Pružaj detaljno objašnjenje o tome kako ";

      if (data_.name && data_.lastName) {
        tekst += `${data_.name} ${data_.lastName} `;
      }

      if (data_.godine) {
        tekst += `sa godinama: ${data_.godine}`;
      }

      if (data_.visina) {
        tekst += `, visina:  ${data_.visina}`;
      }

      if (data_.tezina) {
        tekst += `, sa težinom:  ${data_.tezina}`;
      }

      if (data_.pol) {
        tekst += `, pol: ${data_.pol}`;
      }

      if (data_.nivoAkt) {
        tekst += `može poboljšati svoj san, imajući u vidu da ima nivo fizičke aktivnosti ${getNivoFizickeAktivnosti(
          data_.nivoAkt
        )}. `;
      }

      if (data_.specilj) {
        tekst += `A ima specifične ciljeve ${data_.specilj} `;
      }

      if (data_.navikeUish) {
        tekst += `i navike u ishrani ${data_.navikeUish}.`;
      }

      return tekst;
    }

    // prompt - savet za spavanje
    let spavanjePredprompt = generisiPreporukeZaSan(data_);
    let promptSpavanje = `${prompt.san.text} Neka broj karaktera bude tačno: ${prompt.san.brKar}`;
    const spavanjeSavetResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: spavanjePredprompt,
          // content: `Ti si veštačka inteligencija koja nudi preporuke za brigu o snu. Pružaj detaljno objašnjenje o tome kako ${data_.ime} ${data_.prezime} može poboljšati svoj san, imajući u vidu da ima nivo fizičke aktivnosti ${data_.ddd}. A ima specifične ciljeve ${data_.specilj} i navike u ishrani ${data_.navikeUish}.`
        },
        {
          role: "user",
          // content: prompt.san.text,
          content: promptSpavanje,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.san.brKar) / 4),
    });

    // console.log("san tokens => ", Math.floor(Number(prompt.san.brKar) / 4));

    let spavanjeSavet =
      spavanjeSavetResult.choices[0]?.message?.content?.trim();
    spavanjeSavet = spavanjeSavet.replace(/[#!&*ü!_?@**]/g, "");
    // console.log('spavanjeSavet:', spavanjeSavet);

    // prompt - preporuka za unos vode
    let vodaPredpromt = `Ti si veštačka inteligencija koja nudi preporuke za brigu o unosu vode u organizam. Pružaj detaljno objašnjenje o tome kako ${
      data_.name
    } ${data_.lastName} ${data_.pol} ${data_.godine} godina, sa težinom ${
      data_.tezina
    } i visinom ${
      data_.visina
    } cm može poboljšati svoj unos vode, imajući u vidu da ima nivo fizičke aktivnosti ${getNivoFizickeAktivnosti(
      data_.nivoAkt
    )}`;
    let promptVoda = `${prompt.voda.text} Neka broj karaktera bude tačno: ${prompt.voda.brKar}`;
    const prepVodaResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: vodaPredpromt,
        },
        {
          role: "user",
          // content: prompt.voda.text,
          content: promptVoda,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.voda.brKar) / 4),
    });

    // console.log("voda tokens => ", Math.floor(Number(prompt.voda.brKar) / 4));

    let prepVoda = prepVodaResult.choices[0]?.message?.content?.trim();
    prepVoda = prepVoda.replace(/[#!&*ü!_?@**]/g, "");
    // console.log('prepVoda:', prepVoda);

    function generisiPreporukeZaDijete(data_) {
      let tekst =
        "Ti si veštačka inteligencija koja nudi preporuke o prethodnim iskustvima sa dijetama. Pružaj detaljno objašnjenje o tome kako ";

      if (data_.name && data_.lastName) {
        tekst += `${data_.name} ${data_.lastName}, `;
      }

      if (data_.godine) {
        tekst += `sa godinama: ${data_.godine}`;
      }

      if (data_.visina) {
        tekst += `, visina:  ${data_.visina}`;
      }

      if (data_.tezina) {
        tekst += `, sa težinom:  ${data_.tezina}`;
      }

      if (data_.pol) {
        tekst += `, pol: ${data_.pol}`;
      }

      if (data_.primcilj) {
        tekst += `sa ciljevima ${data_.primcilj}, `;
      }

      if (data_.specilj) {
        tekst += `i specifičnim ciljem ${data_.specilj} `;
      }

      // Provera i dodavanje motivacije
      if (data_.motiv) {
        tekst += `i motivacijom za ${data_.motiv} `;
      }

      if (data_.iskSaDijetama) {
        tekst += `sa prethodnim iskustvom ${data_.iskSaDijetama}.`;
      }

      return tekst;
    }

    // prompt - preporuka za prethodna iskustva sa ishranana
    let prethishPredprompt = generisiPreporukeZaDijete(data_);
    let promptPretIsh = `${prompt.predijeta.text} Neka broj karaktera bude tačno: ${prompt.predijeta.brKar}`;
    const pretIshResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: prethishPredprompt,
          //content: `Ti si veštačka inteligencija koja nudi preporuke o prethodnim iskustvima sa dijetama. Pružaj detaljno objašnjenje o tome kako ${data_.ime} ${data_.prezime}, sa ciljevima ${data_.primcilj}, i specifičnim ciljem ${data_.specilj} i motivacijom za ${data_.motiv} sa prethosnim iskustom ${data_.iskSaDijetama}.`
        },
        {
          role: "user",
          content: promptPretIsh,
        },
      ],
      // max_tokens:  Math.floor(Number(prompt.predijeta.brKar) / 4),
    });

    // console.log(
    //   "predijeta tokens => ",
    //   Math.floor(Number(prompt.predijeta.brKar) / 4)
    // );

    let pretIsh = pretIshResult.choices[0]?.message?.content?.trim();
    pretIsh = pretIsh.replace(/[#!&*ü!_?@**]/g, "");

    // Kreiranje odgovora
    const odgovor = {
      // voda: prepVoda,
      // spavanje: spavanjeSavet,
      // podrska: podrzkaImun,
      // plan: planFizAkt,
      // uvod: uvod,
      zakljucak: zakljucak,
    };

    //Za ostale upite
    planShema.parse(odgovor);

    //Za dane
    if (!brojDanaInt || typeof brojDanaInt !== "number") {
      return res
        .status(400)
        .json({ message: "Molimo unesite validan broj dana." });
    }

    const validObroci = ["doručak", "užina1", "ručak", "užina2", "večera"];
    const chosenObroci =
      Array.isArray(obroci) &&
      obroci.every((obrok) => validObroci.includes(obrok))
        ? obroci
        : ["doručak", "užina1", "ručak", "užina2", "večera"];

    ["doručak", "užina", "ručak", "užina", "večera"];

    const obrociPrompt = chosenObroci
      .map((obrok) => {
        switch (obrok) {
          case "doručak":
            return "doručak";
          case "užina1":
            return "užina";
          case "ručak":
            return "ručak";
          case "užina2":
            return "užina2";
          case "večera":
            return "večera";
          default:
            return obrok;
        }
      })
      .join(", ");

    // console.log("obrociPrompt => ", obrociPrompt);

    const DaySchema = generateDaySchema(chosenObroci);
    const FullWeekSchema = z.object({
      days: z.array(DaySchema),
    });
    //- Obrok treba da sadrži realne i dostupne namirnice iz srbije.
    // console.log(
    //   "Ukupna kalorijska vrednost: ",
    //   Math.round(data_.ukupnaKalVred)
    // );
    // console.log("Tdee: ", Math.round(data_.tdee));

    //OLD
    let daniPredprompt = `
              Ti si nutricionista specijalizovan za precizne planove ishrane. Tvoja odgovornost je da generišeš plan ishrane u JSON formatu koristeći samo zadatu šemu.
              
              Pravila:
              - Nemoj da raspodelis kalorijsku vrednost ravnomerno između obroka.
              - Koristi samo zadate namirnice i izbegavaj isključene namirnice.
              - Nazivi dana treba da budu 'Dan 1', 'Dan 2', itd., bez imena dana u nedelji.
              - Za svaki obrok navedi tačnu kalorijsku vrednost.
              `;
    let daniPrmpt = `
              Napravi plan ishrane za tačno ${brojDanaInt} dana sa sledećim obrocima: ${obrociPrompt}.
              Primarni cilj: ${data_.primcilj}.
              Ukupna kalorijska vrednost: ${Math.round(
                data_.ukupnaKalVred
              )} kcal po danu.
              Preferirane namirnice: ${data_.voljeneNamirnice}.
              Izbegavati sledeće namirnice: ${data_.neVoljeneNamirnice}.
              Cene moraju biti okvirne i izražene u RSD.
              Namirnice trebaju da budu izražene u gramima.
              Napiši utritivnu vrednost u jednoj rečenici.
              Svi obroci moraju imati precizne kalorijske vrednosti koje doprinose ukupnom dnevnom unosu kalorija. Ne uključuj obroke koji nisu navedeni.
              `;

    //NEW
    let daniPredprompt_ = `
        Ti si nutricionista specijalizovan za precizne planove ishrane. Tvoja odgovornost je da generišeš plan ishrane u JSON formatu koristeći samo zadatu šemu.
        
        Pravila:
        - Sve mora biti na napisano na SRPSKOM jeziku.
        - Nemoj da raspodeliš kalorijsku vrednost ravnomerno između obroka.
        - Koristi samo zadate namirnice i izbegavaj isključene namirnice.
        - Nazivi dana treba da budu 'Dan 1', 'Dan 2', itd., bez imena dana u nedelji.
        - Za svaki obrok navedi tačnu kalorijsku vrednost.
        - Za svaki obrok navedi mikronutrijente: proteini, ugljeni hidrati i masti.
        - Sastojci moraju biti u gramima.
        - Nutritivne verednosti mora biti u gramima.
      `;

    //Ovaj deo je bio u daniPredprompt_ na kraju recenice
    //- Makronutrijenti moraju biti u gramima a ne u procentima!

    let daniPrmpt_ = `
        Napravi plan ishrane (${
          data_.selectedIshranaNaziv
        }) za tačno ${brojDanaInt} dana sa sledećim obrocima: ${obrociPrompt}
        - Primarni cilj: ${data_.primcilj}.
        - Ukupna kalorijska vrednost: ${Math.round(
          data_.ukupnaKalVred
        )} kcal po danu.
        - Preferirane namirnice: ${data_.voljeneNamirnice}.
        - Izbegavati sledeće namirnice: ${data_.neVoljeneNamirnice}.

        Raspodela kalorija među obrocima treba da prati sledeća pravila:
        - Doručak: 25-30% kalorija
        - Ručak: 40-45% kalorija
        - Večera: 25-30% kalorija
        
        Minimalna tolerancija odstupanja u kalorijama je ±2%.
      `;

    //Ovaj deo je bio u daniPrmpt_ na kraju recenice
    // Svaki obrok mora sadržavati PROCENTE makronutrijenata:
    // - Proteini: %
    // - Ugljeni hidrati: %
    // - Masti: %

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: daniPredprompt_,
        },
        {
          role: "user",
          content: daniPrmpt_,
        },
      ],
      response_format: zodResponseFormat(FullWeekSchema, "mealPlan"),
    });

    let message = completion.choices[0]?.message.parsed; //DANI
    // let message_cleared = message.replace(/[#!&*ü!_?-@**]/g, "");

    // FullWeekSchema.parse(hol);

    // prompt - preporuka za alkohola
    let alkoholpPredprompt = ``;
    let promptAlkohol = ``;
    let alkoholResult = "";
    let alkohol = "";
    if (data_.alk === "da") {
      alkoholpPredprompt = `Ti si veštačka inteligencija koja nudi preporuke za brigu o unosu alkohola u organizam. Pružaj detaljno objašnjenje o tome kako ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}, koji želi da postigne ${data_.primcilj} i ${data_.specilj} a konzumira ${data_.alk}`;
      promptAlkohol = `${prompt.alk.text} Neka broj karaktera bude tačno: ${prompt.alk.brKar}`;
      alkoholResult = await openai.chat.completions.create({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: alkoholpPredprompt,
          },
          {
            role: "user",
            // content: prompt.alk.text,
            content: promptAlkohol,
          },
        ],
        // max_tokens: Math.floor(Number(prompt.alk.brKar) / 4),
      });

      // console.log("alk tokens => ", Math.floor(Number(prompt.alk.brKar) / 4));

      alkohol = alkoholResult.choices[0]?.message?.content?.trim();
      alkohol = alkohol.replace(/[#!&*ü!_?@**]/g, "");
    }

    //DODAJ CONDITIONAL AKO PUSI DA LI UOPSTE DA POKRECE PROMPT

    // prompt - preporuka za alkohola
    let pusenjePredprompt = ``;
    let promptPusenje = ``;
    let pusenjeResult = "";
    let pusenje = "";
    if (data_.pus === "da") {
      pusenjePredprompt = `Ti si veštačka inteligencija koja nudi preporuke za brigu o pusenju cigareta. Pružaj detaljno objašnjenje o tome kako ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}, koji želi da postigne ${data_.primcilj} i ${data_.specilj} a konzumira ${data_.pus}`;
      promptPusenje = `${prompt.pus.text} Neka broj karaktera bude tačno: ${prompt.pus.brKar}`;
      pusenjeResult = await openai.chat.completions.create({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: pusenjePredprompt,
          },
          {
            role: "user",
            // content: prompt.pus.text,
            content: promptPusenje,
          },
        ],
        // max_tokens:  Math.floor(Number(prompt.pus.brKar) / 4),
      });

      // console.log("pusenje tokens => ", Math.floor(Number(prompt.pus.brKar) / 4));

      pusenje = pusenjeResult.choices[0]?.message?.content?.trim();
      pusenje = pusenje.replace(/[#!&*ü!_?@**]/g, "");
    }

    // prompt - alergije - renderuje se conditionaly
    let alergijePredprompt = `Ti si veštačka inteligencija koja nudi preporuke za brigu o alergijama i intolerancijama. Pružaj detaljno objašnjenje za ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}, sa alergijama ${data_.alerg} i intolerancijama za ${data_.intolerancije}`;
    let promptAlergije = `${prompt.alergiio.text} Neka broj karaktera bude tačno: ${prompt.alergiio.brKar}`;
    const alergijeResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18", //gpt-4o-2024-08-06 samo tako stavim za 32k input i output tokena
      messages: [
        {
          role: "system",
          content: alergijePredprompt,
        },
        {
          role: "user",
          // content: prompt.alergiio.text,
          content: promptAlergije,
        },
      ],
      // max_tokens: Math.floor(Number(prompt.alergiio.brKar) / 4),
    });
    // console.log(
    //   "alerg tokens => ",
    //   Math.floor(Number(prompt.alergiio.brKar) / 4)
    // );

    let alergije = alergijeResult.choices[0]?.message?.content?.trim();
    alergije = alergije.replace(/[#!&*ü!_?@**]/g, "");

    //Za holisticki pristup  ${data_.nivoFizAktivnosti} => Dodaj iz fronta
    let holistickiPristupPredpromt = `Ti si veštačka inteligencija koja nudi personalizovane savete o zdravlju i dobrobiti zasnovane na holističkom pristupu. Pružaj detaljna objašnjenja za ${data_.name} ${data_.lastName}, sa godinama: ${data_.godine} visina: ${data_.visina}, sa težinom: ${data_.tezina}, pol: ${data_.pol}, sa primarnim ciljem ${data_.primcilj} i specifičnim ciljem ${data_.specilj}. Motivacija za promenu uključuje ${data_.motiv}, nivo fizičke aktivnosti: 1.2, vrsta fizičke aktivnosti: ${data_.vrstaFiz}, i ishrana: ${data_.selectedIshranaNaziv}. Sa stanjem imuniteta ${stanjeImun}`;
    let holistickiPristupPredpromtNew = `
    Ti si najbolji nutricionista na svetu, specijalizovan za personalizovane savete o zdravlju i
    dobrobiti zasnovane na holističkom pristupu. Tvoj zadatak je da pišeš sekciju izveštaja koja
    korisniku jasno objašnjava značaj povezivanja ishrane, fizičke aktivnosti i mentalnog zdravlja za
    postizanje dugoročnih rezultata. Koristi sledeće personalizovane podatke o korisniku:
    ● Ime i prezime: ${data_.name} ${data_.lastName} 
    ● Godine: ${data_.godine}
    ● Visina: ${data_.visina} cm
    ● Težina: ${data_.tezina} kg
    ● Pol: ${data_.pol}
    ● Primarni cilj: ${data_.primcilj}
    ● Specifičan cilj: ${data_.specilj}
    ● Motivacija za promenu: ${data_.motiv}
    ● Nivo fizičke aktivnosti: ${getNivoFizickeAktivnosti(data_.nivoAkt)}
    ● Vrsta fizičke aktivnosti: ${data_.vrstaFiz} 
    ● Stil ishrane: ${data_.selectedIshranaNaziv}
    ● Stanje imuniteta: ${stanjeImun}
    Tvoj zadatak je da pišeš sekciju koja:
    1. Objašnjava značaj holističkog pristupa zdravlju, uključujući povezanost fizičkog,
    mentalnog i nutritivnog zdravlja.
    2. Koristi podatke o korisniku da bi objasnila kako personalizovan pristup doprinosi
    postizanju njihovih ciljeva.
    3. Prikazuje 2–3 jednostavne i praktične promene koje korisnik može odmah primeniti, uz
    objašnjenje zašto su važne.
    4. Održava topao i motivišući ton, fokusirajući se na održivost i dugoročne koristi.
    5. Priprema korisnika za sledeću sekciju izveštaja, 'Personalizovani plan ishrane', uz
    tranzicionu frazu poput:
    'Sada, kada razumete važnost holističkog pristupa, prelazimo na detaljan plan ishrane
    prilagođen vašim ciljevima.'
    Pravila:
    ● Nemoj koristiti previše stručne termine – objašnjenja moraju biti jasna i razumljiva.
    ● Ton treba da bude profesionalan, ali pristupačan i inspirativan.
    ● Nemoj koristiti formalne fraze poput 'Srdačno' ili 'S poštovanjem'.
    ● Fokusiraj se na motivisanje korisnika da započne primenu saveta iz ove sekcije.
    `;

    let promptHolistickiPristup = `${prompt.holisticki.text} Neka broj karaktera bude tačno: ${prompt.holisticki.brKar}`;
    const holPristupResult = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18", // proverite verziju modela
      messages: [
        {
          role: "system",
          content: holistickiPristupPredpromtNew,
        },
        {
          //Promeni
          role: "user",
          // content: prompt.holisticki.text,
          content: promptHolistickiPristup,
        },
      ],
      temperature: 0.7,
      //Napravi defoltnu vrednost ako je prazno
      // max_tokens:  Math.floor(Number(prompt.holisticki.brKar) / 4),
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // console.log(
    //   "holisticki tokens => ",
    //   Math.floor(Number(prompt.alergiio.brKar) / 4)
    // );

    // Generisani odgovor
    let odgovor1 = holPristupResult.choices[0].message.content;
    odgovor1 = odgovor1.replace(/[#!&*ü!_?@**]/g, "");

    let mydata = {
      odgovor, //Skup podataka
      odgovor1, //Holisticki pristup
      message, //Dani
    };

    //here pdf
    //alergije je u inputu a ostalo nzm...

    //Za tabelu
    const klijentData_ = {
      "Težina (kg)": {
        value: data_.tezina,
        icon: "public/pdficons/tezina.png",
      },
      "Visina (cm)": {
        value: data_.visina,
        icon: "public/pdficons/visina.png",
      },
      "Primarni cilj": {
        value: data_.primcilj,
        icon: "public/pdficons/primcilj.png",
      },
      // "Specifičan cilj": {
      //   value: data_.specilj,
      //   icon: "public/pdficons/tdee.png",
      // },
      Motivacija: {
        value: data_.motiv,
        icon: "public/pdficons/speccilj.png",
      },
      "Nivo aktivnosti": {
        value: `${getNivoFizickeAktivnosti(data_.nivoAkt)}`,
        icon: "public/pdficons/nivoakt.png",
      },
      "Datum rođenja": {
        value: data_.datumRodjenja,
        icon: "public/pdficons/datum.png",
      },
      "Vrsta fizičke aktivnosti": {
        value: data_.vrstaFiz,
        icon: "public/pdficons/man_4.png",
      },
      "Obim struka (cm)": {
        value: data_.struk,
        icon: "public/pdficons/obim.png",
      },
      "Obim kukova (cm)": {
        value: data_.kuk,
        icon: "public/pdficons/hips.png",
      },
      "Krvna grupa": { value: data_.krvGru, icon: "public/pdficons/blood.png" },
      // Dijagnoza: {
      //   value: data_.dijagnoza,
      //   icon: "public/pdficons/tdee.png",
      // },
      Alergije: {
        value: data_.alergije,
        icon: "public/pdficons/airborne.png",
      },
      Ishrana: {
        value: data_.selectedIshranaNaziv,
        icon: "public/pdficons/dish.png",
      },
      "Obroci nedeljno": {
        value: data_.ucestBr,
        icon: "public/pdficons/ish.png",
      },
      Pušenje: { value: data_.pus, icon: "public/pdficons/cigarrete.png" },
      Alkohol: { value: data_.alk, icon: "public/pdficons/beer.png" },
      "Ukupna kalorijska vrednost (kcal)": {
        value: Math.round(data_.ukupnaKalVred),
        icon: "public/pdficons/calories-calculator.png",
      },
      "TDEE (kcal) - Ukupna dnevna potrošnja energije": {
        value: Math.round(data_.tdee),
        icon: "public/pdficons/mojb.png",
      },
      "BMR (kcal) - Bazalni metabolizam": {
        value: Math.round(data_.bmrValue),
        icon: "public/pdficons/cleanbmr.png",
      },
      "BMI - Indeks telesne mase": {
        value: Math.round(data_.bmi),
        icon: "public/pdficons/bmi1.png",
      },
    };

    // Dodavanje slike na prvu stranicu
    pdfDoc.image("./public/firstpage2.png", 0, 0, {
      width: 615,
      height: 865,
    }); // A4 dimenzije u pt

    // Dodavanje teksta na prvu stranicu
    const text = `${data_?.name} ${data_?.lastName}`; // Tekst koji se prikazuje
    const textFont = "OpenSans_Condensed-Bold"; // Font koji se koristi za tekst
    const textFontSize = 12; // Veličina fonta
    const textX = 70; // Početna X koordinata teksta
    const textY = 615; // Početna Y koordinata teksta

    // Postavi font i veličinu fonta pre računanja širine teksta
    pdfDoc.font(textFont).fontSize(textFontSize);

    // Izračunavanje širine teksta
    const textWidth = pdfDoc.widthOfString(text); // Širina teksta
    const textHeight = textFontSize * 0.7; // Približna visina teksta (proporcija fonta)

    // Dodavanje linije koja pokriva ceo tekst
    pdfDoc
      .moveTo(textX, textY - textHeight - 5) // Početak linije
      .lineTo(textX + textWidth, textY - textHeight - 5) // Kraj linije, širine celog teksta
      .lineWidth(25) // Debljina linije
      .strokeColor("#81B873") // Boja linije
      .stroke(); // Primena linije

    // Dodavanje teksta na prvu stranicu - ime sa zelenim
    pdfDoc
      .fillColor("black") // Boja teksta
      .text(text, textX, textY, { align: "left" });

    //Datum ispod imena
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    // Dodaj tekst u PDF
    pdfDoc.fontSize(12).text(`${formattedDate}`, textX, textY + 20);

    // Dodavanje druge stranice
    pdfDoc.addPage();

    // Dodavanje slike na drugu stranicu
    pdfDoc.image("./public/secondPage.png", 0, 0, {
      width: 650,
      height: 795,
    }); // A4 dimenzije u pt

    // Dodavanje trece stranice
    pdfDoc.addPage();

    pdfDoc
      .fillColor("black") // Boja teksta
      .text("Podaci za kreiranje ishrane", { align: "center" });

    //Za tabelu
    const col1Width = 270; //Sirina leve kolone
    const col2Width = 280; //Sirina desne kolone
    const iconSize = 15;
    const tableWidth = col1Width + col2Width + 10;
    const startX = 25; //Od leve strane kad pocinje tabela
    let startY = 100;

    pdfDoc
      .moveTo(startX, startY)
      .lineTo(startX + tableWidth, startY)
      .stroke();

    Object.entries(klijentData_).forEach(([key, { value, icon }]) => {
      pdfDoc
        .moveTo(startX, startY)
        .lineTo(startX, startY + 25)
        .stroke();
      pdfDoc
        .moveTo(startX + col1Width + 10, startY)
        .lineTo(startX + col1Width + 10, startY + 25)
        .stroke();
      pdfDoc
        .moveTo(startX + tableWidth, startY)
        .lineTo(startX + tableWidth, startY + 25)
        .stroke();
      pdfDoc
        .moveTo(startX, startY + 25)
        .lineTo(startX + tableWidth, startY + 25)
        .stroke();

      if (icon) {
        pdfDoc.image(icon, startX + 5, startY + 5, {
          width: iconSize,
          height: iconSize,
        });
      }

      pdfDoc.text(key, startX + 25, startY + 7, { width: col1Width - 30 });
      pdfDoc.text(String(value), startX + col1Width + 15, startY + 7, {
        width: col2Width - 10,
      });

      startY += 25;
    });

    // Dodavanje druge stranice
    pdfDoc.addPage();

    // Dodaj metadata
    // pdfDoc
    //   .fontSize(12)
    //   .font("OpenSans_Condensed-Regular")
    //   .text(`${data_?.name || ""} ${data_?.lastName || ""}`, { x: 10, y: 30 })
    //   .text(`TDEE:${Math.round(data_?.tdee) || ""} kcal/dan`, { x: 10, y: 50 })
    //   .text(`BMI:${Math.round(data_?.bmi) || ""} kg/m2`, { x: 10, y: 70 })
    //   .text(
    //     `Ukupna kalorijska vrednost:${
    //       Math.round(data_?.ukupnaKalVred) || ""
    //     } kcal/dan`,
    //     { x: 10, y: 90 }
    //   );
    // .text(`BMR:${data_?.bmrValue || ""} kcal/dan`, { x: 10, y: 90 });

    // Dodaj sliku na desnoj strani
    pdfDoc.image("./public/logoo.png", 500, 50, { width: 50, height: 50 }); // Slika pozicionirana na desnoj strani (x: 500 je približno desna ivica)
    pdfDoc.moveDown(1);

    // Dodaj hadkodovani naslov
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Pokreni svoju transformaciju", { align: "center" });
    pdfDoc.moveDown(1);

    // Prvi pasus uvoda - ZA SAD NEMA
    // pdfDoc.fontSize(12).font("OpenSans_Condensed-Regular").text(parsedUvod.data.prviPasus);
    // pdfDoc.moveDown(1);

    //Drugi pasus uvoda
    pdfDoc.fontSize(12).font("OpenSans_Condensed-Regular").text(uvod);
    pdfDoc.addPage();

    //Holisticki Pristup
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Holistički pristup");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(odgovor1);
    pdfDoc.addPage();

    //Personalnizovani uvod / Personalizovani Plan Ishrane
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Personalizovani Plan Ishrane");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(personalIshrane);
    pdfDoc.moveDown(1);

    mydata.message.days.forEach((day) => {
      // Naslov za dan
      pdfDoc.fontSize(14).font("OpenSans_Condensed-Bold").text(day.dan);
      pdfDoc.moveDown(1);

      // Iteracija kroz obroke za taj dan
      Object.keys(day).forEach((mealType) => {
        if (mealType !== "dan") {
          let meal = day[mealType];

          // Ispis naziva obroka
          pdfDoc
            .fontSize(12)
            .font("OpenSans_Condensed-Bold")
            .text(`  ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:`); // Indentacija za obrok

          // Detalji o obroku
          pdfDoc.font("OpenSans_Condensed-Regular");

          // Bold-italic samo za "Opis:"
          pdfDoc
            .font("OpenSans_Condensed-BoldItalic")
            .text(`    Opis:`, { continued: true });

          // Regularan font za sadržaj
          pdfDoc.font("OpenSans_Condensed-Regular").text(`    ${meal.opis}`);

          pdfDoc
            .font("OpenSans_Condensed-BoldItalic")
            .text(`    Sastojci:`, { continued: true });
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(`    ${meal.sastojci}`);

          pdfDoc
            .font("OpenSans_Condensed-BoldItalic")
            .text(`    Instrukcije:`, { continued: true });
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(`    ${meal.instrukcije}`);

          pdfDoc
            .font("OpenSans_Condensed-BoldItalic")
            .text(`    Kalorije:`, { continued: true });
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(`    ${meal.kalorije} kcal`);

          pdfDoc
            .font("OpenSans_Condensed-BoldItalic")
            .text(`    Nutritivna vrednost:`, { continued: true });
          pdfDoc
            .font("OpenSans_Condensed-Regular")
            .text(`    ${meal.nutritivna_vrednost}`);

          // pdfDoc
          //   .font("OpenSans_Condensed-BoldItalic")
          //   .text(`    Cena:`, { continued: true });
          // pdfDoc
          //   .font("OpenSans_Condensed-Regular")
          //   .text(`    ~${meal.cena} rsd`);

          //Za sad je izbaceno
          // pdfDoc
          //   .font("OpenSans_Condensed-BoldItalic")
          //   .text(`    Makronutrijenti:`);

          // pdfDoc.font("OpenSans_Condensed-Regular")
          //   .text(`      - Proteini: ${meal.Makronutrijenti.Proteini} %`);
          // pdfDoc.font("OpenSans_Condensed-Regular")
          //   .text(`      - Ugljeni hidrati: ${meal.Makronutrijenti.Ugljeni_hidrati} %`);
          // pdfDoc.font("OpenSans_Condensed-Regular")
          //   .text(`      - Masti: ${meal.Makronutrijenti.Masti} %`);

          pdfDoc.moveDown(1);
        }
      });

      // Dodaj novu stranicu za sledeći dan
      // pdfDoc.addPage();  //Da bude svaki dan na novoj stranici
      pdfDoc.moveDown(1); //Dapomeri dole ispod svakog dana
    });

    // Naslov za nutritivnu vrednost
    // pdfDoc.fontSize(14).font("OpenSans_Condensed-Bold").text("Nutritivne informacije");
    // pdfDoc.moveDown(1);

    pdfDoc.addPage();

    //Preporuka za Smernice
    pdfDoc.fontSize(18).font("OpenSans_Condensed-Bold").text("Smernice");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(smernice);
    pdfDoc.addPage();

    //Plan fizicke aktivnosti
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Plan fizičke aktivnosti");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(planFizAkt);
    pdfDoc.addPage();

    //Preporuka za Imunitet
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Preporuka za Imunitet");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(podrzkaImun);
    pdfDoc.addPage();

    //Preporuka za San
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Preporuka za san");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(spavanjeSavet);
    pdfDoc.addPage();

    //Preporuka za unos vode
    pdfDoc
      .fontSize(18)
      .font("OpenSans_Condensed-Bold")
      .text("Preporuka za unos vode");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(prepVoda);
    pdfDoc.addPage();

    // Pusenje
    if (data_.pus === "da") {
      pdfDoc
        .fontSize(18)
        .font("OpenSans_Condensed-Bold")
        .text("Preporuka za konzumiranje duvana");
      pdfDoc
        .moveDown(1)
        .fontSize(12)
        .font("OpenSans_Condensed-Regular")
        .text(pusenje);
      pdfDoc.addPage();
    }

    // Alkohol
    if (data_.pus === "da") {
      pdfDoc
        .fontSize(18)
        .font("OpenSans_Condensed-Bold")
        .text("Konzumiranje alkohola");
      pdfDoc
        .moveDown(1)
        .fontSize(12)
        .font("OpenSans_Condensed-Regular")
        .text(alkohol);
      pdfDoc.addPage();
    }

    // Object.entries(mydata.hol).forEach(([title, content]) => {
    //   if (title !== "fizickoZdravlje") {
    //     pdfDoc.fontSize(18).font("OpenSans_Condensed-Bold").text(title.charAt(0).toUpperCase() + title.slice(1).replace(/([A-Z])/g, ' $1'));
    //     pdfDoc.moveDown(1).fontSize(12).font("OpenSans_Condensed-Regular").text(content);
    //     pdfDoc.addPage();
    //   }
    // });

    // Dodaj zaključak
    pdfDoc.fontSize(18).font("OpenSans_Condensed-Bold").text("Zaključak");
    pdfDoc
      .moveDown(1)
      .fontSize(12)
      .font("OpenSans_Condensed-Regular")
      .text(mydata.odgovor.zakljucak);

    // Kreirajte PDF i sačuvajte ga
    // const fileName = `Nutricionisticki_Izvestaj_${new Date()}_${Math.floor(Math.random() * 100000000000)}.pdf`;
    //Imaj u vidu da mozda stavis i vreme da bi bilo unikatnije
    const fileName = `Nutricionisticki_Izvestaj_${formatDate(
      new Date()
    )}_${replaceSpacesWithUnderscore(data_.primcilj)}.pdf`; //POPRAVI
    const filePath = path.join(__dirname, "files", fileName);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", async () => {
      await fs.promises.writeFile(filePath, Buffer.concat(chunks));

      // Snimanje u bazu podataka
      const today = new Date();
      const formattedDate = today.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); //Za danasnji dan

      const today1 = new Date();
      today1.setDate(today1.getDate() + 1); // Dodajemo jedan dan
      const formattedDatePlus1 = today1.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const todayKraj = new Date();
      todayKraj.setDate(todayKraj.getDate() + brojDanaInt + 1); // Dodajemo izabrani broj dana
      const formattedDateKraj = todayKraj.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      let klijentData = {
        tez: data_.tezina,
        visina: data_.visina || "",
        primCilj: data_.primcilj || "",
        specCilj: data_.specilj || "",
        motiv: data_.motiv || "",
        nivoAkt: data_.nivoAkt || "",
        datumRodj: data_.datumRodjenja || "",
        tdee: Math.round(data_.tdee) || "",
        vrstaFiz: data_.vrstaFiz || "",
        struk: data_.struk || "",
        kuk: data_.kuk || "",
        vrat: data_.vrat || "",
        krv: data_.krvGru || "",
        dijag: data_.dijagnoza || "",
        alerg: data_.alerg || "",
        ish: data_.selectedIshranaNaziv || "",
        obr: data_.ucestBr || "",
        pus: data_.pus || "",
        alk: data_.alk || "",
        ukupnaKalVred: Math.round(data_.ukupnaKalVred) || "",
        bmi: Math.round(data_.bmi) || "",
        bmrValue: Math.round(data_.bmrValue) || "",
      };

      // console.log('klijentData => ', klijentData);

      try {
        const vreme = getCurrentTime();
        await PdfSchema.create({
          title: data_.primcilj,
          pdf: fileName,
          idKlijenta: data_._id,
          datumKreir: formattedDate,
          datumPoc: formattedDatePlus1,
          datumKraj: formattedDateKraj,
          status: "Aktivan",
          tip: brojDanaInt,
          vreme,
          klijentData,
        });

        // console.log({
        //   title: data_.primcilj,
        //   pdf: fileName,
        //   idKlijenta: data_._id,
        //   datumKreir: formattedDate,
        //   datumPoc: formattedDatePlus1,
        //   datumKraj: formattedDateKraj,
        //   status: "Aktivan",
        //   tip: brojDanaInt,
        //   vreme,
        //   klijentData,
        // });

        // console.log("Dani =>", message);

        //Cuvanje prompta
        await ChatKonverzacija.create({
          primCilj: data_.primcilj,
          datum: formattedDate,
          vreme: vreme,
          name: data_.name,
          lastname: data_.lastName,
          idUser: data_._id,
          poslatiPrompt: {
            // predUvod: uvodPredprompt,
            predUvod: uvodPredpromptNew,
            uvod: promptUvod,

            // predHolistickiPristup: holistickiPristupPredpromt,
            predHolistickiPristup: holistickiPristupPredpromtNew,
            holistickiPristup: promptHolistickiPristup,

            // predPlanIshrane: perosnalPredprompt,
            predPlanIshrane: perosnalPredpromptNew,
            planIshrane: promptPersonal,

            predDani: daniPredprompt_,
            dani: daniPrmpt_,

            predSmernice: smernicePredprompt,
            smernice: promptSmernice,

            predPlanFizickeAktivnosti: fizAktPredprompt,
            planFizickeAktivnosti: fizAktPromt,

            predPodrskaZaImunitet: imunPredprompt,
            podrskaZaImunitet: imunPrompt,

            predSpavanjeSavet: spavanjePredprompt,
            spavanjeSavet: promptSpavanje,

            predUnosVode: vodaPredpromt,
            unosVode: promptVoda,

            predPusenje: pusenjePredprompt,
            pusenje: promptPusenje,

            predAlkohol: alkoholpPredprompt,
            alkohol: promptAlkohol,

            predZakljucak: zakljucakPredprompt,
            zakljucak: promptZakljucak,
          },
          odgovor: {
            uvod: uvod,
            holistickiPristup: odgovor1,
            planIshrane: personalIshrane,
            dani: mydata.message.days,
            smernice: smernice,
            planFizickeAktivnosti: planFizAkt,
            podrskaZaImunitet: podrzkaImun,
            spavanjeSavet: spavanjeSavet,
            unosVode: prepVoda,
            pusenje: pusenje,
            alkohol: alkohol,
            zakljucak: mydata.odgovor.zakljucak,
          },
        });

        let foundUser = await User.findOne({ mail: data_.mail }).exec();

        if (!foundUser) {
          return res.status(401).json({ message: "Korisnik nije nadjen" });
        }

        // const secret = process.env.JWT_SECRET + foundUser.password;
        // const token = jwt.sign(
        //   { id: foundUser._id, email: foundUser.mail },
        //   secret,
        //   {
        //     expiresIn: "5m",
        //   }
        // );

        //Send email
        let link = `${process.env.FRONTEND_URL}/dash/user/${foundUser._id}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.email",
          port: 587,
          secure: false,
          auth: {
            user: "office@nutritrans.com",
            pass: "jezq ddqo aynu qucx",
          },
        });

        var mailOptions = {
          from: "office@nutritrans.com",
          to: data_.mail,
          subject: "Generisanje Izveštaja",
          // text: link,
          // html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          //             <h1 style="color: #333;">Uspešno kreirana ishrana!</h1>
          //             <p style="color: #555;">Vaš izveštaj je u obliku PDF-a, kliknite dole da bi ste ga pogledali</p>
          //             <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Idi na aplikaciju</a>
          //             <p style="color: #555; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj mail, Hvala.</p>
          //         </div>`,
          html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                  <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
                  <h1 style="color: #333; font-size: 28px;">🎉 Uspešno kreirana ishrana! 🎉</h1>
                  <p style="color: #555; font-size: 18px;">Vaš personalizovani plan ishrane je spreman! Možete preuzeti vaš izveštaj u PDF formatu klikom na dugme ispod.</p>
                  
                  <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; font-size: 18px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">📄 Pogledaj PDF izveštaj</a>
                  
                  <p style="color: #777; font-size: 14px; margin-top: 30px;">Ako imate bilo kakvih pitanja, posetite našu <a href="https://nutritrans.rs/help" style="color: #4CAF50; text-decoration: none; font-weight: bold;">stranicu podrške</a>.</p>
                  
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🍽️</p>
              </div>
              `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            // console.log(error);
            res.status(400).json({ message: `Nije uspelo slanje na mail` });
          } else {
            res.status(200).json({
              message: `Obavestenje za kreiran pdf poslato na ${mail}`,
            });
            // console.log("Email sent: " + info.response);
          }
        });

        console.log("PDF report saved successfully.");

        //Smanjivanje paketa - samo oduzimanje jer ga ne bi pustio bez paketa
        try {
          const paket = await Paket.findOne({
            idUser: data_._id,
            status: "Aktivan",
          })
            .sort({ datum_kreiranja: -1 })
            .exec();

          if (paket && paket.broj && paket.broj.full) {
            const fullNumber = Number(paket.broj.full);

            if (!isNaN(fullNumber)) {
              paket.broj.full = (fullNumber - 1).toString();
              await paket.save();
              console.log("Paket updated successfully!");
            } else {
              console.log("Invalid value for full field:", paket.broj.full);
            }
          } else {
            console.log("No active paket found for user:", data_.id);
          }
        } catch (error) {
          console.log("Paket error: ", error);
        }

        res.json({
          status: "ok",
          message: "PDF je uspešno generisan i sačuvan.",
        });
      } catch (err) {
        console.error("Error saving PDF to database:", err);
        res.status(500).send("Error saving PDF report.");
      }
    });

    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});

//Mail test
// app.get("/send-report", (req, res) => {
//   const foundUser = { _id: "66e2ed73fdadd6048da0acec" }; // Pronađeni korisnik
//   const data_ = { mail: "vladimir.jovanovic@gbi.rs" }; // Primer maila za slanje

//   let link = `https://nutritrans.rs/dash/user/${foundUser._id}`;

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "office@nutritrans.com",
//       pass: "jezq ddqo aynu qucx",
//     },
//   });

//   const mailOptions = {
//     from: "office@nutritrans.com",
//     to: data_.mail,
//     subject: "Generisanje Izveštaja",
//     html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//                 <h1 style="color: #333;">Uspešno kreirana ishrana!</h1>
//                 <p style="color: #555;">Vaš izveštaj je u obliku PDF-a, kliknite dole da biste ga pogledali</p>
//                 <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Idi na aplikaciju</a>
//                 <p style="color: #555; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj mail, Hvala.</p>
//             </div>`,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       return res.status(400).json({ message: `Nije uspelo slanje na mail` });
//     } else {
//       return res.status(200).json({
//         message: `Obavestenje za kreiran pdf poslato na ${data_.mail}`,
//       });
//     }
//   });
// });

//Testni - vraca samo celokupni objekat
// app.post("/zod-test", async (req, res) => {
//   const { brojDana, obroci, data_ } = req.body;
//   try {
//     // prompt - uvod
//     const uvodResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         {
//           role: "user",
//           content: `Kreiraj mi kratki uvodni text o ishrani sa primarnim ciljem mršavljenja`,
//         },
//       ],
//       max_tokens: 1000,
//     });
//     let uvod = uvodResult.choices[0]?.message?.content?.trim() || kratki.uvod;
//     uvod = uvod.replace(/[#!&*ü!_?-@**]/g, "");

//     // prompt - zakljucak
//     const zakljucakResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         {
//           role: "user",
//           content: `Kreiraj mi kratki zaključak text o ishrani sa primarnim ciljem mršavljenja`,
//         },
//       ],
//       max_tokens: 1000,
//     });
//     let zakljucak =
//       zakljucakResult.choices[0]?.message?.content?.trim() || kratki.zakljucak;
//     zakljucak = zakljucak.replace(/[#!&*ü!_?-@**]/g, "");

//     // prompt - plan fizicke aktivnosti
//     const planFizAktResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         {
//           role: "user",
//           content: "Kreiraj mi kratki text o planu fizičke aktivnosti",
//         },
//       ],
//       max_tokens: 1000,
//     });
//     let planFizAkt =
//       planFizAktResult.choices[0]?.message?.content?.trim() || kratki.plan;
//     planFizAkt = planFizAkt.replace(/[#!&*ü!_?-@**]/g, "");
//     // console.log("planFizAkt:", planFizAkt);

//     // prompt - imunološka podrška
//     const podrzkaImunResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         {
//           role: "user",
//           content: "Kreiraj mi kratki tekst o imunološku podršku",
//         },
//       ],
//       max_tokens: 1000,
//     });
//     let podrzkaImun =
//       podrzkaImunResult.choices[0]?.message?.content?.trim() || kratki.podrska;
//     podrzkaImun = podrzkaImun.replace(/[#!&*ü!_?-@**]/g, "");
//     // console.log("podrzkaImun:", podrzkaImun);

//     // prompt - savet za spavanje
//     const spavanjeSavetResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         {
//           role: "user",
//           content: "Kreiraj mi kratki text o poboljšanje spavanja",
//         },
//       ],
//       max_tokens: 1000,
//     });
//     let spavanjeSavet =
//       spavanjeSavetResult.choices[0]?.message?.content?.trim() ||
//       kratki.spavanje;
//     spavanjeSavet = spavanjeSavet.replace(/[#!&*ü!_?-@**]/g, "");
//     console.log("spavanjeSavet:", spavanjeSavet);

//     // prompt - preporuka za unos vode
//     const prepVodaResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06",
//       messages: [
//         { role: "user", content: "Kreiraj mi kratki text o unos vode" },
//       ],
//       max_tokens: 1000,
//     });
//     let prepVoda =
//       prepVodaResult.choices[0]?.message?.content?.trim() || kratki.voda;
//     prepVoda = prepVoda.replace(/[#!&*ü!_?-@**]/g, "");
//     console.log("prepVoda:", prepVoda);

//     // Kreiranje odgovora
//     const odgovor = {
//       voda: prepVoda,
//       spavanje: spavanjeSavet,
//       podrska: podrzkaImun,
//       plan: planFizAkt,
//       uvod,
//       zakljucak,
//     };

//     //Za ostale upite
//     planShema.parse(odgovor);

//     //Za dane
//     if (!brojDana || typeof brojDana !== "number") {
//       return res
//         .status(400)
//         .json({ message: "Molimo unesite validan broj dana." });
//     }

//     const validObroci = ["doručak", "užina1", "ručak", "užina2", "večera"];
//     const chosenObroci =
//       Array.isArray(obroci) &&
//       obroci.every((obrok) => validObroci.includes(obrok))
//         ? obroci
//         : ["doručak", "užina1", "ručak", "užina2", "večera"];

//     const obrociPrompt = chosenObroci
//       .map((obrok) => {
//         switch (obrok) {
//           case "doručak":
//             return "doručak";
//           case "užina1":
//             return "užina";
//           case "ručak":
//             return "ručak";
//           case "užina2":
//             return "druga užina";
//           case "večera":
//             return "večera";
//           default:
//             return obrok;
//         }
//       })
//       .join(", ");

//     const DaySchema = generateDaySchema(chosenObroci);
//     const FullWeekSchema = z.object({
//       days: z.array(DaySchema),
//     });

//     const completion = await client.beta.chat.completions.parse({
//       model: "gpt-4o-2024-08-06o-2024-08-06",
//       messages: [
//         {
//           role: "system",
//           content:
//             "Ti si korisni nutricionista. Generiši plan ishrane u JSON formatu koristeći samo zadatu šemu. Nazivi dana treba da budu 'Dan 1', 'Dan 2', i tako dalje, a ne imena dana u nedelji.",
//         },
//         {
//           role: "user",
//           content: `Napravi plan ishrane za ${brojDana} dana sa sledećim obrocima: ${obrociPrompt}. Nemoj uključivati obroke koji nisu navedeni.`,
//         },
//       ],
//       response_format: zodResponseFormat(FullWeekSchema, "mealPlan"),
//     });

//     let message = completion.choices[0]?.message.parsed; //OVDE MOZDA PUKNE! ZBOG KARAKTERA
//     // message = message.replace(/[#!&*ü!_?-@**]/g, "");  //OVDE

//     // FullWeekSchema.parse(hol);

//     //Za holisticki pristup
//     const holPristupResult = await openai.chat.completions.create({
//       model: "gpt-4o-2024-08-06o-2024-08-06",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an AI that provides detailed and clearly structured explanations on holistic approaches to health and wellness.",
//         },
//         {
//           role: "user",
//           content: `Molim te da pružiš jasan i organizovan opis holističkog pristupa zdravlju, podeljen u posebne odeljke:
//                     1. Fizičko zdravlje: Kratak opis
//                     2. Zdrave navike: Kratak opis
//                     3. Preventivna nega: Kratak opis
//                     4. Održavanje bilansa: Kratak opis
//             Neka odgovori budu jasno strukturirani sa tačno definisanim odeljcima:
//             '1. Fizičko zdravlje:',
//             '2. Zdrave navike:',
//             '3. Preventivna nega:',
//             '4. Održavanje bilansa:' sa dvotačkom na kraju svakog naslova.`,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 700,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//     });

//     // Generisani odgovor
//     let odgovor1 = holPristupResult.choices[0].message.content;
//     odgovor1 = odgovor1.replace(/[#!&*ü!_?-@**]/g, "");

//     // Provera da li su svi odeljci prisutni u odgovoru
//     if (
//       !odgovor1.includes("1. Fizičko zdravlje:") ||
//       !odgovor1.includes("2. Zdrave navike:") ||
//       !odgovor1.includes("3. Preventivna nega:") ||
//       !odgovor1.includes("4. Održavanje bilansa:")
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Odgovor nije u ispravnom formatu." });
//     }

//     //Defoltno ako nema defoltne vrenosti
//     const defaultHol = {
//       fizickoZdravlje:
//         "Fizičko zdravlje se odnosi na dobrobit i funkcionalnost našeg tela. To uključuje stanje naših unutrašnjih organa, mišića, kostiju, kao i našu telesnu kondiciju i snagu. Holistički pristup fizičkom zdravlju prepoznaje da su svi ovi aspekti međusobno povezani i da su svi od suštinskog značaja za sveukupno zdravlje. To znači da se fokusiramo ne samo na lečenje simptoma, već i na razumijevanje i tretiranje uzroka.",
//       zdraveNavike:
//         "Zdrave navike su ponašanja koja često praktikujemo i koja pozitivno utiču na naše fizičko, emocionalno i mentalno zdravlje. To može uključivati redovnu fizičku aktivnost, uravnoteženu ishranu, dovoljno sna, hidrataciju, kao i izbegavanje štetnih navika poput pušenja ili prekomernog konzumiranja alkohola. Holistički pristup zdravim navikama prepoznaje da su sve ove aktivnosti povezane i da promena jedne navike može imati širok spektar uticaja na naše zdravlje.",
//       preventivnaNega:
//         "Preventivna nega je pristup zdravlju koji se fokusira na sprečavanje bolesti i stanja pre nego što se pojave, umesto da se bave samo njihovim lečenjem. To može uključivati redovne lekarske preglede, vakcinaciju, skrining za određene bolesti, kao i vođenje zdravog životnog stila. Holistički pristup prepoznaje važnost preventivne nege u održavanju dugoročnog zdravlja i dobrobiti.",
//       odrzavanjeBilansa:
//         "Održavanje bilansa odnosi se na pronalaženje ravnoteže između različitih aspekata našeg života, uključujući fizičko zdravlje, emocionalno blagostanje, socijalne odnose, duhovnost i rad. Holistički pristup održavanju bilansa prepoznaje da su svi ovi aspekti međusobno povezani i da promene u jednom aspektu mogu uticati na druge. To znači da se teži za ravnotežom u svim oblastima života, a ne samo u jednoj.",
//     };

//     // Podela odgovora u odgovarajuću strukturu
//     const hol = {
//       fizickoZdravlje:
//         odgovor1
//           .split("1. Fizičko zdravlje:")[1]
//           .split("2. Zdrave navike:")[0]
//           .trim() || defaultHol.fizickoZdravlje,
//       zdraveNavike:
//         odgovor1
//           .split("2. Zdrave navike:")[1]
//           .split("3. Preventivna nega:")[0]
//           .trim() || defaultHol.zdraveNavike,
//       preventivnaNega:
//         odgovor1
//           .split("3. Preventivna nega:")[1]
//           .split("4. Održavanje bilansa:")[0]
//           .trim() || defaultHol.preventivnaNega,
//       odrzavanjeBilansa:
//         odgovor1.split("4. Održavanje bilansa:")[1].trim() ||
//         defaultHol.odrzavanjeBilansa,
//     };

//     // Validacija odgovora prema Zod shemi
//     holPristupShema.parse(hol);

//     res.json({
//       odgovor,
//       hol,
//       message,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Pojavio se error na serveru." });
//   }
// });

//RADIM NA CONDITION RENDERINGU!
app.post("/prompts1", async (req, res) => {
  try {
    // prompt - uvod
    const uvodResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki uvodni text o ishrani sa primarnim ciljem: mrsavljenje`,
        },
      ],
      max_tokens: 1000,
    });
    let uvod = uvodResult.choices[0]?.message?.content?.trim() || kratki.uvod;
    uvod = uvod.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - zakljucak
    const zakljucakResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki zaključak text o ishrani sa primarnim ciljem: mrsavljenje`,
        },
      ],
      max_tokens: 1000,
    });
    let zakljucak =
      zakljucakResult.choices[0]?.message?.content?.trim() || kratki.zakljucak;
    zakljucak = zakljucak.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - plan fizicke aktivnosti
    const planFizAktResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o planu fizičke aktivnosti",
        },
      ],
      max_tokens: 1000,
    });
    let planFizAkt =
      planFizAktResult.choices[0]?.message?.content?.trim() || kratki.plan;
    planFizAkt = planFizAkt.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('planFizAkt:', planFizAkt);

    // prompt - imunološka podrška
    const podrzkaImunResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki tekst o imunološku podršku",
        },
      ],
      max_tokens: 1000,
    });
    let podrzkaImun =
      podrzkaImunResult.choices[0]?.message?.content?.trim() || kratki.podrska;
    podrzkaImun = podrzkaImun.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('podrzkaImun:', podrzkaImun);

    // prompt - savet za spavanje
    const spavanjeSavetResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o poboljšanje spavanja",
        },
      ],
      max_tokens: 1000,
    });
    let spavanjeSavet =
      spavanjeSavetResult.choices[0]?.message?.content?.trim() ||
      kratki.spavanje;
    spavanjeSavet = spavanjeSavet.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('spavanjeSavet:', spavanjeSavet);

    // prompt - preporuka za unos vode
    const prepVodaResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "user", content: "Kreiraj mi kratki text o unos vode" },
      ],
      max_tokens: 1000,
    });
    let prepVoda =
      prepVodaResult.choices[0]?.message?.content?.trim() || kratki.voda;
    prepVoda = prepVoda.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('prepVoda:', prepVoda);

    // // Kreiranje odgovora
    // const odgovor = {
    //   voda: prepVoda,
    //   spavanje: spavanjeSavet,
    //   podrska: podrzkaImun,
    //   plan: planFizAkt,
    //   uvod: uvod,
    //   zakljucak: zakljucak
    // };

    res.json({
      odgovor,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Pojavio se error na serveru." });
  }
});

app.post("/prompts", async (req, res) => {
  let { brojDana, obroci, data_ } = req.body;

  let brojDanaInt = Number(brojDana);

  try {
    // prompt - uvod
    const uvodResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki uvodni text o ishrani sa primarnim ciljem: ${data_.primcilj}`,
        },
      ],
      max_tokens: 1000,
    });
    let uvod = uvodResult.choices[0]?.message?.content?.trim() || kratki.uvod;
    uvod = uvod.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - zakljucak
    const zakljucakResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: `Kreiraj mi kratki zaključak text o ishrani sa primarnim ciljem: ${data_.primcilj}`,
        },
      ],
      max_tokens: 1000,
    });
    let zakljucak =
      zakljucakResult.choices[0]?.message?.content?.trim() || kratki.zakljucak;
    zakljucak = zakljucak.replace(/[#!&*ü!_?-@**]/g, "");

    // prompt - plan fizicke aktivnosti
    const planFizAktResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o planu fizičke aktivnosti",
        },
      ],
      max_tokens: 1000,
    });
    let planFizAkt =
      planFizAktResult.choices[0]?.message?.content?.trim() || kratki.plan;
    planFizAkt = planFizAkt.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('planFizAkt:', planFizAkt);

    // prompt - imunološka podrška
    const podrzkaImunResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki tekst o imunološku podršku",
        },
      ],
      max_tokens: 1000,
    });
    let podrzkaImun =
      podrzkaImunResult.choices[0]?.message?.content?.trim() || kratki.podrska;
    podrzkaImun = podrzkaImun.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('podrzkaImun:', podrzkaImun);

    // prompt - savet za spavanje
    const spavanjeSavetResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: "Kreiraj mi kratki text o poboljšanje spavanja",
        },
      ],
      max_tokens: 1000,
    });
    let spavanjeSavet =
      spavanjeSavetResult.choices[0]?.message?.content?.trim() ||
      kratki.spavanje;
    spavanjeSavet = spavanjeSavet.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('spavanjeSavet:', spavanjeSavet);

    // prompt - preporuka za unos vode
    const prepVodaResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "user", content: "Kreiraj mi kratki text o unos vode" },
      ],
      max_tokens: 1000,
    });
    let prepVoda =
      prepVodaResult.choices[0]?.message?.content?.trim() || kratki.voda;
    prepVoda = prepVoda.replace(/[#!&*ü!_?-@**]/g, "");
    // console.log('prepVoda:', prepVoda);

    // Kreiranje odgovora
    const odgovor = {
      voda: prepVoda,
      spavanje: spavanjeSavet,
      podrska: podrzkaImun,
      plan: planFizAkt,
      uvod: uvod,
      zakljucak: zakljucak,
    };

    //Za ostale upite
    planShema.parse(odgovor);

    //Za dane
    if (!brojDanaInt || typeof brojDanaInt !== "number") {
      return res
        .status(400)
        .json({ message: "Molimo unesite validan broj dana." });
    }

    const validObroci = ["doručak", "užina1", "ručak", "užina2", "večera"];
    const chosenObroci =
      Array.isArray(obroci) &&
      obroci.every((obrok) => validObroci.includes(obrok))
        ? obroci
        : ["doručak", "užina1", "ručak", "užina2", "večera"];

    const obrociPrompt = chosenObroci
      .map((obrok) => {
        switch (obrok) {
          case "doručak":
            return "doručak";
          case "užina1":
            return "užina";
          case "ručak":
            return "ručak";
          case "užina2":
            return "druga užina";
          case "večera":
            return "večera";
          default:
            return obrok;
        }
      })
      .join(", ");

    const DaySchema = generateDaySchema(chosenObroci);
    const FullWeekSchema = z.object({
      days: z.array(DaySchema),
    });

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "Ti si korisni nutricionista. Generiši plan ishrane u JSON formatu koristeći samo zadatu šemu. Nazivi dana treba da budu 'Dan 1', 'Dan 2', i tako dalje, a ne imena dana u nedelji.",
        },
        {
          role: "user",
          content: `Napravi plan ishrane za ${brojDanaInt} dana sa sledećim obrocima: ${obrociPrompt}. Primarni cilj je ${data_.primcilj}, moja dnevna kalorijska vrednost iznosi ${data_.ukupnaKalVred}, naminice koje preferiram u ishrani: ${data_.voljeneNamirnice}, naminice koje ne preferiram u ishrani: ${data_.neVoljeneNamirnice}. Nemoj uključivati obroke koji nisu navedeni.`,
        },
      ],
      response_format: zodResponseFormat(FullWeekSchema, "mealPlan"),
    });

    let message = completion.choices[0]?.message.parsed; //OVDE MOZDA PUKNE! ZBOG KARAKTERA
    // message = message.replace(/[#!&*ü!_?-@**]/g, "");  //OVDE

    // FullWeekSchema.parse(hol);

    //Za holisticki pristup
    const holPristupResult = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that provides detailed and clearly structured explanations on holistic approaches to health and wellness.",
        },
        {
          role: "user",
          content: `Molim te da pružiš jasan i organizovan opis holističkog pristupa zdravlju, podeljen u posebne odeljke:
                    1. Fizičko zdravlje: Kratak opis
                    2. Zdrave navike: Kratak opis
                    3. Preventivna nega: Kratak opis
                    4. Održavanje bilansa: Kratak opis
            Neka odgovori budu jasno strukturirani sa tačno definisanim odeljcima: 
            '1. Fizičko zdravlje:', 
            '2. Zdrave navike:', 
            '3. Preventivna nega:', 
            '4. Održavanje bilansa:' sa dvotačkom na kraju svakog naslova.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Generisani odgovor
    let odgovor1 = holPristupResult.choices[0].message.content;
    odgovor1 = odgovor1.replace(/[#!&*ü!_?-@**]/g, "");

    // Provera da li su svi odeljci prisutni u odgovoru
    if (
      !odgovor1.includes("1. Fizičko zdravlje:") ||
      !odgovor1.includes("2. Zdrave navike:") ||
      !odgovor1.includes("3. Preventivna nega:") ||
      !odgovor1.includes("4. Održavanje bilansa:")
    ) {
      return res
        .status(400)
        .json({ error: "Odgovor nije u ispravnom formatu." });
    }

    //Defoltno ako nema defoltne vrenosti
    const defaultHol = {
      fizickoZdravlje:
        "Fizičko zdravlje se odnosi na dobrobit i funkcionalnost našeg tela. To uključuje stanje naših unutrašnjih organa, mišića, kostiju, kao i našu telesnu kondiciju i snagu. Holistički pristup fizičkom zdravlju prepoznaje da su svi ovi aspekti međusobno povezani i da su svi od suštinskog značaja za sveukupno zdravlje. To znači da se fokusiramo ne samo na lečenje simptoma, već i na razumijevanje i tretiranje uzroka.",
      zdraveNavike:
        "Zdrave navike su ponašanja koja često praktikujemo i koja pozitivno utiču na naše fizičko, emocionalno i mentalno zdravlje. To može uključivati redovnu fizičku aktivnost, uravnoteženu ishranu, dovoljno sna, hidrataciju, kao i izbegavanje štetnih navika poput pušenja ili prekomernog konzumiranja alkohola. Holistički pristup zdravim navikama prepoznaje da su sve ove aktivnosti povezane i da promena jedne navike može imati širok spektar uticaja na naše zdravlje.",
      preventivnaNega:
        "Preventivna nega je pristup zdravlju koji se fokusira na sprečavanje bolesti i stanja pre nego što se pojave, umesto da se bave samo njihovim lečenjem. To može uključivati redovne lekarske preglede, vakcinaciju, skrining za određene bolesti, kao i vođenje zdravog životnog stila. Holistički pristup prepoznaje važnost preventivne nege u održavanju dugoročnog zdravlja i dobrobiti.",
      odrzavanjeBilansa:
        "Održavanje bilansa odnosi se na pronalaženje ravnoteže između različitih aspekata našeg života, uključujući fizičko zdravlje, emocionalno blagostanje, socijalne odnose, duhovnost i rad. Holistički pristup održavanju bilansa prepoznaje da su svi ovi aspekti međusobno povezani i da promene u jednom aspektu mogu uticati na druge. To znači da se teži za ravnotežom u svim oblastima života, a ne samo u jednoj.",
    };

    // Podela odgovora u odgovarajuću strukturu
    const hol = {
      fizickoZdravlje:
        odgovor1
          .split("1. Fizičko zdravlje:")[1]
          .split("2. Zdrave navike:")[0]
          .trim() || defaultHol.fizickoZdravlje,
      zdraveNavike:
        odgovor1
          .split("2. Zdrave navike:")[1]
          .split("3. Preventivna nega:")[0]
          .trim() || defaultHol.zdraveNavike,
      preventivnaNega:
        odgovor1
          .split("3. Preventivna nega:")[1]
          .split("4. Održavanje bilansa:")[0]
          .trim() || defaultHol.preventivnaNega,
      odrzavanjeBilansa:
        odgovor1.split("4. Održavanje bilansa:")[1].trim() ||
        defaultHol.odrzavanjeBilansa,
    };

    // Validacija odgovora prema Zod shemi
    holPristupShema.parse(hol);

    res.json({
      odgovor,
      hol,
      message,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Pojavio se error na serveru." });
  }
});

app.get("/zod", async (req, res) => {
  try {
    const Table = z.enum(["orders", "customers", "products"]);
    const Column = z.enum([
      "id",
      "status",
      "expected_delivery_date",
      "delivered_at",
      "shipped_at",
      "ordered_at",
      "canceled_at",
    ]);
    const Operator = z.enum(["=", ">", "<", "<=", ">=", "!="]);
    const OrderBy = z.enum(["asc", "desc"]);

    const DynamicValue = z.object({
      column_name: z.string(),
    });

    const Condition = z.object({
      column: z.string(),
      operator: Operator,
      value: z.union([z.string(), z.number(), DynamicValue]),
    });

    const QueryArgs = z.object({
      table_name: Table,
      columns: z.array(Column),
      conditions: z.array(Condition),
      order_by: OrderBy,
    });

    const client = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. The current date is August 6, 2024. You help users query for the data they are looking for by calling the query function.",
        },
        {
          role: "user",
          content:
            "look up all my orders in may of last year that were fulfilled but not delivered on time",
        },
      ],
      tools: [zodFunction({ name: "query", parameters: QueryArgs })],
    });
    res.json(
      completion.choices[0].message.tool_calls[0].function.parsed_arguments
    );
    // console.log(completion.choices[0].message.tool_calls[0].function.parsed_arguments);
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      status: "error",
      message: "Greška.",
    });
  }
});

const Step = z.object({
  explanation: z.string(),
  output: z.string(),
});

const MathResponse = z.object({
  steps: z.array(Step),
  final_answer: z.string(),
});

app.get("/zod1", async (req, res) => {
  const client = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
  });

  try {
    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful math tutor. Only use the schema for math responses.",
        },
        { role: "user", content: "solve 8x + 3 = 21" },
      ],
      response_format: zodResponseFormat(MathResponse, "mathResponse"),
    });

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
      console.log(message.parsed.steps);
      console.log(message.parsed.final_answer);
    } else {
      console.log(message.refusal);
    }
    res.json(message);
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      status: "error",
      message: "Greška.",
    });
  }
});

//Smao kad se izabere nova ishrana
app.patch("/updateNaminice", async (req, res) => {
  const { id, namirnice, namirniceDa, selectedIshranaNaziv, selectedIshrana } =
    req.body;

  // console.log("Podaci podlsti: ", req.body);

  try {
    const user = await User.findById(id).exec();

    // console.log("Pre ažuriranja korisnika:", user);

    user.namirnice = namirnice;
    user.namirniceDa = namirniceDa;
    user.selectedIshranaNaziv = selectedIshranaNaziv;
    user.selectedIshrana = selectedIshrana;

    // Spremanje korisnika u bazu
    const updatedUser = await user.save();

    // console.log("Ažurirani korisnik:", updatedUser);

    // Odgovaranje klijentu
    res.json({
      message: `${updatedUser.name} has been updated successfully`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ message: "Error updating user", error });
  }
});

//Kada se promeni neka naminica - ODRADI
// app.patch("/updateNaminice/jedna", async (req, res) => {
//   const { id, namirnice, namirniceDa, selectedIshranaNaziv, selectedIshrana } =
//     req.body;

//   // console.log("Podaci podlsti: ", req.body);

//   try {
//     const user = await User.findById(id).exec();

//     // console.log("Pre ažuriranja korisnika:", user);

//     user.namirnice = namirnice;
//     user.namirniceDa = namirniceDa;
//     user.selectedIshranaNaziv = selectedIshranaNaziv;
//     user.selectedIshrana = selectedIshrana;

//     // Spremanje korisnika u bazu
//     const updatedUser = await user.save();

//     // console.log("Ažurirani korisnik:", updatedUser);

//     // Odgovaranje klijentu
//     res.json({
//       message: `${updatedUser.name} has been updated successfully`,
//       updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating user: ", error);
//     res.status(500).json({ message: "Error updating user", error });
//   }
// });

//Za novog korisnika da mu bude default
app.patch("/updateDefaultData", async (req, res) => {
  const { id, primcilj, activityLevel } = req.body;

  // console.log("Podaci podlsti: ", req.body);

  try {
    const user = await User.findById(id).exec();

    console.log("Pre ažuriranja korisnika:", user);

    user.primcilj = primcilj;
    user.actlvl = activityLevel;

    // Spremanje korisnika u bazuf
    const updatedUser = await user.save();

    // console.log("Ažurirani korisnik:", updatedUser);

    // Odgovaranje klijentu
    res.json({
      message: `${updatedUser.name} has been updated successfully`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ message: "Error updating user", error });
  }
});

app.get("/getUserData/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).exec();

    if (!user) {
      return res.status(400).json({ message: "Nije nadjen korisnik" });
    }

    const paket = await Paket.findOne({
      idUser: id,
      status: "Aktivan",
    })
      .sort({ datum_kreiranja: -1 })
      .exec();

    res.json({ user, paket: paket || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.get("/get-pakete/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const pakets = await Paket.find({
//       idUser: id,
//       status: "Aktivan"
//     });
//     res.send({ status: "ok", data: pakets });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ status: "error", message: "Error fetching pakets" });
//   }
// });

app.post("/initalUpdate/:id", async (req, res) => {
  const { id, name, lastname, datumRodjenja, pol, tezina, visina, wellcome } =
    req.body;

  try {
    const user = await User.findById(id).exec();

    console.log("Pre ažuriranja korisnika:", user);

    user.name = name;
    user.lastname = lastname;
    user.datumRodjenja = datumRodjenja || user.datumRodjenja;
    user.pol = pol || user.pol;
    user.visina = visina || user.visina;
    user.tezina = tezina || user.tezina;
    user.wellcome = wellcome || user.wellcome;

    // Spremanje korisnika u bazu
    const updatedUser = await user.save();

    // console.log("Ažurirani korisnik:", updatedUser);

    // Odgovaranje klijentu
    res.json({
      message: `${updatedUser.name} has been updated successfully`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ message: "Error updating user", error });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token nije pronađen." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by userId (decoded from the token)
    const user = await User.findById(decoded.userId);
    console.log("User found for verification => ", user);

    if (!user) {
      return res.render("korisnikNijePronadjen");
    }

    if (user.isVerified) {
      return res.render("vecVerifikovan");
    }

    user.isVerified = true;
    await user.save();

    return res.render("verificationSuccess");
  } catch (err) {
    console.error(err);
    return res.render("verificationFail");
  }
});

//Stari endpoint - hvatanje iz baze...
// app.post("/profilePic/:id", async (req, res) => {
//   const img = req.body.myFile; // Assuming the request sends { myFile: "base64string" }
//   const id = req.params.id;

//   try {
//     const user = await User.findById(id).exec();
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.myFile = img;
//     await user.save();
//     res.status(201).json({ msg: "New image uploaded!" });
//   } catch (error) {
//     res.status(409).json({ message: error.message });
//   }
// });

//Stari endpoint - hvatanje iz baze...
// GET endpoint for fetching the profile picture
// app.get("/profilePic/:id", async (req, res) => {
//   const id = req.params.id;

//   try {
//     const user = await User.findById(id).exec();
//     if (!user || !user.myFile) {
//       return res.status(404).json({ message: "No profile picture found" });
//     }
//     res.status(200).json({ file: user.myFile });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

//Smestanje na serveru

//Poslenje kreiran public blog
app.get("/blogNew", async (req, res) => {
  try {
    // Pronađi najnoviji blog sa `tip === "false"`, sortiran opadajuće po `date`
    const latestBlog = await Blog.findOne({ tip: "false" }).sort({
      date: -1,
    });

    if (!latestBlog) {
      return res
        .status(404)
        .json({ message: "Nijedan blog sa tipom 'false' nije pronađen" });
    }

    res.json(latestBlog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru" });
  }
});

//Poslenje kreiran public blog
app.post("/blogHistory", async (req, res) => {
  try {
    const { id, tip } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Id je obavezan." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Nevalidan ID." });
    }

    let query = { _id: id };
    if (tip === "false") {
      query.tip = false;
    }

    const currentBlog = await Blog.findOne(query);

    if (!currentBlog) {
      return res.status(404).json({ message: "Blog nije pronađen." });
    }

    const previousBlog = await Blog.findOne({
      ...(tip === "false" ? { tip: false } : {}),
      _id: { $lt: id },
    }).sort({ _id: -1 });

    const nextBlog = await Blog.findOne({
      ...(tip === "false" ? { tip: false } : {}),
      _id: { $gt: id },
    }).sort({ _id: 1 });

    res.json({
      current: currentBlog,
      previous: previousBlog || null,
      next: nextBlog || null,
    });
  } catch (error) {
    console.error("Error fetching blog history:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

app.post("/proveraEmaila", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ mail: email });

    if (user) {
      return res
        .status(200)
        .json({ message: "Posedujete nalog, možete se ulogovati!" });
    } else {
      return res
        .status(404)
        .json({ error: "Nemate nalog, možete ga napraviti" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Došlo je do greške na serveru!" });
  }
});

app.post("/reTokenizer", async (req, res) => {
  const { mail, id } = req.body;

  try {
    const verificationToken = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const verificationLink = `${process.env.FRONTEND_URL}:5000/verify-email?token=${verificationToken}`;
    // const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: "smtp.gmail.com",
    //   port: 465,
    //   secure: true, //Mozda je ovo problem
    //   auth: {
    //     user: "office@nutritrans.com",
    //     pass: "jezq ddqo aynu qucx",
    //   },
    // });
    //stara => jezq ddqo aynu qucx

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "office@nutritrans.com",
        pass: "jezq ddqo aynu qucx",
      },
    });

    const mailOptions = {
      from: "office@nutritrans.com",
      to: mail,
      subject: "Registracija profila",
      // html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      //         <h1 style="color: #333;">Zahtev za aktivaciju profila</h1>
      //         <p style="color: #555;">Dobili smo zahtrev za resetovanje Vase šifre, kliknite dole da bi ste je resetovali</p>
      //         <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resetuj lozinku</a>
      //         <p style="color: #555; margin-top: 20px;">Ako niste poslali zahtev za resetovanje šifre onda ignorišite ovaj mail.</p>
      //       </div>`,
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
                <img src="${process.env.FRONTEND_URL}:5000/logoo.png" alt="Nutrition Transformation Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #333; font-size: 28px;">🔒 Zahtev za aktivaciju profila 🔒</h1>
                <p style="color: #555; font-size: 18px;">Dobili smo zahtev za resetovanje Vaše šifre. Kliknite na dugme ispod da biste je resetovali.</p>
                
                <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; font-size: 18px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">🔑 Resetuj lozinku</a>
                
                <p style="color: #777; font-size: 14px; margin-top: 30px;">Ako niste poslali zahtev za resetovanje šifre, slobodno ignorišite ovaj email.</p>
                
                <p style="color: #999; font-size: 12px; margin-top: 20px;">Molimo Vas da ne odgovarate na ovaj email. Hvala na poverenju! 🔐</p>
            </div>
            `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error); // Detaljan log greške
        return res.status(400).json({ message: "Nije uspelo slanje na mail" });
      } else {
        console.log("Email sent:", info);
        return res.status(200).json({ message: "Email uspešno poslat!" });
      }
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru" });
  }
});

//./public/logoo.png
//./public/firstpage.png

// doc.registerFont("OpenSans_Condensed-Regular", "./fonts/OpenSans_Condensed-Regular.ttf");
// doc.registerFont("OpenSans_Condensed-Bold", "./fonts/OpenSans_Condensed-Bold.ttf");
// doc.registerFont("OpenSans_Condensed-BoldItalic", "./fonts/OpenSans_Condensed-BoldItalic.ttf");
// doc.font("OpenSans_Condensed-Regular");

//Ok ali treba da se dodaju stvari!
// app.get('/createpdf', async (req, res) => {
//   try {
//       // Kreiranje PDF dokumenta
//       const doc = new PDFDocument({
//           size: 'A4',
//           margin: 0 // Bez margina kako bi slika popunila celu stranicu
//       });

//       doc.registerFont("OpenSans_Condensed-Regular", "./fonts/OpenSans_Condensed-Regular.ttf");
//       doc.registerFont("OpenSans_Condensed-Bold", "./fonts/OpenSans_Condensed-Bold.ttf");
//       doc.registerFont("OpenSans_Condensed-BoldItalic", "./fonts/OpenSans_Condensed-BoldItalic.ttf");
//       doc.font("OpenSans_Condensed-Regular");

//       // Output fajla - čuvanje u memoriji
//       const pdfBuffers = [];
//       doc.on('data', (chunk) => pdfBuffers.push(chunk));
//       doc.on('end', () => {
//           const pdfData = Buffer.concat(pdfBuffers);
//           res.setHeader('Content-Type', 'application/pdf');
//           res.setHeader('Content-Disposition', 'inline; filename=FirstPage.pdf');
//           res.send(pdfData);
//       });

//       // Dodavanje slike na stranicu
//       doc.image('./public/firstpage.png', 0, 0, { width: 597, height: 841.89 }); // A4 dimenzije u pt

//       // Dodavanje teksta na sliku
//       doc.font('OpenSans_Condensed-Bold') // Font i stil
//           .fontSize(24)          // Veličina fonta
//           .fillColor('black')    // Boja teksta
//           .text('Vladimir Jovanovic', 70, 615, { align: 'left' });

//       // Zatvaranje dokumenta
//       doc.end();
//   } catch (error) {
//       console.error('Error generating PDF:', error);
//       res.status(500).send('Error generating PDF');
//   }
// });

//Samo jedna stranica
// app.get('/createpdf', async (req, res) => {
//   try {
//       // Kreiranje PDF dokumenta
//       const doc = new PDFDocument({
//           size: 'A4',
//           margin: 0 // Bez margina kako bi slika popunila celu stranicu
//       });

//       doc.registerFont("OpenSans_Condensed-Regular", "./fonts/OpenSans_Condensed-Regular.ttf");
//       doc.registerFont("OpenSans_Condensed-Bold", "./fonts/OpenSans_Condensed-Bold.ttf");
//       doc.registerFont("OpenSans_Condensed-BoldItalic", "./fonts/OpenSans_Condensed-BoldItalic.ttf");

//       // Output fajla - čuvanje u memoriji
//       const pdfBuffers = [];
//       doc.on('data', (chunk) => pdfBuffers.push(chunk));
//       doc.on('end', () => {
//           const pdfData = Buffer.concat(pdfBuffers);
//           res.setHeader('Content-Type', 'application/pdf');
//           res.setHeader('Content-Disposition', 'inline; filename=FirstPage.pdf');
//           res.send(pdfData);
//       });

//       // Dodavanje slike na stranicu
//       doc.image('./public/firstpage.png', 0, 0, { width: 597, height: 841.89 }); // A4 dimenzije u pt

//       // Tekst i font
//       const text = 'Veljko Milicevic'; // Tekst koji se prikazuje
//       const textFont = "OpenSans_Condensed-Bold"; // Font koji se koristi za tekst
//       const textFontSize = 24; // Veličina fonta
//       const textX = 70; // Početna X koordinata teksta
//       const textY = 615; // Početna Y koordinata teksta

//       // Postavi font i veličinu fonta pre računanja širine teksta
//       doc.font(textFont).fontSize(textFontSize);

//       // Izračunavanje širine teksta
//       const textWidth = doc.widthOfString(text); // Širina teksta
//       const textHeight = textFontSize * 0.7; // Približna visina teksta (proporcija fonta)

//       // Dodavanje linije koja pokriva ceo tekst
//       doc
//           .moveTo(textX, textY - textHeight - 5) // Početak linije
//           .lineTo(textX + textWidth, textY - textHeight - 5) // Kraj linije, širine celog teksta
//           .lineWidth(20) // Debljina linije
//           .strokeColor('#81B873') // Boja linije
//           .stroke(); // Primena linije

//       // Dodavanje teksta na sliku
//       doc.fillColor('black')           // Boja teksta
//           .text(text, textX, textY, { align: 'left' });

//       // Zatvaranje dokumenta
//       doc.end();
//   } catch (error) {
//       console.error('Error generating PDF:', error);
//       res.status(500).send('Error generating PDF');
//   }
// });

//Dve stranice
app.get("/createpdf", async (req, res) => {
  try {
    // Kreiranje PDF dokumenta
    const doc = new PDFDocument({
      size: "A4",
      margin: 0, // Bez margina kako bi slika popunila celu stranicu
    });

    doc.registerFont(
      "OpenSans_Condensed-Regular",
      "./fonts/OpenSans_Condensed-Regular.ttf"
    );
    doc.registerFont(
      "OpenSans_Condensed-Bold",
      "./fonts/OpenSans_Condensed-Bold.ttf"
    );
    doc.registerFont(
      "OpenSans_Condensed-BoldItalic",
      "./fonts/OpenSans_Condensed-BoldItalic.ttf"
    );

    // Output fajla - čuvanje u memoriji
    const pdfBuffers = [];
    doc.on("data", (chunk) => pdfBuffers.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(pdfBuffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=FirstPage.pdf");
      res.send(pdfData);
    });

    // Dodavanje slike na prvu stranicu
    doc.image("./public/firstpage2.png", 0, 0, { width: 597, height: 841.89 }); // A4 dimenzije u pt

    // Dodavanje teksta na prvu stranicu
    const text = "Nikola Srebric"; // Tekst koji se prikazuje
    const textFont = "OpenSans_Condensed-Bold"; // Font koji se koristi za tekst
    const textFontSize = 24; // Veličina fonta
    const textX = 70; // Početna X koordinata teksta
    const textY = 615; // Početna Y koordinata teksta

    // Postavi font i veličinu fonta pre računanja širine teksta
    doc.font(textFont).fontSize(textFontSize);

    // Izračunavanje širine teksta
    const textWidth = doc.widthOfString(text); // Širina teksta
    const textHeight = textFontSize * 0.7; // Približna visina teksta (proporcija fonta)

    // Dodavanje linije koja pokriva ceo tekst
    doc
      .moveTo(textX, textY - textHeight - 5) // Početak linije
      .lineTo(textX + textWidth, textY - textHeight - 5) // Kraj linije, širine celog teksta
      .lineWidth(25) // Debljina linije
      .strokeColor("#81B873") // Boja linije
      .stroke(); // Primena linije

    // Dodavanje teksta na prvu stranicu
    doc
      .fillColor("black") // Boja teksta
      .text(text, textX, textY, { align: "left" });

    // Dodavanje druge stranice
    doc.addPage();

    // Dodavanje slike na drugu stranicu
    doc.image("./public/secondPage.png", 0, 0, { width: 597, height: 841.89 }); // A4 dimenzije u pt

    // Zatvaranje dokumenta
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

function updateDate(duration) {
  let currentDate = new Date();

  if (duration === "monthly") {
    currentDate.setMonth(currentDate.getMonth() + 1);
  } else if (duration === "yearly") {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  } else if (duration === "Mesečno") {
    currentDate.setFullYear(currentDate.getMonth() + 1);
  } else if (duration === "Godišnje") {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }

  return currentDate;
}

//Paymanent's
//Kupovanje paketa
// app.post('/generate-payment-form', (req, res) => {

//   try{
//     const { id, orderId, amount, okUrl, failUrl, paketId, duration } = req.body;
//     console.log("ORDERID => " , orderId, "AMOUNT => ",amount , "OKURL => ", okUrl, "FAILURL => ", failUrl);

//     // if(paketId == 1){ //DA LI DA OMOGUCIM DA SE MOZE MANUELNO PREBACITI NA BESPLATNI ILI DA OSTAVIM KAD MU ISTEKNE DA BUDE KAO BESPLATNI...

//     // }

//     const randomString = Array(20)
//         .fill(null)
//         .map(() => (Math.random() * 36 | 0).toString(36))
//         .join('');

//     const clientId = "13IN003415";              // Merchant ID (dobija se od banke)
//     const oid = orderId || "";                  // ID porudžbine
//     const aAmount = amount || "";               // Cena
//     const trantype = "Auth";                    // Transakcioni tip
//     const rnd = randomString;
//     const currency = "941";                     // Valuta
//     const storeKey = "Nutritrans01";            // Ključ prodavnice
//     const storeType = "3d_pay_hosting";         // Tip prodavnice
//     const lang = "en";                          // Jezik
//     const hashAlgorithm = "ver2";               // Algoritam

//     const plainText = [
//         clientId,
//         oid,
//         aAmount,
//         okUrl,
//         failUrl,
//         trantype,
//         "", // UserCode - nije potrebno
//         rnd,
//         "", // CardNumber - nije potrebno
//         "", // Expiry - nije potrebno
//         "", // CVV - nije potrebno
//         currency,
//         storeKey
//     ].join('|');

//     console.log("PLAINTEXT => " , plainText);

//     const hashValue = crypto.createHash('sha512').update(plainText).digest('hex');
//     const hash = Buffer.from(hashValue, 'hex').toString('base64'); // Heksadecimalna vrednost

//     const payURL = "https://testsecurepay.eway2pay.com/fim/est3Dgate"; // Test okruženje

//     // Kreiranje paketa u bazu
//     const noviPaket = new Paket({
//       // orgderId: `${orderId.split('-')[0]}-${orderId.split('-')[1]}`,
//       orgderId: orderId,
//       naziv_paketa: orderId.split('-')[0],
//       cena: amount,
//       valuta: 'RSD',
//       status_placanja: 'Plaćeno',
//       status: 'Aktivan',
//       broj: {
//         full: orderId.split('-')[0] === "Standard" ? 1 : 5,
//         base: orderId.split('-')[0] === "Standard" ? 4 : 0
//       },
//       datum_kreiranja: new Date(),
//       datum_placanja: new Date(),
//       datum_isteka: updateDate(duration),
//       tip: duration === "monthly" ? "Mesečno" : "Godišnje",
//       idUser: id,
//       transakcioni_id: `${oid}-${Date.now()}`,
//       metoda_placanja: 'Kartica'
//     });

//     // MORAM SAMO DA CUVAM U BAZU ONE USPESNE!!!
//     noviPaket.save()
//       .then((paket) => {
//         console.log('Paket je uspešno sačuvan:', paket);
//       })
//       .catch((err) => {
//         console.log('Greška pri čuvanju paketa:', err);
//       });

//     // Vraćanje podataka za formu
//     res.json({
//         payURL,
//         formData: {
//             currency,
//             trantype,
//             okUrl,
//             failUrl,
//             amount: aAmount,
//             oid,
//             clientid: clientId,
//             storetype: storeType,
//             lang,
//             hashAlgorithm,
//             rnd,
//             encoding: "utf-8",
//             hash
//         }
//     });

//     // res.status(201).json({ msg: "Uspesno kreiran a transakcija" });
//   }catch(error){
//     console.error('Error generating PDF:', error);
//     res.status(500).send('Error generating PDF');
//   }
// });

//ORIGINAL
// app.post("/generate-payment-form", async (req, res) => {
//   try {
//     const { id,email, orderId, amount, okUrl, failUrl, paketId, duration } = req.body;
//     console.log('email => ', email);

//     const transactionId = `${orderId}-${Date.now()}`;

//     const randomString = Array(20)
//       .fill(null)
//       .map(() => ((Math.random() * 36) | 0).toString(36))
//       .join("");

//     const clientId = "13IN003415";
//     const oid = orderId || "";
//     const aAmount = amount || "";
//     const trantype = "Auth";
//     const rnd = randomString;
//     const currency = "941";
//     const storeKey = "Nutritrans01";
//     const storeType = "3d_pay_hosting";
//     const lang = "en";
//     const hashAlgorithm = "ver2";

//     const plainText = [
//       clientId,
//       oid,
//       aAmount,
//       okUrl,
//       failUrl,
//       trantype,
//       "", // UserCode - nije potrebno
//       rnd,
//       "", // CardNumber - nije potrebno
//       "", // Expiry - nije potrebno
//       "", // CVV - nije potrebno
//       currency,
//       storeKey,
//     ].join("|");

//     const hashValue = crypto
//       .createHash("sha512")
//       .update(plainText)
//       .digest("hex");
//     const hash = Buffer.from(hashValue, "hex").toString("base64");

//     const payURL = "https://testsecurepay.eway2pay.com/fim/est3Dgate";

//     // Sačuvaj podatke o transakciji u bazu
//     const noviPaket = new Paket({
//       orgderId: orderId,
//       naziv_paketa: orderId.split("-")[0],
//       cena: amount,
//       valuta: "RSD",
//       status: "Neaktivan",
//       broj: {
//         full: orderId.split("-")[0] === "Standard" ? 1 : 5,
//         base: orderId.split("-")[0] === "Standard" ? 4 : 0,
//       },
//       status_placanja: "Pending",
//       datum_kreiranja: new Date(),
//       datum_placanja: null,
//       tip: duration === "monthly" ? "Mesečno" : "Godišnje",
//       idUser: id,
//       transakcioni_id: transactionId, // Povezujemo ovo sa bankaSuccess
//       metoda_placanja: "Kartica",
//       userMail: email
//     });

//     await noviPaket.save();

//     res.json({
//       payURL,
//       formData: {
//         currency,
//         trantype,
//         okUrl,
//         failUrl,
//         amount: aAmount,
//         oid,
//         clientid: clientId,
//         storetype: storeType,
//         lang,
//         hashAlgorithm,
//         rnd,
//         encoding: "utf-8",
//         hash,
//       },
//       transactionId,
//     });
//   } catch (error) {
//     console.error("Error generating payment form:", error);
//     res.status(500).send("Error generating payment form");
//   }
// });

//Nece na http://nutritrans.rs a hoce na http://13.50.180.98:5000
// app.post("/bankaSuccess", (req, res) => {
//   res.render("bankaSuccess");
// });

//
// app.post('/bankaSuccess', async (req, res) => {
//   try {
//     console.log("FULL BANK RESPONSE =>", req.body);

//     const { ReturnOid, TransId, 'EXTRA.RECURRINGID': recurringID } = req.body;

//     if (!ReturnOid || !TransId) {
//       return res.status(400).json({
//         message: 'Missing required fields: ReturnOid or TransId'
//       });
//     }

//     const paket = await Paket.findOneAndUpdate(
//       { orgderId: ReturnOid },
//       {
//         status_placanja: 'Plaćeno',
//         status: 'Aktivan',
//         datum_placanja: new Date(),
//         datum_isteka: '',
//         TransId: TransId,
//         recurringID: recurringID || null
//       },
//     );

//     if (!paket) {
//       return res.status(404).json({
//         message: 'Transaction not found for the given ReturnOid'
//       });
//     }

//     // res.status(200).json({  //Da mi pokaze gde je sta
//     //   message: 'Transaction successfully processed',
//     //   transactionId: TransId,
//     //   paket
//     // });

//     // console.log('Banka success => ', paket);

//     res.render("bankaSuccess");  //Za kasnije

//   } catch (error) {
//     console.error("Error processing bank response:", error);

//     res.status(500).json({
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// });

//Sve radi ali ne salje racun na mail i ne prikazuje sve podatke kad zavrsi
// app.post("/bankaSuccess", async (req, res) => {
//   try {
//     console.log("FULL BANK RESPONSE SUCCESS =>", req.body);

//     const { ReturnOid, TransId, "EXTRA.RECURRINGID": recurringID } = req.body;

//     if (!ReturnOid || !TransId) {
//       return res.status(400).json({
//         message: "Missing required fields: ReturnOid or TransId",
//       });
//     }

//     const paket = await Paket.findOne({ orderId: ReturnOid });

//     // Proveri da li je paket pronađen
//     if (!paket) {
//       throw new Error("Paket nije pronađen");
//     }

//     // 2. Postavi datum_isteka u zavisnosti od tipa paketa
//     const datumIsteka =
//       paket.tip === "Mečecno"
//         ? new Date(new Date().setMonth(new Date().getMonth() + 1))
//         : updateDate(paket.tip);

//     // 3. Ažuriraj paket
//     const updatedPaket = await Paket.findOneAndUpdate(
//       { orderId: ReturnOid },
//       {
//         status_placanja: "Plaćeno",
//         status: "Aktivan",
//         datum_placanja: new Date(),
//         datum_isteka: datumIsteka,
//         TransId: TransId,
//         recurringID: recurringID || null,
//       },
//       {
//         new: true, // Vraća ažurirani objekat
//         runValidators: true, // Pomaže u validaciji prilikom ažuriranja
//       }
//     );

//     // 4. Proveri rezultat
//     if (!updatedPaket) {
//       console.log("Paket nije ažuriran");
//     } else {
//       console.log("Ažurirani paket:", updatedPaket);
//     }

//     // res.status(200).json({  //Da mi pokaze gde je sta
//     //   message: 'Transaction successfully processed',
//     //   transactionId: TransId,
//     //   paket
//     // });

//     // console.log('Banka success => ', paket);

//     res.render("bankaSuccess"); //Za kasnije
//   } catch (error) {
//     console.error("Error processing bank response:", error);

//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

//❗👷🔨 - ORIGINAL
// app.post("/bankaSuccess", async (req, res) => {
//   try {
//     console.log("FULL BANK RESPONSE SUCCESS =>", req.body);

//     const { ReturnOid, TransId, "EXTRA.RECURRINGID": recurringID } = req.body;

//     if (!ReturnOid || !TransId) {
//       return res.status(400).json({
//         message: "Missing required fields: ReturnOid or TransId",
//       });
//     }

//     const paket = await Paket.findOne({ orderId: ReturnOid });

//     // Proveri da li je paket pronađen
//     if (!paket) {
//       throw new Error("Paket nije pronađen");
//     }

//     // 2. Postavi datum_isteka u zavisnosti od tipa paketa
//     const datumIsteka =
//       paket.tip === "Mečecno"
//         ? new Date(new Date().setMonth(new Date().getMonth() + 1))
//         : updateDate(paket.tip);

//     // 3. Ažuriraj paket
//     const updatedPaket = await Paket.findOneAndUpdate(
//       { orderId: ReturnOid },
//       {
//         status_placanja: "Plaćeno",
//         status: "Aktivan",
//         datum_placanja: new Date(),
//         datum_isteka: datumIsteka,
//         TransId: TransId,
//         recurringID: recurringID || null,
//       },
//       {
//         new: true, // Vraća ažurirani objekat
//         runValidators: true, // Pomaže u validaciji prilikom ažuriranja
//       }
//     );

//     // 4. Proveri rezultat
//     if (!updatedPaket) {
//       console.log("Paket nije ažuriran");
//     } else {
//       // console.log("Paket:", paket);
//       console.log("Ažurirani paket:", updatedPaket);
//     }

//       //Saljemo paket
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.email",
//         port: 587,
//         secure: false,
//         auth: {
//           user: "office@nutritrans.com",
//           pass: "jezq ddqo aynu qucx",
//         },
//       });

//       console.log('SLANJE NA => ', paket.userMail); //

//       const mailOptions = {
//         from: "office@nutritrans.com",
//         to: updatedPaket.userMail,
//         subject: "Kupovina paketa",
//         html: `
//               <!DOCTYPE html>
//               <html lang="sr">
//               <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Detalji o paketu</title>
//                 <style>
//                   body {
//                     font-family: Arial, sans-serif;
//                     background-color: #f4f4f9;
//                     margin: 0;
//                     padding: 0;
//                   }

//                   .container {
//                     width: 80%;
//                     margin: 30px auto;
//                     background-color: white;
//                     padding: 20px;
//                     border-radius: 8px;
//                     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//                   }

//                   h1 {
//                     text-align: center;
//                     color: #333;
//                   }

//                   table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     margin-top: 20px;
//                   }

//                   th, td {
//                     padding: 12px 20px;
//                     text-align: left;
//                     border-bottom: 1px solid #ddd;
//                   }

//                   th {
//                     background-color: #f1f1f1;
//                     color: #555;
//                     font-weight: bold;
//                   }

//                   tr:hover {
//                     background-color: #f9f9f9;
//                   }

//                   p {
//                     color: #555;
//                     line-height: 1.6;
//                   }

//                   .footer {
//                     text-align: center;
//                     margin-top: 20px;
//                     color: #888;
//                   }
//                 </style>
//               </head>
//               <body>

//                 <div class="container">
//                   <h1>Detalji o vašoj kupovini</h1>
//                   <p>Poštovani,</p>
//                   <p>Hvala što ste kupili paket <strong>${updatedPaket.naziv_paketa}</strong>!</p>
//                   <p><strong>Detalji o vašoj kupovini:</strong></p>

//                   <table>
//                     <tr>
//                       <th>Order ID</th>
//                       <td>${updatedPaket.orgderId}</td>
//                     </tr>
//                     <tr>
//                       <th>Tip paketa</th>
//                       <td>${updatedPaket.tip}</td>
//                     </tr>
//                     <tr>
//                       <th>Cena</th>
//                       <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
//                     </tr>
//                     <tr>
//                       <th>Status plaćanja</th>
//                       <td>${updatedPaket.status_placanja}</td>
//                     </tr>
//                     <tr>
//                       <th>Metoda plaćanja</th>
//                       <td>${updatedPaket.metoda_placanja}</td>
//                     </tr>
//                     <tr>
//                       <th>Transakcioni ID</th>
//                       <td>${updatedPaket.TransId}</td>
//                     </tr>
//                     <tr>
//                       <th>Datum kreiranja</th>
//                       <td>${new Date(updatedPaket.datum_kreiranja).toLocaleString()}</td>
//                     </tr>
//                     <tr>
//                       <th>Datum plaćanja</th>
//                       <td>${new Date(updatedPaket.datum_placanja).toLocaleString()}</td>
//                     </tr>
//                     <tr>
//                       <th>Datum isteka paketa</th>
//                       <td>${new Date(updatedPaket.datum_isteka).toLocaleString()}</td>
//                     </tr>
//                   </table>

//                   <p>Vaš paket je sada aktivan.</p>
//                   <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>

//                   <p>S poštovanjem,</p>
//                   <p>Tim NutriTrans</p>

//                   <div class="footer">
//                     <p>NutriTrans - Vaš partner za zdravlja</p>
//                   </div>
//                 </div>

//               </body>
//               </html>
//         `,
//       };

//       // <p>Vaš paket je sada aktivan i može se koristiti do <strong>${new Date(updatedPaket.datum_isteka).toLocaleDateString()}</strong>.</p>

//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           return res.status(400).json({ message: "Nije uspelo slanje na mail" });
//         } else {
//           console.log("Email poslat: " + info.response);
//         }
//       });

//     let htmlContent_ = `<!DOCTYPE html>
// <html lang="sr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Transakcija uspešno obrađena</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f9;
//             margin: 0;
//             padding: 0;
//         }
//         .container {
//             width: 80%;
//             margin: 30px auto;
//             background-color: white;
//             padding: 20px;
//             border-radius: 8px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .center {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             min-height: 100vh;
//         }
//         .header-icon {
//             width: 80px;
//             height: 80px;
//             background-color: #e6f4e6;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin-bottom: 20px;
//         }
//         .header-icon svg {
//             color: #2d6a4f;
//             width: 40px;
//             height: 40px;
//         }
//         h1 {
//             text-align: center;
//             color: #333;
//             font-size: 24px;
//             font-weight: bold;
//         }
//         p {
//             color: #555;
//             line-height: 1.6;
//         }
//         .button {
//             display: inline-block;
//             padding: 10px 20px;
//             background-color: #2d6a4f;
//             color: white;
//             text-decoration: none;
//             border-radius: 4px;
//             text-align: center;
//             margin-top: 30px;
//         }
//         .button:hover {
//             background-color: #1e5b3d;
//         }
//         table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-top: 20px;
//         }
//         th,
//         td {
//             padding: 12px 20px;
//             text-align: left;
//             border-bottom: 1px solid #ddd;
//         }
//         th {
//             background-color: #f1f1f1;
//             color: #555;
//             font-weight: bold;
//         }
//         tr:hover {
//             background-color: #f9f9f9;
//         }
//         .footer {
//             text-align: center;
//             margin-top: 20px;
//             color: #888;
//         }
//         .checkmark-container {
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             margin-top: 20px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//             <div class="checkmark-container">
//             <div class="header-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
//                 </svg>
//             </div>
//         </div>
//         <h1>Transakcija uspešno obrađena</h1>
//         <p>Poštovani,</p>
//         <p>Hvala što ste kupili paket <strong>${updatedPaket.naziv_paketa}</strong>!</p>
//         <p><strong>Detalji o vašoj kupovini:</strong></p>
//         <table>
//             <tr>
//                 <th>Order ID</th>
//                 <td>${updatedPaket.orgderId}</td>
//             </tr>
//             <tr>
//                 <th>Tip paketa</th>
//                 <td>${updatedPaket.tip}</td>
//             </tr>
//             <tr>
//                 <th>Cena</th>
//                 <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
//             </tr>
//             <tr>
//                 <th>Status plaćanja</th>
//                 <td>${updatedPaket.status_placanja}</td>
//             </tr>
//             <tr>
//                 <th>Metoda plaćanja</th>
//                 <td>${updatedPaket.metoda_placanja}</td>
//             </tr>
//             <tr>
//                 <th>Transakcioni ID</th>
//                 <td>${updatedPaket.TransId}</td>
//             </tr>
//             <tr>
//                 <th>Datum kreiranja</th>
//                 <td>${new Date(updatedPaket.datum_kreiranja).toLocaleString()}</td>
//             </tr>
//             <tr>
//                 <th>Datum plaćanja</th>
//                 <td>${new Date(updatedPaket.datum_placanja).toLocaleString()}</td>
//             </tr>
//             <tr>
//                 <th>Datum isteka paketa</th>
//                 <td>${new Date(updatedPaket.datum_isteka).toLocaleString()}</td>
//             </tr>
//         </table>
//         <p>Vaš paket je sada aktivan i može se koristiti do <strong>${new Date(updatedPaket.datum_isteka).toLocaleDateString()}</strong>.</p>
//         <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>
//         <p>S poštovanjem,</p>
//         <p>Tim NutriTrans</p>
//         <div class="footer">
//             <a href="https://nutritrans.rs/dash" class="button">Povratak na početnu stranicu</a>
//         </div>
//     </div>
// </body>
// </html>
// `

//     res.send(htmlContent_);

//   } catch (error) {
//     console.error("Error processing bank response:", error);

//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

//OVAJ KORISTIM
app.post("/generate-payment-form", async (req, res) => {
  try {
    const { id, email, orderId, amount, okUrl, failUrl, paketId, duration } =
      req.body;
    // console.log("Email => ", email);

    const foundUser = await User.findById(id);

    // console.log('foundUser => ', foundUser.name, foundUser.lastName);

    const transactionId = `${orderId}-${Date.now()}`;

    const randomString = Array(20)
      .fill(null)
      .map(() => ((Math.random() * 36) | 0).toString(36))
      .join("");

    const clientId = process.env.MERCHENT_ID;
    const oid = orderId || "";
    const aAmount = amount || "";
    const trantype = "Auth";
    const rnd = randomString;
    const currency = "941";
    const storeKey = process.env.STORE_KEY;
    const storeType = "3d_pay_hosting";
    const lang = "sr";
    const hashAlgorithm = "ver2";

    const plainText = [
      clientId,
      oid,
      aAmount,
      okUrl,
      failUrl,
      trantype,
      "", // UserCode
      rnd,
      "", // CardNumber
      "", // Expiry
      "", // CVV
      currency,
      storeKey,
    ].join("|");

    const hashValue = crypto
      .createHash("sha512")
      .update(plainText, "utf8")
      .digest("hex");
    const hash = Buffer.from(hashValue, "hex").toString("base64");

    const payURL = "https://testsecurepay.eway2pay.com/fim/est3Dgate";

    let noviPaket = null;
    if (foundUser) {
      // Sačuvaj podatke o transakciji u bazu
      noviPaket = new Paket({
        orgderId: orderId,
        naziv_paketa: orderId.split("-")[0],
        cena: amount,
        valuta: "RSD",
        status: "Neaktivan",
        broj: {
          full: orderId.split("-")[0] === "Standard" ? 1 : 5,
          base: orderId.split("-")[0] === "Standard" ? 4 : 0,
        },
        status_placanja: "Pending",
        datum_kreiranja: new Date(),
        datum_placanja: null,
        tip: duration === "monthly" ? "Mesečno" : "Godišnje",
        idUser: id,
        transakcioni_id: transactionId,
        metoda_placanja: "Kartica",
        userMail: email,
        username: foundUser.name,
        userLastname: foundUser.lastName,
      });

      await noviPaket.save();
    }

    const periodUnit = duration === "monthly" ? "mesec" : "dan";
    const recurringMessage = `Ukupno 99!!! iznosa će biti naplaćeno svakih 1 ${periodUnit}!!!`;

    // console.log("✅ Generisan tekst za prikaz:", recurringMessage);

    res.json({
      payURL,
      formData: {
        currency,
        trantype,
        okUrl,
        failUrl,
        amount: aAmount,
        oid,
        clientid: clientId,
        storetype: storeType,
        lang,
        hashAlgorithm,
        rnd,
        encoding: "utf-8",
        hash,
        recurringMessage,
      },
      transactionId,
    });
  } catch (error) {
    console.error("Error generating payment form:", error);
    res.status(500).send("Error generating payment form");
  }
});

app.post("/bankaSuccess", async (req, res) => {
  try {
    // console.log("FULL BANK RESPONSE SUCCESS =>", req.body);

    const { ReturnOid, TransId, AuthCode, Response, ProcReturnCode, mdStatus } =
      req.body;
    const recurringID = req.body["EXTRA.RECURRINGID"] || null;

    // console.log('TransId => ', TransId)
    // console.log('ReturnOid => ', ReturnOid)

    if (
      !ReturnOid ||
      !TransId ||
      !AuthCode ||
      !Response ||
      !ProcReturnCode ||
      !mdStatus
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: ReturnOid or TransId or AuthCode or Response",
      });
    }

    const paket = await Paket.findOne({ orgderId: ReturnOid });

    if (!paket) {
      return res.status(404).json({ message: "Paket nije pronađen" });
    }

    const datumIsteka =
      paket.tip === "Mesečno"
        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const updatedPaket = await Paket.findOneAndUpdate(
      { orgderId: ReturnOid },
      {
        status_placanja: "Plaćeno",
        status: "Aktivan",
        datum_placanja: new Date(),
        datum_isteka: datumIsteka,
        TransId,
        recurringID,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPaket) {
      return res.status(500).json({ message: "Greška pri ažuriranju paketa" });
    }

    console.log("Ažurirani paket:", updatedPaket);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "office@nutritrans.com",
        pass: "jezq ddqo aynu qucx",
      },
    });

    // console.log("Slanje na => ", updatedPaket.userMail);

    const mailOptions = {
      from: "office@nutritrans.com",
      to: updatedPaket.userMail,
      subject: "Kupovina paketa",
      html: `
            <!DOCTYPE html>
            <html lang="sr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Detalji o paketu</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f9;
                  margin: 0;
                  padding: 0;
                }

                .container {
                  width: 80%;
                  margin: 30px auto;
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                h1 {
                  text-align: center;
                  color: #333;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }

                th, td {
                  padding: 12px 20px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
                }

                th {
                  background-color: #f1f1f1;
                  color: #555;
                  font-weight: bold;
                }

                tr:hover {
                  background-color: #f9f9f9;
                }

                p {
                  color: #555;
                  line-height: 1.6;
                }

                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #888;
                }
              </style>
            </head>
            <body>

              <div class="container">
                <h1>Detalji o vašoj kupovini</h1>
                
                <p>Poštovani ${updatedPaket.username} ${
        updatedPaket.userLastname
      } uspešno ste kupili ${updatedPaket.naziv_paketa} paket u iznosu od ${
        updatedPaket.cena
      } RSD<strong></strong></p>

                <p><strong>Detalji o vašoj kupovini:</strong></p>

                <table>
                  <tr>
                    <th>Order ID</th>
                    <td>${updatedPaket.orgderId}</td>
                  </tr>
                  <tr>
                    <th>Naziv paketa</th>
                    <td>${updatedPaket.naziv_paketa}</td>
                  </tr>
                  <tr>
                    <th>Tip paketa</th>
                    <td>${updatedPaket.tip}</td>
                  </tr>
                  <tr>
                    <th>Cena</th>
                    <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
                  </tr>
                  <tr>
                    <th>Status plaćanja</th>
                    <td>${updatedPaket.status_placanja}</td>
                  </tr>
                  <tr>
                    <th>Metoda plaćanja</th>
                    <td>${updatedPaket.metoda_placanja}</td>
                  </tr>
                  <tr>
                    <th>Transakcioni ID</th>
                    <td>${updatedPaket.TransId}</td>
                  </tr>
                  <tr>
                    <th>Authorization Code</th>
                    <td>${AuthCode}</td>
                  </tr>
                  <tr>
                    <th>Payment Status</th>
                    <td>${Response}</td>
                  </tr>
                  <tr>
                    <th>Transaction Status Code</th>
                    <td>${ProcReturnCode}</td>
                  </tr>
                   <tr>
                    <th>Status code for the 3D transaction</th>
                    <td>${mdStatus}</td>
                  </tr>
                  <tr>
                    <th>Datum kreiranja</th>
                    <td>${new Date(
                      updatedPaket.datum_kreiranja
                    ).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Datum plaćanja</th>
                    <td>${new Date(
                      updatedPaket.datum_placanja
                    ).toLocaleString()}</td>
                  </tr>
                  ${
                    updatedPaket.tip !== "Mesečno"
                      ? `
                    <tr>
                      <th>Datum isteka paketa</th>
                      <td>${new Date(
                        updatedPaket.datum_isteka
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                  ${
                    updatedPaket.tip == "Mesečno"
                      ? `
                    <tr>
                      <th>Sledeća naplata zakazana za datum</th>
                      <td>${new Date(
                        new Date(updatedPaket.datum_placanja).setMonth(
                          new Date(updatedPaket.datum_placanja).getMonth() + 1
                        )
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }



                </table>

                <p>Vaš paket je sada aktivan.</p>
                <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>

                <p>S poštovanjem,</p>
                <p>Tim NutriTrans</p>

                <div class="footer">
                  <p>NutriTrans - Vaš partner za zdravlja</p>
                </div>
              </div>

            </body>
            </html>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Greška pri slanju emaila:", error);
        return res.status(400).json({ message: "Nije uspelo slanje na mail" });
      } else {
        console.log("Email poslat: " + info.response);
        // Odgovor se šalje tek kada se email uspešno pošalje
        return res.send(
          `<h1>Transakcija uspešna</h1><p>Paket <strong>${updatedPaket.naziv_paketa}</strong> je aktiviran.</p>`
        );
      }
    });

    let htmlContent_ = `<!DOCTYPE html>
    <html lang="sr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transakcija uspešno obrađena</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 80%;
                margin: 30px auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .center {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .header-icon {
                width: 80px;
                height: 80px;
                background-color: #e6f4e6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
            }
            .header-icon svg {
                color: #2d6a4f;
                width: 40px;
                height: 40px;
            }
            h1 {
                text-align: center;
                color: #333;
                font-size: 24px;
                font-weight: bold;
            }
            p {
                color: #555;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #2d6a4f;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                text-align: center;
                margin-top: 30px;
            }
            .button:hover {
                background-color: #1e5b3d;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th,
            td {
                padding: 12px 20px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f1f1f1;
                color: #555;
                font-weight: bold;
            }
            tr:hover {
                background-color: #f9f9f9;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #888;
            }
            .checkmark-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
                <div class="checkmark-container">
                <div class="header-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h1>Transakcija uspešno obrađena</h1>
            <p>Poštovani ${updatedPaket.username} ${
      updatedPaket.userLastname
    } uspešno ste kupili ${updatedPaket.naziv_paketa} paket u iznosu od ${
      updatedPaket.cena
    } RSD<strong></strong></p>
            <p><strong>Detalji o vašoj kupovini:</strong></p>
                <table>
                  <tr>
                    <th>Order ID</th>
                    <td>${updatedPaket.orgderId}</td>
                  </tr>
                  <tr>
                    <th>Naziv paketa</th>
                    <td>${updatedPaket.naziv_paketa}</td>
                  </tr>
                  <tr>
                    <th>Tip paketa</th>
                    <td>${updatedPaket.tip}</td>
                  </tr>
                  <tr>
                    <th>Cena</th>
                    <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
                  </tr>
                  <tr>
                    <th>Status plaćanja</th>
                    <td>${updatedPaket.status_placanja}</td>
                  </tr>
                  <tr>
                    <th>Metoda plaćanja</th>
                    <td>${updatedPaket.metoda_placanja}</td>
                  </tr>
                  <tr>
                    <th>Transakcioni ID</th>
                    <td>${updatedPaket.TransId}</td>
                  </tr>
                  <tr>
                    <th>Authorization Code</th>
                    <td>${AuthCode}</td>
                  </tr>
                  <tr>
                    <th>Payment Status</th>
                    <td>${Response}</td>
                  </tr>
                  <tr>
                    <th>Transaction Status Code</th>
                    <td>${ProcReturnCode}</td>
                  </tr>
                   <tr>
                    <th>Status code for the 3D transaction</th>
                    <td>${mdStatus}</td>
                  </tr>
                  <tr>
                    <th>Datum kreiranja</th>
                    <td>${new Date(
                      updatedPaket.datum_kreiranja
                    ).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Datum plaćanja</th>
                    <td>${new Date(
                      updatedPaket.datum_placanja
                    ).toLocaleString()}</td>
                  </tr>
                  ${
                    updatedPaket.tip !== "Mesečno"
                      ? `
                    <tr>
                      <th>Datum isteka paketa</th>
                      <td>${new Date(
                        updatedPaket.datum_isteka
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                 ${
                   updatedPaket.tip == "Mesečno"
                     ? `
                    <tr>
                      <th>Sledeća naplata zakazana za datum</th>
                      <td>${new Date(
                        new Date(updatedPaket.datum_placanja).setMonth(
                          new Date(updatedPaket.datum_placanja).getMonth() + 1
                        )
                      ).toLocaleString()}</td>
                    </tr>
                  `
                     : ""
                 }
                </table>
            <p>Vaš paket je sada aktivan.</p>
            <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>
            <p>S poštovanjem,</p>
            <p>Tim NutriTrans</p>
            <div class="footer">
                <a href="${
                  process.env.FRONTEND_URL
                }/dash" class="button">Povratak na početnu stranicu</a>
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(htmlContent_);
  } catch (error) {
    console.error("Error processing bank response:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/bankaFail", async (req, res) => {
  try {
    // console.log("FULL BANK RESPONSE FAIL =>", req.body);

    const { ReturnOid, TransId, AuthCode, Response, ProcReturnCode, mdStatus } =
      req.body;
    const recurringID = req.body["EXTRA.RECURRINGID"] || null;

    // console.log('TransId => ', TransId)  AuthCode
    // console.log('ReturnOid => ', ReturnOid)

    if (!ReturnOid || !TransId || !Response || !ProcReturnCode || !mdStatus) {
      // return res.status(400).json({ message: "Missing required fields: ReturnOid or TransId or AuthCode or Response" });
      return res.status(400).json({ data: req.body });
    }

    const paket = await Paket.findOne({ orgderId: ReturnOid });

    if (!paket) {
      return res.status(404).json({ message: "Paket nije pronađen" });
    }

    const datumIsteka =
      paket.tip === "Mesečno"
        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const updatedPaket = await Paket.findOneAndUpdate(
      { orgderId: ReturnOid },
      {
        status_placanja: "Neplaćeno",
        status: "Neaktivan",
        datum_placanja: new Date(),
        datum_isteka: datumIsteka,
        TransId,
        recurringID,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPaket) {
      return res.status(500).json({ message: "Greška pri ažuriranju paketa" });
    }

    // console.log("Ažurirani paket:", updatedPaket);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "office@nutritrans.com",
        pass: "jezq ddqo aynu qucx",
      },
    });

    // console.log("Slanje na => ", updatedPaket.userMail);

    const mailOptions = {
      from: "office@nutritrans.com",
      to: updatedPaket.userMail,
      subject: "Kupovina paketa",
      html: `
            <!DOCTYPE html>
              <html lang="sr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Detalji o paketu</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                  }

                  .container {
                    width: 80%;
                    margin: 30px auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }

                  h1 {
                    text-align: center;
                    color: #333;
                  }

                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                  }

                  th, td {
                    padding: 12px 20px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                  }

                  th {
                    background-color: #f1f1f1;
                    color: #555;
                    font-weight: bold;
                  }

                  tr:hover {
                    background-color: #f9f9f9;
                  }

                  p {
                    color: #555;
                    line-height: 1.6;
                  }

                  .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #888;
                  }

                  .alert {
                    background-color: #ffcc00;
                    padding: 10px;
                    margin-top: 20px;
                    text-align: center;
                    color: #555;
                    font-weight: bold;
                  }
                </style>
              </head>
              <body>

                <div class="container">
                  <h1>Detalji o vašoj kupovini</h1>
                  <p>Poštovani ${updatedPaket.username} ${
        updatedPaket.userLastname
      } <strong>niste uspešno<strong/> kupili <strong>${
        updatedPaket.naziv_paketa
      } paket<strong/> u iznosu od <strong>${updatedPaket.cena} RSD</strong></p>
                  <p>Detalji o vašoj kupovini:</p>

                                  <table>
                  <tr>
                    <th>Order ID</th>
                    <td>${updatedPaket.orgderId}</td>
                  </tr>
                  <tr>
                    <th>Naziv paketa</th>
                    <td>${updatedPaket.naziv_paketa}</td>
                  </tr>
                  <tr>
                    <th>Tip paketa</th>
                    <td>${updatedPaket.tip}</td>
                  </tr>
                  <tr>
                    <th>Cena</th>
                    <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
                  </tr>
                  <tr>
                    <th>Status plaćanja</th>
                    <td>${updatedPaket.status_placanja}</td>
                  </tr>
                  <tr>
                    <th>Metoda plaćanja</th>
                    <td>${updatedPaket.metoda_placanja}</td>
                  </tr>
                  <tr>
                    <th>Transakcioni ID</th>
                    <td>${updatedPaket.TransId}</td>
                  </tr>
                  <tr>
                    <th>Authorization Code</th>
                    <td>${AuthCode}</td>
                  </tr>
                  <tr>
                    <th>Payment Status</th>
                    <td>${Response}</td>
                  </tr>
                  <tr>
                    <th>Transaction Status Code</th>
                    <td>${ProcReturnCode}</td>
                  </tr>
                   <tr>
                    <th>Status code for the 3D transaction</th>
                    <td>${mdStatus}</td>
                  </tr>
                  <tr>
                    <th>Datum kreiranja</th>
                    <td>${new Date(
                      updatedPaket.datum_kreiranja
                    ).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Datum plaćanja</th>
                    <td>${new Date(
                      updatedPaket.datum_placanja
                    ).toLocaleString()}</td>
                  </tr>
                  ${
                    updatedPaket.tip !== "Mesečno"
                      ? `
                    <tr>
                      <th>Datum isteka paketa</th>
                      <td>${new Date(
                        updatedPaket.datum_isteka
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                  ${
                    updatedPaket.tip == "Mesečno"
                      ? `
                    <tr>
                      <th>Sledeća naplata zakazana za datum</th>
                      <td>${new Date(
                        new Date(updatedPaket.datum_placanja).setMonth(
                          new Date(updatedPaket.datum_placanja).getMonth() + 1
                        )
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                </table>

                  <!-- Obaveštenje ako paket nije plaćen -->
                  <div class="alert">
                    <p>Vaš paket nije plaćen. Molimo vas da izvršite uplatu kako biste aktivirali paket.</p>
                  </div>

                  <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>

                  <p>S poštovanjem,</p>
                  <p>Tim NutriTrans</p>

                  <div class="footer">
                    <p>NutriTrans - Vaš partner za zdravlje</p>
                  </div>
                </div>

              </body>
              </html>

      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Greška pri slanju emaila:", error);
        return res.status(400).json({ message: "Nije uspelo slanje na mail" });
      } else {
        console.log("Email poslat: " + info.response);
        // Odgovor se šalje tek kada se email uspešno pošalje
        return res.send(
          `<h1>Transakcija uspešna</h1><p>Paket <strong>${updatedPaket.naziv_paketa}</strong> je aktiviran.</p>`
        );
      }
    });

    let htmlContent_ = `
    <!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Obaveštenje o neplaćenom paketu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 30px auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .center {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .header-icon {
            width: 80px;
            height: 80px;
            background-color: #f8d7da;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .header-icon svg {
            color: #721c24;
            width: 40px;
            height: 40px;
        }
        h1 {
            text-align: center;
            color: #333;
            font-size: 24px;
            font-weight: bold;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #721c24;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
            margin-top: 30px;
        }
        .button:hover {
            background-color: #5c131e;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th,
        td {
            padding: 12px 20px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f1f1f1;
            color: #555;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #888;
        }
        .checkmark-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkmark-container">
            <div class="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
        <h1>Obaveštenje o neplaćenom paketu</h1>
        <p>Poštovani ${updatedPaket.username} ${
      updatedPaket.userLastname
    } <strong>niste uspešno<strong/> kupili <strong>${
      updatedPaket.naziv_paketa
    } paket<strong/> u iznosu od <strong>${updatedPaket.cena} RSD</strong></p>
        <p><strong>Detalji o vašem paketu:</strong></p>
                       <table>
                  <tr>
                    <th>Order ID</th>
                    <td>${updatedPaket.orgderId}</td>
                  </tr>
                  <tr>
                    <th>Naziv paketa</th>
                    <td>${updatedPaket.naziv_paketa}</td>
                  </tr>
                  <tr>
                    <th>Tip paketa</th>
                    <td>${updatedPaket.tip}</td>
                  </tr>
                  <tr>
                    <th>Cena</th>
                    <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
                  </tr>
                  <tr>
                    <th>Status plaćanja</th>
                    <td>${updatedPaket.status_placanja}</td>
                  </tr>
                  <tr>
                    <th>Metoda plaćanja</th>
                    <td>${updatedPaket.metoda_placanja}</td>
                  </tr>
                  <tr>
                    <th>Transakcioni ID</th>
                    <td>${updatedPaket.TransId}</td>
                  </tr>
                  <tr>
                    <th>Authorization Code</th>
                    <td>${AuthCode}</td>
                  </tr>
                  <tr>
                    <th>Payment Status</th>
                    <td>${Response}</td>
                  </tr>
                  <tr>
                    <th>Transaction Status Code</th>
                    <td>${ProcReturnCode}</td>
                  </tr>
                   <tr>
                    <th>Status code for the 3D transaction</th>
                    <td>${mdStatus}</td>
                  </tr>
                  <tr>
                    <th>Datum kreiranja</th>
                    <td>${new Date(
                      updatedPaket.datum_kreiranja
                    ).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Datum plaćanja</th>
                    <td>${new Date(
                      updatedPaket.datum_placanja
                    ).toLocaleString()}</td>
                  </tr>
                  ${
                    updatedPaket.tip !== "Mesečno"
                      ? `
                    <tr>
                      <th>Datum isteka paketa</th>
                      <td>${new Date(
                        updatedPaket.datum_isteka
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                  ${
                    updatedPaket.tip == "Mesečno"
                      ? `
                    <tr>
                      <th>Sledeća naplata zakazana za datum</th>
                      <td>${new Date(
                        new Date(updatedPaket.datum_placanja).setMonth(
                          new Date(updatedPaket.datum_placanja).getMonth() + 1
                        )
                      ).toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                </table>
        <p>Molimo vas da izvršite uplatu što je pre moguće kako bi vaš paket bio aktiviran. Za dodatne informacije ili pomoć, slobodno nas kontaktirajte.</p>
        <p>S poštovanjem,</p>
        <p>Tim NutriTrans</p>
        <div class="footer">
            <a href="${
              process.env.FRONTEND_URL
            }/dash" class="button">Povratak na početnu stranicu</a>
        </div>
    </div>
</body>
</html>

`;

    res.send(htmlContent_);
  } catch (error) {
    console.error("Error processing bank response:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// //Odavde uzmi
// app.post("/bankaFail", async (req, res) => {
//   // console.log("FULL BANK RESPONSE FAIL =>", req.body);

//   try {
//     const { ReturnOid, TransId, "EXTRA.RECURRINGID": recurringID } = req.body;

//     if (!ReturnOid || !TransId) {
//       return res.status(400).json({
//         message: "Missing required fields: ReturnOid or TransId",
//       });
//     }

//     const paket = await Paket.findOne({ orderId: ReturnOid });

//     // Proveri da li je paket pronađen
//     if (!paket) {
//       throw new Error("Paket nije pronađen");
//     }

//     // 2. Postavi datum_isteka u zavisnosti od tipa paketa
//     const datumIsteka =
//       paket.tip === "Mečecno"
//         ? new Date(new Date().setMonth(new Date().getMonth() + 1))
//         : updateDate(paket.tip);

//     // 3. Ažuriraj paket
//     const updatedPaket = await Paket.findOneAndUpdate(
//       { orderId: ReturnOid },
//       {
//         status_placanja: "Neplaćeno",
//         status: "Neaktivan",
//         datum_placanja: new Date(),
//         datum_isteka: datumIsteka,
//         TransId: TransId,
//         recurringID: recurringID || null,
//       },
//       {
//         new: true, // Vraća ažurirani objekat
//         runValidators: true, // Pomaže u validaciji prilikom ažuriranja
//       }
//     );

//     // 4. Proveri rezultat
//     if (!updatedPaket) {
//       console.log("Paket nije ažuriran");
//     } else {
//       console.log("Ažurirani paket:", updatedPaket);
//     }

//       //Saljemo paket
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.email",
//         port: 587,
//         secure: false,
//         auth: {
//           user: "office@nutritrans.com",
//           pass: "jezq ddqo aynu qucx",
//         },
//       });

//       const mailOptions = {
//         from: "office@nutritrans.com",
//         to: updatedPaket.userMail,
//         subject: "Kupovina paketa",
//         html: `
//               <!DOCTYPE html>
//                 <html lang="sr">
//                 <head>
//                   <meta charset="UTF-8">
//                   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                   <title>Detalji o paketu</title>
//                   <style>
//                     body {
//                       font-family: Arial, sans-serif;
//                       background-color: #f4f4f9;
//                       margin: 0;
//                       padding: 0;
//                     }

//                     .container {
//                       width: 80%;
//                       margin: 30px auto;
//                       background-color: white;
//                       padding: 20px;
//                       border-radius: 8px;
//                       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//                     }

//                     h1 {
//                       text-align: center;
//                       color: #333;
//                     }

//                     table {
//                       width: 100%;
//                       border-collapse: collapse;
//                       margin-top: 20px;
//                     }

//                     th, td {
//                       padding: 12px 20px;
//                       text-align: left;
//                       border-bottom: 1px solid #ddd;
//                     }

//                     th {
//                       background-color: #f1f1f1;
//                       color: #555;
//                       font-weight: bold;
//                     }

//                     tr:hover {
//                       background-color: #f9f9f9;
//                     }

//                     p {
//                       color: #555;
//                       line-height: 1.6;
//                     }

//                     .footer {
//                       text-align: center;
//                       margin-top: 20px;
//                       color: #888;
//                     }

//                     .alert {
//                       background-color: #ffcc00;
//                       padding: 10px;
//                       margin-top: 20px;
//                       text-align: center;
//                       color: #555;
//                       font-weight: bold;
//                     }
//                   </style>
//                 </head>
//                 <body>

//                   <div class="container">
//                     <h1>Detalji o vašoj kupovini</h1>
//                     <p>Poštovani,</p>
//                     <p>Detalji o vašoj kupovini:</p>

//                     <table>
//                       <tr>
//                         <th>Order ID</th>
//                         <td>${updatedPaket.orgderId}</td>
//                       </tr>
//                       <tr>
//                         <th>Tip paketa</th>
//                         <td>${updatedPaket.tip}</td>
//                       </tr>
//                       <tr>
//                         <th>Cena</th>
//                         <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
//                       </tr>
//                       <tr>
//                         <th>Status plaćanja</th>
//                         <td>${updatedPaket.status_placanja}</td>
//                       </tr>
//                       <tr>
//                         <th>Metoda plaćanja</th>
//                         <td>${updatedPaket.metoda_placanja}</td>
//                       </tr>
//                       <tr>
//                         <th>Transakcioni ID</th>
//                         <td>${updatedPaket.TransId}</td>
//                       </tr>
//                       <tr>
//                         <th>Datum kreiranja</th>
//                         <td>${new Date(updatedPaket.datum_kreiranja).toLocaleString()}</td>
//                       </tr>
//                       <tr>
//                         <th>Datum plaćanja</th>
//                         <td>${new Date(updatedPaket.datum_placanja).toLocaleString()}</td>
//                       </tr>
//                       <tr>
//                         <th>Datum isteka paketa</th>
//                         <td>${new Date(updatedPaket.datum_isteka).toLocaleString()}</td>
//                       </tr>
//                     </table>

//                     <!-- Obaveštenje ako paket nije plaćen -->
//                     <div class="alert">
//                       <p>Vaš paket nije plaćen. Molimo vas da izvršite uplatu kako biste aktivirali paket.</p>
//                     </div>

//                     <p>Ukoliko imate bilo kakvih pitanja ili problema, slobodno nas kontaktirajte.</p>

//                     <p>S poštovanjem,</p>
//                     <p>Tim NutriTrans</p>

//                     <div class="footer">
//                       <p>NutriTrans - Vaš partner za zdravlje</p>
//                     </div>
//                   </div>

//                 </body>
//                 </html>

//         `,
//       };

//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           return res.status(400).json({ message: "Nije uspelo slanje na mail" });
//         } else {
//           console.log("Email poslat: " + info.response);
//         }
//       });

//     let htmlContent_ = `
//     <!DOCTYPE html>
// <html lang="sr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Obaveštenje o neplaćenom paketu</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f9;
//             margin: 0;
//             padding: 0;
//         }
//         .container {
//             width: 80%;
//             margin: 30px auto;
//             background-color: white;
//             padding: 20px;
//             border-radius: 8px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .center {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             min-height: 100vh;
//         }
//         .header-icon {
//             width: 80px;
//             height: 80px;
//             background-color: #f8d7da;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin-bottom: 20px;
//         }
//         .header-icon svg {
//             color: #721c24;
//             width: 40px;
//             height: 40px;
//         }
//         h1 {
//             text-align: center;
//             color: #333;
//             font-size: 24px;
//             font-weight: bold;
//         }
//         p {
//             color: #555;
//             line-height: 1.6;
//         }
//         .button {
//             display: inline-block;
//             padding: 10px 20px;
//             background-color: #721c24;
//             color: white;
//             text-decoration: none;
//             border-radius: 4px;
//             text-align: center;
//             margin-top: 30px;
//         }
//         .button:hover {
//             background-color: #5c131e;
//         }
//         table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-top: 20px;
//         }
//         th,
//         td {
//             padding: 12px 20px;
//             text-align: left;
//             border-bottom: 1px solid #ddd;
//         }
//         th {
//             background-color: #f1f1f1;
//             color: #555;
//             font-weight: bold;
//         }
//         tr:hover {
//             background-color: #f9f9f9;
//         }
//         .footer {
//             text-align: center;
//             margin-top: 20px;
//             color: #888;
//         }
//         .checkmark-container {
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             margin-top: 20px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="checkmark-container">
//             <div class="header-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//             </div>
//         </div>
//         <h1>Obaveštenje o neplaćenom paketu</h1>
//         <p>Poštovani,</p>
//         <p>Želimo vas obavestiti da paket <strong>${updatedPaket.naziv_paketa}</strong> još uvek nije plaćen.</p>
//         <p><strong>Detalji o vašem paketu:</strong></p>
//         <table>
//             <tr>
//                 <th>Order ID</th>
//                 <td>${updatedPaket.orgderId}</td>
//             </tr>
//             <tr>
//                 <th>Tip paketa</th>
//                 <td>${updatedPaket.tip}</td>
//             </tr>
//             <tr>
//                 <th>Cena</th>
//                 <td>${updatedPaket.cena} ${updatedPaket.valuta}</td>
//             </tr>
//             <tr>
//                 <th>Status plaćanja</th>
//                 <td>${updatedPaket.status_placanja}</td>
//             </tr>
//             <tr>
//                 <th>Metoda plaćanja</th>
//                 <td>${updatedPaket.metoda_placanja}</td>
//             </tr>
//             <tr>
//                 <th>Transakcioni ID</th>
//                 <td>${updatedPaket.TransId}</td>
//             </tr>
//             <tr>
//                 <th>Datum kreiranja</th>
//                 <td>${new Date(updatedPaket.datum_kreiranja).toLocaleString()}</td>
//             </tr>
//             <tr>
//                 <th>Datum isteka paketa</th>
//                 <td>${new Date(updatedPaket.datum_isteka).toLocaleString()}</td>
//             </tr>
//         </table>
//         <p>Molimo vas da izvršite uplatu što je pre moguće kako bi vaš paket bio aktiviran. Za dodatne informacije ili pomoć, slobodno nas kontaktirajte.</p>
//         <p>S poštovanjem,</p>
//         <p>Tim NutriTrans</p>
//         <div class="footer">
//             <a href="https://nutritrans.rs/dash" class="button">Povratak na početnu stranicu</a>
//         </div>
//     </div>
// </body>
// </html>

// `

//     res.send(htmlContent_);

//   } catch (error) {
//     console.error("Error processing bank response:", error);

//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }

//   // res.render("bankaFail");
// });

//Za ukidanje reccuring placanja! MORAMO DA SALJEMO NA SVOJ SERVER OVDE DA BI ZAOBISLI CORS => SAMO AZURIRAJ BAZU!
//Ovde je drugaciji url
//Original
// app.post("/proxy", async (req, res) => {
//   const url = "https://testsecurepay.eway2pay.com/fim/api";
//   const xmlData = req.body.data;
//   const userid = req.body.user.id;
//   const trans = req.body.user.tranId;
//   const email = req.body.user.email;

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: `data=${encodeURIComponent(xmlData)}`,
//     });

//     // Nadji paket i promeni status
//     const result = await Paket.findOneAndUpdate(
//       { idUser: userid, TransId: trans },
//       { $set: { status: "Neaktivan", datum_otkazivanja: new Date() } },
//       { returnDocument: "after" }
//     );

//     if (result.value) {
//       console.log("Record updated:", result.value);
//     } else {
//       console.log("Record not found.");
//     }

//     if(response.status == 200){

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.email",
//         port: 587,
//         secure: false,
//         auth: {
//           user: "office@nutritrans.com",
//           pass: "jezq ddqo aynu qucx",
//         },
//       });

//       const mailOptions = {
//         from: "office@nutritrans.com",
//         to: email,
//         subject: "Otkazivanje paketa",
//         html: `
//               <!DOCTYPE html>
//               <html lang="sr">
//               <head>
//                   <meta charset="UTF-8">
//                   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                   <title>Obaveštenje o otkazivanju paketa</title>
//                   <style>
//                       body {
//                           font-family: Arial, sans-serif;
//                           background-color: #f4f4f4;
//                           color: #333;
//                           margin: 0;
//                           padding: 20px;
//                       }
//                       .container {
//                           max-width: 600px;
//                           margin: 0 auto;
//                           background-color: #fff;
//                           padding: 20px;
//                           border-radius: 8px;
//                           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//                       }
//                       .header {
//                           text-align: center;
//                           color: #007BFF;
//                       }
//                       .content {
//                           font-size: 16px;
//                           line-height: 1.5;
//                       }
//                       .footer {
//                           text-align: center;
//                           margin-top: 20px;
//                           font-size: 14px;
//                           color: #777;
//                       }
//                       .button {
//                           background-color: #007BFF;
//                           color: white;
//                           padding: 10px 20px;
//                           text-decoration: none;
//                           border-radius: 5px;
//                           display: inline-block;
//                           margin-top: 20px;
//                       }
//                       table {
//                           width: 100%;
//                           margin-top: 20px;
//                           border-collapse: collapse;
//                       }
//                       th, td {
//                           padding: 8px;
//                           border: 1px solid #ddd;
//                           text-align: left;
//                       }
//                       th {
//                           background-color: #f2f2f2;
//                       }
//                   </style>
//               </head>
//               <body>
//                   <div class="container">
//                       <div class="header">
//                           <h1>Obaveštenje o otkazivanju paketa</h1>
//                       </div>
//                       <div class="content">
//                           <p>Poštovani,</p>
//                           <p>Želimo Vas obavestiti da je otkazivanje Vašeg paketa uspešno završeno. Vaš zahtev je uspešno procesuiran i paket više neće biti aktivan.</p>

//                           <p>Detalji o otkazivanju paketa:</p>
//                           <table>
//                               <tr>
//                                   <th>Order ID</th>
//                                   <td>${aktivan.orgderId}</td>
//                               </tr>
//                               <tr>
//                                   <th>Datum plaćanja</th>
//                                   <td>${new Date(aktivan.datum_placanja).toLocaleString()}}</td>
//                               </tr>
//                               <tr>
//                                   <th>Datum otkazivanja paketa</th>
//                                   <td>${new Date().toLocaleString()}}</td>
//                               </tr>
//                           </table>

//                       </div>
//                       <div class="footer">
//                           <p>Hvala što koristite naše usluge.</p>
//                           <p>Tim Vaše Kompanije</p>
//                       </div>
//                   </div>
//               </body>
//               </html>

//         `,
//       };

//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           return res.status(400).json({ message: "Nije uspelo slanje na mail" });
//         } else {
//           console.log("Email poslat: " + info.response);
//         }
//       });
// }

// const text = await response.text();
// res.status(response.status).send(text);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

//Testni - RADI
app.post("/proxy", async (req, res) => {
  const url = "https://testsecurepay.eway2pay.com/fim/api";
  const xmlData = req.body.data;
  const { id: userid, tranId: trans, email } = req.body.user;

  try {
    // Prvo šaljemo zahtev ka API-ju
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(xmlData)}`,
    });

    // Ako je odgovor API-ja 200, onda ažuriramo bazu i šaljemo e-mail - ALI NE SALJEMO DA JE NEUSPESAN PREKID
    if (response.status === 200) {
      console.log(
        "API request successful, proceeding with database update and email sending..."
      );

      // Ažuriranje baze
      const result = await Paket.findOneAndUpdate(
        { idUser: userid, TransId: trans },
        { $set: { status: "Neaktivan", datum_otkazivanja: new Date() } },
        { new: true }
      );

      if (result) {
        console.log("Record updated:", result);

        // Kreiranje transportera za slanje email-a
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "office@nutritrans.com",
            pass: "jezq ddqo aynu qucx",
          },
        });

        // Kreiranje email poruke
        const mailOptions = {
          from: "office@nutritrans.com",
          to: email,
          subject: "Otkazivanje paketa",
          html: `
            <!DOCTYPE html>
            <html lang="sr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Obaveštenje o otkazivanju paketa</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        color: #007BFF;
                    }
                    .content {
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 14px;
                        color: #777;
                    }
                    table {
                        width: 100%;
                        margin-top: 20px;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Obaveštenje o otkazivanju paketa</h1>
                    </div>
                    <div class="content">
                        <p>Poštovani,</p>
                        <p>Želimo Vas obavestiti da je otkazivanje Vašeg paketa uspešno završeno.</p>
                        <p>Vaš zahtev je uspešno procesuiran i paket više neće biti aktivan.</p>
                        
                        <p>Detalji o otkazivanju paketa:</p>
                        <table>
                            <tr>
                                <th>Tarnsakcioni ID</th>
                                <td>${trans}</td>
                            </tr>
                            <tr>
                                <th>Datum plaćanja</th>
                                <td>${new Date(
                                  result.datum_placanja
                                ).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Datum otkazivanja</th>
                                <td>${new Date().toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="footer">
                        <p>Hvala što koristite naše usluge.</p>
                        <p>Tim Vaše Kompanije</p>
                    </div>
                </div>
            </body>
            </html>
          `,
        };

        // Slanje email-a
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Greška prilikom slanja emaila:", error);
            return res
              .status(400)
              .json({ message: "Nije uspelo slanje email-a" });
          } else {
            console.log("Email poslat:", info.response);
          }
        });
      } else {
        console.log("Record not found.");
      }
    }

    // U svakom slučaju, vraćamo odgovor klijentu
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    console.error("Greška u API pozivu:", error);
    res.status(500).send({ error: error.message });
  }
});

//Renderuje ejs
app.get("/home", (req, res) => {
  res.render("home");
});

//
// app.get("/env", (req, res) => {
//   res.json({ message: {
//     "DATABASE_URI": process.env.DATABASE_URI,
//     "DATABASE_URI_DOCKER": process.env.DATABASE_URI_DOCKER,
//     "JWT_SECRET": process.env.JWT_SECRET,
//     "ACCESS_TOKEN_SECRET": process.env.ACCESS_TOKEN_SECRET,
//     "REFRESH_TOKEN_SECRET": process.env.REFRESH_TOKEN_SECRET,
//     "SESSION_SECRET": process.env.SESSION_SECRET,
//     "CLIENT_ID": process.env.CLIENT_ID,
//     "CLIENT_SECRET": process.env.CLIENT_SECRET,
//     "OPEN_AI_KEY": process.env.OPEN_AI_KEY,
//     "NODE_ENV": process.env.NODE_ENV,
//     "PORT": process.env.PORT
//     }
//   });
// });

//Izmena specCilja naknadno - PROBAJ PONOVO!
app.patch("/specCilj/reset/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { specilj: [] });

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a successful response with the updated user data
    res.status(200).json({
      message: "Cilj je uspešno resetovan",
    });
  } catch (error) {
    // Handle any errors during the database operation
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//Dodaje specificne ciljeve u profil i menja njegove naminice i cuva
// app.patch("/specCilj/:id", async (req, res) => {
//   const id = req.params.id;
//   const updatedData = req.body;
//   console.log("updatedData => ", updatedData);

//   try {
//     const updatedUser1 = await User.findById(id);

//     // const updatedUser = await User.findByIdAndUpdate(
//     //   id,
//     //   { specilj: updatedData },
//     //   { new: true } // Vraća ažurirani dokument
//     // );

//     // if (!updatedUser) {
//     //   return res.status(404).json({ message: "Korisnik nije pronađen" });
//     // }

//     // Uzimamo sve naminice iz baze, samo biramo _id
//     const Namirnices = await Namirnice.find().select("_id").lean();

//     //Prebacujemo da mozemo da koristimo kao obican js, da nema new Object("")
//     const sveNamirnice = Namirnices.map((naminica) => ({
//       ...naminica,
//       _id: naminica._id.toString(),
//     }));

//     // console.log("Namirnices => ", sveNamirnice);

//     //Sve namirnice prebacujemo u obicnu listu da bi mogli raditi sa njom
//     const sveNamirniceId = sveNamirnice.map((obj) => obj._id); //Sve namirnice iz baze

//     //Citanje iz baze svih specificnih ciljeva
//     const specCiljevi = await Ciljevi.find({ tip: "specCilj" }).lean();

//     const specCiljeviId = specCiljevi.map((cilj) => ({
//       ...cilj,
//       _id: cilj._id.toString(),
//       namirnice: cilj.namirnice.map((namirnica) => namirnica.toString()), // Mapira svaku namirnicu na string ID
//     }));

//     // console.log("specCiljevi => ", specCiljeviId);

//     //Filtracija objekata
//     // const odabraniCiljevi = updatedData.map(
//     //   (specilj) => specCiljeviId[specilj]
//     // );

//     //Objekti odabranih specificnih ciljeva sa naminicama

//     //Ako u bazi imamo i neke specificne ciljeve onda ih ubacimo u zajednicku listu
//     if (updatedUser1.specilj.length != 0) {
//       updatedUser1.specilj.forEach((item) => {
//         if (!updatedData.includes(item)) {
//           updatedData.push(item);
//         }
//       });
//     }

//     const odabraniCiljevi = specCiljeviId.filter((obj) =>
//       updatedData.includes(obj._id)
//     );

//     // console.log("odabrani objekti specificnih ciljeva => ", odabraniCiljevi);

//     let novaListaNamirnica = [];

//     // console.log("updatedUser.namirniceDa => ", updatedUser1.namirniceDa);

//     //Filtracija naminica
//     // odabraniCiljevi.forEach((odabraniCilj) => {
//     //   novaListaNamirnica = updatedUser1.namirniceDa.filter(
//     //     (namirnicaId) => !odabraniCilj.namirnice.includes(namirnicaId)
//     //   );
//     // });

//     let prev = updatedUser1.namirniceDa;

//     odabraniCiljevi.forEach((odabraniCilj) => {
//       prev = prev.filter(
//         (namirnicaId) => !odabraniCilj.namirnice.includes(namirnicaId)
//       );
//     });

//     // Vraćamo filtriranu listu namirnica
//     // res.json({ novaListaNamirnica: prev });

//     //Namirnice koje ostaju odabrane, treba postaviti u naminiceDa
//     console.log("novaListaNamirnica => ", prev);

//     // console.log("Namirnice id lista => ", sveNamirniceId);

//     //Namirnice koje nisu odabrane
//     let neodabraneNamirnice = sveNamirniceId.filter(
//       (item) => !prev.includes(item)
//     );

//     if (updatedData.length != 0) {
//       updatedUser1.namirnice = neodabraneNamirnice;
//       updatedUser1.namirniceDa = prev;
//       updatedUser1.specilj = updateDate;
//       await updatedUser1.save();
//       res.status(200).json({ message: "Promenjeno", data: prev });
//     } else {
//       res.status(200).json({ message: "Nije promenjeno" }); // Vrati na pocetan skup namirnica a to je od odabrane ishrane
//     }

//     // updatedUser1.namirniceDa = novaListaNamirnica;

//     // res.status(200).json({ message: "Cilj je uspešno ažuriran" });
//     // res.status(200).send(novaListaNamirnica);
//   } catch (error) {
//     console.error("Error updating specilj:", error);
//     res
//       .status(500)
//       .json({ message: "Došlo je do greške prilikom ažuriranja cilja" });
//   }
// });

//Ovde promeni sta treba...
app.patch("/specCilj/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body; // Lista ID-ova odabranih ciljeva

  if (!Array.isArray(updatedData)) {
    return res.status(400).json({ message: "Nevalidni podaci za ažuriranje" });
  }

  try {
    const updatedUser1 = await User.findById(id);
    if (!updatedUser1) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    // Dohvatanje svih ciljeva i priprema podataka
    const specCiljevi = await Ciljevi.find({ tip: "specCilj" }).lean();
    const specCiljeviId = specCiljevi.map((cilj) => ({
      ...cilj,
      _id: cilj._id.toString(),
      namirnice: cilj.namirnice.map((namirnica) => namirnica.toString()),
    }));

    // Filtriranje ciljeva koji su trenutno čekirani (odabrani)
    const cekiraniCiljevi = specCiljeviId.filter((obj) =>
      updatedData.includes(obj._id)
    );

    // Kreiranje liste namirnica koje su povezane sa čekiranim ciljevima
    const cekiraneNamirnice = [
      ...new Set(cekiraniCiljevi.flatMap((cilj) => cilj.namirnice)),
    ];

    // Filtracija namirnica koje ostaju kao neodabrane
    const sveNamirnice = await Namirnice.find().select("_id").lean();
    const sveNamirniceId = sveNamirnice.map((n) => n._id.toString());
    const neodabraneNamirnice = sveNamirniceId.filter(
      (id) => !cekiraneNamirnice.includes(id)
    );

    // Ažuriranje korisnika u bazi
    updatedUser1.namirniceDa = neodabraneNamirnice; //Obrnuo sam...
    updatedUser1.namirnice = cekiraneNamirnice; //Obrnuo sam...
    updatedUser1.specilj = updatedData;

    await updatedUser1.save();

    res.status(200).json({
      message: "Promenjeno",
      cekiraneNamirnice, // Namirnice povezane sa čekiranim ciljevima
      neodabraneNamirnice, // Namirnice koje nisu povezane sa čekiranim ciljevima
    });
  } catch (error) {
    console.error("Error updating specilj:", error);
    res
      .status(500)
      .json({ message: "Došlo je do greške prilikom ažuriranja cilja" });
  }
});

//Definisane naminice koje sadrze gluten
const glutenListId = [
  "671f82735997900563cead4c",
  "671f829b5997900563cead5b",
  "671f82b35997900563cead6a",
  "671f82c75997900563cead79",
  "671f82e45997900563cead88",
  "671f83c65997900563ceade7",
  "671f83e85997900563ceadf6",
  "671f840a5997900563ceae05",
  "671f84315997900563ceae14",
  "671f84755997900563ceae32",
  "671f849a5997900563ceae41",
  "671f84b55997900563ceae50",
];

//Definisane naminice koje sadrze laktoza
const laktozaListId = [
  "671f948cd1348708c15baba8",
  "671f957cd1348708c15babe4",
  "671f95c2d1348708c15babf3",
  "671f9634d1348708c15bac1c",
  "671f9605d1348708c15bac02",
  "671f9657d1348708c15bac2b",
  "671f966fd1348708c15bac3a",
  "671f9696d1348708c15bac49",
  "671f96b3d1348708c15bac58",
  "671f96ced1348708c15bac67",
  "671f9df0d1348708c15bb051",
  "671f9e0dd1348708c15bb060",
  "671f9707d1348708c15bac7a",
  "671f971bd1348708c15bac89",
];

//Update stanja intolerancije - gluten, laktoza i sve naminice koje idu...
app.patch("/updateIntolerancija/:id", async (req, res) => {
  const id = req.params.id;
  const intolerancijeList = req.body; // ['gluten', 'laktoza']

  // Definisane liste ID-ova namirnica
  const glutenListId = [
    "671f82735997900563cead4c",
    "671f829b5997900563cead5b",
    "671f82b35997900563cead6a",
    "671f82c75997900563cead79",
    "671f82e45997900563cead88",
    "671f83c65997900563ceade7",
    "671f83e85997900563ceadf6",
    "671f840a5997900563ceae05",
    "671f84315997900563ceae14",
    "671f84755997900563ceae32",
    "671f849a5997900563ceae41",
    "671f84b55997900563ceae50",
  ];

  const laktozaListId = [
    "671f948cd1348708c15baba8",
    "671f957cd1348708c15babe4",
    "671f95c2d1348708c15babf3",
    "671f9634d1348708c15bac1c",
    "671f9605d1348708c15bac02",
    "671f9657d1348708c15bac2b",
    "671f966fd1348708c15bac3a",
    "671f9696d1348708c15bac49",
    "671f96b3d1348708c15bac58",
    "671f96ced1348708c15bac67",
    "671f9df0d1348708c15bb051",
    "671f9e0dd1348708c15bb060",
    "671f9707d1348708c15bac7a",
    "671f971bd1348708c15bac89",
  ];

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    // Kombinovanje svih ID-ova intolerancija u jednu listu
    let intoleranceIds = [];
    if (intolerancijeList.includes("gluten")) {
      intoleranceIds = [...intoleranceIds, ...glutenListId];
    }
    if (intolerancijeList.includes("laktoza")) {
      intoleranceIds = [...intoleranceIds, ...laktozaListId];
    }

    // 1. Uklanjanje namirnica iz `namirniceDa` i dodavanje u `namirnice`
    const prebaceneNamirnice = user.namirniceDa.filter((id) =>
      intoleranceIds.includes(id)
    );

    const updatedNamirniceDa = user.namirniceDa.filter(
      (id) => !intoleranceIds.includes(id)
    );

    const updatedNamirnice = [
      ...new Set([...user.namirnice, ...prebaceneNamirnice]),
    ];

    // 2. Ako nema intolerancija, obrnuto - vraćanje nazad u `namirniceDa`
    if (intolerancijeList.length === 0) {
      const vraceneNamirniceDa = user.namirnice.filter((id) =>
        intoleranceIds.includes(id)
      );

      user.namirniceDa = [
        ...new Set([...updatedNamirniceDa, ...vraceneNamirniceDa]),
      ];
      user.namirnice = [
        ...new Set(user.namirnice.filter((id) => !intoleranceIds.includes(id))),
      ];
    } else {
      user.namirniceDa = [...new Set(updatedNamirniceDa)];
      user.namirnice = [...new Set(updatedNamirnice)];
    }

    user.intolerancija = [
      ...new Set([...user.intolerancija, ...intolerancijeList]),
    ];
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Intolerancije su uspešno ažurirane.",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating intolerancije:", error);
    res.status(500).json({
      message: "Došlo je do greške prilikom ažuriranja intolerancije.",
      error,
    });
  }
});

//Update samo komentar
app.post("/updateKomentar", async (req, res) => {
  const { id, komentar } = req.body;

  if (!id || !komentar) {
    return res.status(400).json({ message: "ID i komentar su obavezni!" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    user.komentar = komentar;

    await user.save();

    // Vratite uspešan odgovor
    res.status(200).json({ message: "Komentar je uspešno sačuvan!" });
  } catch (error) {
    console.error("Greška u ruti /updateKomentar:", error);
    return res
      .status(500)
      .json({ message: "Došlo je do greške prilikom slanja komentara." });
  }
});

app.get("/octopus", async (req, res) => {
  try {
    const response = await fetch("https://sandbox.octopos.rs/api/weborder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer XMSaQ0GSftO+Oe5nMXZPcIWfEDejrdo/LY3DJSJJEXZIWjO+FZlKWITDWAHsizpRQdJvRahMvBvDZm+Gr3J7UecPCYnhI92BeY6Q4I6/SxhHeh39y1l/AeWHpTxn6WzRlJoFEzm1athizbD56M/s7HSeNJeGt+OMBkbhJVj2olEmTLu5sp9MuQA0XoMBcH7b",
      },
      body: JSON.stringify({
        Items: [
          {
            GroupName: "Sokovi",
            ProductCode: "S001",
            ProductName: "Coca Cola 0.33",
            UnitMeasure: "kom",
            TaxLabel: "Ж",
            Quantity: 2,
            Price: 150.0,
          },
        ],
        ExternalId: "octopos-001",
        Payments: [
          {
            FiscalPaymentTypeId: 4,
            Amount: 300.0,
          },
        ],
        FiscalReceiptData: {
          ReturnTextualRepresentation: true,
          LineWidth: 46,
          Jmbg: "1122334455",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Error with web order");
    }

    // const data = await response.json();

    console.log("Octopus data => ", response);
    res.send(response);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong with the external API request" });
  }
});

app.get("/about", (req, res) => {
  res.json({ message: "Server up!" });
});

//
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

//==== TESTS ====
let add = async () => {
  const radnik = {
    jmbg: "0204997710082",
    pozicija: "Konobar",
    sektor: "Banket",
    netopalataIzUgovora: "50.000",
    fixUgovoren: "70.000",
    tipUgovora: "Na odrednjeno",
    kafa: "Da",
    zaRacDnev: "Da",
  };

  try {
    const result = await Organizacije.updateOne(
      { _id: mongoose.Types.ObjectId("66912365d2672debd94a4412") },
      { $push: { zaposleni: radnik } }
    );
    console.log("Update:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

// const transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user: "maddison53@ethereal.email",
//     pass: "jn7jnAPss4f63QBp6D",
//   },
// });

// app.get("sendemail", (req,res)=>{

// })

//==== TESTS ====

//DEV
// const sslOptions = {
//   key: fs.readFileSync("/etc/letsencrypt/live/dev.nutritrans.rs/privkey.pem"), // Path to your private key
//   cert: fs.readFileSync(
//     "/etc/letsencrypt/live/dev.nutritrans.rs/fullchain.pem"
//   ),
// };

//PRODUCTION
// const sslOptions = {
//   key: fs.readFileSync("/etc/letsencrypt/live/nutritrans.rs/privkey.pem"), // Path to your private key
//   cert: fs.readFileSync("/etc/letsencrypt/live/nutritrans.rs/fullchain.pem"), // Path to your certificate
// };

//SA HTTPS
// mongoose.connection.once("open", () => {
//   console.log("Connected to MongoDB!");
//   // Start HTTPS server
//   https.createServer(sslOptions, app).listen(PORT, () => {
//     console.log(`HTTPS server running on port ${PORT}`);
//   });
// });

//BEZ HTTPS
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // add();
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
