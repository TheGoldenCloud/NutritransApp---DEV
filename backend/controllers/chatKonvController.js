const ChatKonverzacija = require("../models/ChatKonverzacija");

//
const getChatKonv = async (req, res) => {
  const chat = await ChatKonverzacija.find(); //Taj jedan jedini objekat

  if (!chat?.length) {
    return res.status(400).json({ message: "Nisu nadjeni chatovi" });
  }

  res.json(chat);
};

//
const deleteChatKonv = async (req, res) => {
  const { id } = req.body;
  // console.log(id);

  if (!id) {
    return res.status(400).json({ message: "Tip chat ID potreban" });
  }

  const chat = await ChatKonverzacija.findById(id).exec();

  if (!chat) {
    return res.status(400).json({ message: "Chat-a nije nadjen" });
  }

  const result = await chat.deleteOne();

  const reply = `Chat ${result.name} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
    getChatKonv,
    deleteChatKonv,
};
