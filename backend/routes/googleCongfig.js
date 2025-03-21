const { google } = require("googleapis");
require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECREET = process.env.GOOGLE_CLIENT_SECREET;

exports.oath2client = new google.oauth2.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECREET,
  "postmessage"
);
