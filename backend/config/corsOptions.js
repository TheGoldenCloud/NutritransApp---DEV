const allowedOrigins = require("./allowedOrigins");

//Iz liste dozvoljenih
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

//All
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
