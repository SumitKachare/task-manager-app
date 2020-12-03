const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
        
    },
    email :{
        type : String,
        unique:true,
        required : true,
        trim : true,    
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("Not a Valid Email!")
            }
        }
    },
    age : {
        type : Number,
        default : 0

    },
    password :{
        type : String,
        required : true,
        minlength : 6,
        trim : true,
        validate(value){
            if(value.includes("password")){
                throw new Error("Use any different password!")
            }
        }
    },
    tokens :[{
        token:{
            type : String, 
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true
}) 

userSchema.virtual('tasks' , {
    ref : 'Tasks',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON= function(){
    const user =  this
    var userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.methods.genAuthToken= async function(){
    const user= this
    const token = jwt.sign({_id : user._id.toString()} , process.env.JWT_SECRET)

    user.tokens= user.tokens.concat({ token})
    await user.save()
    return token

    
}

userSchema.statics.findByCred = async(email , password)=>{
    const user = await  User.findOne({email})
    if (!user) {
        throw new Error("Invalid Login!")
    }

    const isMatch = await bcrypt.compare(password , user.password)
    if (!isMatch) {
        throw new Error("Invalid Login!")
    }
    return user
}
userSchema.pre('save' , async function (next){
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password , 8)
    }
    next()

})

userSchema.pre('remove' , async function(next){
    const user = this
    await Tasks.deleteMany({ owner: user._id})
    next()
})
const User = mongoose.model('User', userSchema)
module.exports = User
