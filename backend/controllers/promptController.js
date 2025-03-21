const Prompt = require("../models/Promptovi");

//MJODIFIKUJ
const getprompt = async (req, res) => {
  const prompt = await Prompt.find(); //Taj jedan jedini objekat

  if (!prompt?.length) {
    return res.status(400).json({ message: "Nisu nadjeni prompti" });
  }

  res.json(prompt);
};


//Saljemo sve objeket iz kolekcije ali samo sa _id i name
// const getAllpromptNames = async (req, res) => {
//   try {
//     const prompt = await prompt.find(
//       { name: { $exists: true } },
//       { name: 1 }
//     ).exec();

//     res.json(prompt);
//     // console.log(prompt);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// RADI
// const createNewprompt = async (req, res) => {
//   const { name } = req.body;
//   // console.log(name);

//   // Confirm data
//   if (!name) {
//     return res.status(400).json({ message: "Sva poslja su potrebna" });
//   }

//   // Check for duplicate username
//   const duplicate = await prompt.findOne({ name })
//     .collation({ locale: "en", strength: 2 })
//     .lean()
//     .exec();

//   if (duplicate) {
//     return res.status(400).json({ message: "prompt već postoji" });
//   }

//   const prompt = await prompt.create({ name });

//   if (prompt) {
//     //created
//     res.status(201).json({ message: `Novi prompt ${name} napravljen` });
//   } else {
//     res.status(400).json({ message: "Nisu validni podaci" });
//   }
// };

//Updejtuje kolekciju i uslovno rekurzivno u organizacijama  , 
const updateprompt = async (req, res) => {
    const {
      prompt,
      promptText, 
      promptBr
    } = req.body;
  
    try {
      const promptData = await Prompt.findOne({ prompt }).exec();
  
      if (!promptData) {
        return res.status(404).json({ message: "Prompt nije nadjen" });
      }
  
      //Novi text
      promptData.uvod.text = promptText.uvodPrompt || promptData.uvod.text;
      promptData.holisticki.text = promptText.holistickiPrompt || promptData.holisticki.text;
      promptData.planIsh.text = promptText.planIshranePrompt || promptData.planIsh.text; 
      promptData.smernice.text = promptText.smernicePrompt || promptData.smernice.text; 
      promptData.fizAkt.text = promptText.fizickaAktivnostPrompt || promptData.fizAkt.text;
      promptData.imun.text = promptText.imunitetPrompt || promptData.imun.text;
      promptData.san.text = promptText.sanPrompt || promptData.san.text;
      promptData.voda.text = promptText.vodaPrompt || promptData.voda.text;
      promptData.predijeta.text = promptText.pretIskPrompt || promptData.predijeta.text;
      promptData.alergiio.text = promptText.alerginPrompt || promptData.alergiio.text;
      promptData.alk.text = promptText.alkoholPrompt || promptData.alk.text;
      promptData.pus.text = promptText.pusenjePrompt || promptData.pus.text;
      promptData.zakljucak.text = promptText.zakljucakPrompt || promptData.zakljucak.text;

      //Novi brojevi za karaktere
      promptData.uvod.brKar = promptBr.brKarUvod || promptData.uvod.brKar;
      promptData.holisticki.brKar = promptBr.brKarHol || promptData.holisticki.brKar;
      promptData.planIsh.brKar = promptBr.planIshBrKar || promptData.planIsh.brKar; 
      promptData.smernice.brKar = promptBr.smerniceBrKar || promptData.smernice.brKar; 
      promptData.fizAkt.brKar = promptBr.fizAktBrKar || promptData.fizAkt.brKar; 
      promptData.imun.brKar = promptBr.imunBrKar || promptData.imun.brKar; 
      promptData.san.brKar = promptBr.sanBrKar || promptData.san.brKar;
      promptData.voda.brKar = promptBr.vodaBrKar || promptData.voda.brKar;
      promptData.predijeta.brKar = promptBr.pretIskBrKar || promptData.predijeta.brKar; 
      promptData.alergiio.brKar = promptBr.alerIshBrKar || promptData.alergiio.brKar;
      promptData.alk.brKar = promptBr.alkoholBrKar || promptData.alk.brKar; 
      promptData.pus.brKar = promptBr.pusenjeBrKar || promptData.pus.brKar;
      promptData.zakljucak.brKar = promptBr.zakljucakBrKar || promptData.zakljucak.brKar;
  
      await promptData.save();
  
      res.status(200).json({ message: "Prompt modifikovan" });
  
    } catch (error) {
      console.error("Error updating prompt:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

// RADI
// const deleteprompt = async (req, res) => {
//   const { id } = req.body;
//   // console.log(id);

//   // Confirm data
//   if (!id) {
//     return res.status(400).json({ message: "Tip prompt ID potreban" });
//   }

//   // Does the user exist to delete?
//   const prompt = await prompt.findById(id).exec();

//   if (!prompt) {
//     return res.status(400).json({ message: "Tip prompta nije nadjen" });
//   }

//   const result = await prompt.deleteOne();

//   const reply = `Tip prompt ${result.name} with ID ${result._id} deleted`;

//   res.json(reply);
// };

module.exports = {
  getprompt,
//   getAllpromptNames,
//   createNewprompt,
  updateprompt,
//   deleteprompt,
};
