// import mongoose
const mongoose = require('mongoose')

// create database connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useCreateIndex : true,
    useFindAndModify:false
})