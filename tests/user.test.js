const { TestScheduler } = require('jest')
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const User =  require('../src/models/users')
const jwt = require('jsonwebtoken')

const defaultUserId = new mongoose.Types.ObjectId()

const defaultUser = {
    _id : defaultUserId,
    name : 'mike',
    email : 'likemike@gmail.com',
    password : '12345678',
    tokens : [{
        token : jwt.sign({ _id : defaultUserId} , process.env.JWT_SECRET)
    }]
}

beforeEach( async ()=>{
    await User.deleteMany()
    await new User(defaultUser).save()
})

test('New user Sign-Up' , async ()=>{
    const response = await request(app).post('/users').send({
        name : 'sumit',
        email : 'sumit18@gmail.com',
        password : '12345678'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect( response.body).toMatchObject({
        user : {
            name : 'sumit',
            email : 'sumit18@gmail.com',
        },
        token : user.tokens[0].token
    })

    expect(user.password).not.toBe('12345678')


    
})


test('Login Existing User'  , async  ()=>{
    const response = await  request(app).post('/users/login').send({
        email : defaultUser.email,
        password : defaultUser.password
    }).expect(200)

    const user = await User.findById(defaultUser)
    expect(response.body.token).toBe(user.tokens[1].token)
})       