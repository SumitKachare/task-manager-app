const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


router.post('/users' , async (req, res)=>{

    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.genAuthToken()
     res.status(200).send({user , token})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/users/login' , async (req , res)=>{
    try {
        const user = await User.findByCred(req.body.email , req.body.password)
        const token = await user.genAuthToken()
        res.send({
            user , token
        })
    } catch (e) {
        res.status(400).send()
    }


})

router.get('/users/me', auth,async (req ,res)=>{
    res.send(req.user)
})

router.post('/users/logout' , auth , async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send(200)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll' ,auth , async (req , res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send( )
    } catch (e) {
        res.status(500).send()
    }

})

router.get('/users/:id',async (req , res)=>{
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404)
        }
        res.send(user)
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/users/me',auth , async (req ,res)=>{
    const allowedUpdates = ['name' , 'age' , 'email' , 'password']
    const updates = Object.keys(req.body)
    const validatonObjects = updates.every((update)=>{
         return allowedUpdates.includes(update)
    })
    if (!validatonObjects) {
        return res.status(400).send({error : 'Invalid Updates!!'})
    }
    try {
        
        updates.forEach((update)=>req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
        
    }
})

router.delete('/users/me', auth ,async (req , res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// const uploads = multer({
//     dest : 'avatar'
// })
// router.post('/users/me/avatars' , uploads.single('avatar') , (req ,res)=>{
//     res.send()
// })

 
const fileupload = multer({
   
    limits : {
        fileSize : 1000000
    },
    fileFilter(req , file , cb){
            if (!file.originalname.match(/\.(jpg)$/)) {
                return cb(new Error(' File type is not jpg'))
            }
            cb(undefined , true)
    } 
})

router.post('/users/me/files' , auth , fileupload.single('allFiles') , async  (req , res)=>{
    // req.user.avatar = req.file.buffer 
    const buffer = await sharp(req.file.buffer).resize({width:250 , height : 250    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()  
}  , (error , req , res, next)=>{
    res.send({error : error.message})
})

router.delete('/users/me/avatar' ,auth ,  async (req , res )=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar' , async (req, res)=>{
    
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('No user Found')
        }

        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(400).send()
    }

})

module.exports= router 