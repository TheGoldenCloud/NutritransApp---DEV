const mongoose = require('mongoose');

// const CiljeviSchema = new mongoose.Schema({
//   tip: String,  //Misli se na primaran ili specifican cilj
//   naziv: String,
//   defTip: String, //Misli se na grupu kojoj pripada, ona 4 HC-ova
//   podciljevi: [
//     {
//       naziv: String,
//       value: {
//         type: Boolean,
//         default: false
//       }
//     }
//   ],
//   namirnice: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Namirnica'
//     }
//   ]
// });
const CiljeviSchema = new mongoose.Schema({
  tip: {  // Misli se na primaran ili specifičan cilj
    type: String,
    required: false
  },  
  naziv: {
    type: String,
    required: false
  },
  defTip: { // Misli se na grupu kojoj pripada, ona 4 HC-ova
    type: String,
    required: false
  }, 
  // podciljevi: {
  //   type: [String], // Niz stringova
  //   required: false
  // },
  namirnice: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Namirnica',
        required: false
      }
    ],
    required: false
  }
});

module.exports = mongoose.model('Ciljevi', CiljeviSchema);
