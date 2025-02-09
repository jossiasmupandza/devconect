const mongoose = require('mongoose');
const config  = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(error.message);

        //exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;