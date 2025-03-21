const openai = require("../config/openaiConfig");

const generateMeta = async (req, res) => { //adminChat
  const { title } = req.body;

  //Jedan text prompt
  const description = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `${title}`,
      },
    ],
  });

  console.log("Object:", description);

  res.status(200).json({
    description: description.choices[0].message.content,
  });
};

//Za sliku
// const generateImage = async (req, res) => {
//   const image = await openai.createImage({
//     prompt: req.body.prompt,
//     n: 1,
//     size: "1024x1024",
//   });

//   res.json({
//     url: image.data.data[0].url,
//   });
// };

// const generateIshrana = async (req, res) => {
//   const { title } = req.body;

//   //Jedan text prompt
//   const description = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       {
//         role: "user",
//         content: `${title}`,
//       },
//     ],
//   });

//   console.log("Object:", description.choices[0].message.content);

//   res.status(200).json({
//     description: description.choices[0].message.content,
//   });
// };
const generateIshrana = async (req, res) => {
  const { title } = req.body;

  //Jedan text prompt
  const description = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `${title}`,
      },
    ],
    max_tokens: 1000, // Povecaj jos ako treba
  });

  // console.log("Object:", description.choices[0].message.content);

  res.status(200).json({
    description: description.choices[0].message.content,
  });
};

module.exports = { generateMeta, generateIshrana };
