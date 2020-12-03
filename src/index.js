const express = require('express')
const mongoose = require('mongoose')
require('./db/mongoose')
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')
 
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT , ()=>{
    console.log("Server is running on port : "+ PORT)
})