// const { Configuration, OpenAIApi } = require("openai");
// require("dotenv").config();

// const configuration = new Configuration({
//   apiKey: process.env.OPEN_AI_KEY,
// });

// const openai = new OpenAIApi(configuration);

// module.exports = openai;

const OpenAI = require("openai");

const openai = new OpenAI({
  // temperature: 0.7,
  apiKey: process.env.OPEN_AI_KEY,
});

module.exports = openai;
