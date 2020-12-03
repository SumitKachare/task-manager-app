const express = require('express')
const router = new express.Router()
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')
const User = require('../models/users')
const multer = require('multer')


router.post('/tasks',auth , async (req , res)=>{
    const task = new Tasks({
        ...req.body,
        owner : req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth , async (req, res)=>{
    try {
        const tasks = await Tasks.find({owner : req.user._id})
        res.send(tasks)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.get('/tasks/:id' , auth ,async (req , res)=>{
    const _id = req.params.id
    try {
        const task = await Tasks.findOne({ _id , owner : req.user._id})
        if (!task) {
            return res.status(400).send()
           }
        res.send(task)
    } catch (e) {
        res.status(404).send()
    }
})


router.patch('/tasks/:id' ,auth , async(req , res)=>{
    const allowedUpdates  = ['description' , 'completed']
    const keys = Object.keys(req.body)
    const validatonObjects = keys.every((task)=>{
        return allowedUpdates.includes(task)
    })
    if (!validatonObjects) {
        return res.status(400).send({error : "Invalid Update"})
    }
    try {
        const taskUpdate = await Tasks.findOne({ _id :req.params.id , owner: req.user._id})
    
        if (!taskUpdate) {
            return  res.status(400).send()  
        }

        keys.forEach((update)=>taskUpdate[update] = req.body[update])
        await taskUpdate.save()
        
        res.send(taskUpdate)
    } catch (e) {
        res.status(500).send(e)
    }
})


router.delete('/tasks/:id' ,auth , async (req , res)=>{
    try {
        const taskDel = await Tasks.findByIdAndDelete({_id: req.params.id , owner : req.user._id})
        if (!taskDel) {
        return  res.status(404).send({error :"Task not Found!"})
          }
          res.send(taskDel)
    } catch (e) {
        res.status(400).send(e)
    }
})
module.exports= router
