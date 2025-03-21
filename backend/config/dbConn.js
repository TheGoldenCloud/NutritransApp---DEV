const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        // await mongoose.connect('mongodb://mongo_db:27017/betonhala')
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB