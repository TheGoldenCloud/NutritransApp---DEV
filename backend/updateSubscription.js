const { MongoClient } = require("mongodb");

async function updateSubscriptions() {
  const uri = "mongodb://localhost:27017"; // URL vaše MongoDB baze
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("ime_baze"); // Zameni sa imenom vaše baze
    const collection = database.collection("ime_kolekcije"); // Zameni sa imenom vaše kolekcije

    // Kreiraj datum za prvi dan meseca
    const today = new Date();
    if (today.getDate() === 1) {
      await collection.updateMany({ status: "Aktivan" }, [
        {
          $set: {
            "broj.full": {
              $cond: {
                if: { $eq: ["$naziv_paketa", "Napredni"] },
                then: 20,
                else: {
                  $cond: {
                    if: { $eq: ["$naziv_paketa", "Osnovni"] },
                    then: 8,
                    else: "$broj.full",
                  },
                },
              },
            },
          },
        },
      ]);
      console.log("Upit uspešno izvršen!");
    }
  } finally {
    await client.close();
  }
}

updateSubscriptions().catch(console.error);
