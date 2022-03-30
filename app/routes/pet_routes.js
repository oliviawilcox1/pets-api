// import our dependencies, middleware and models

const express = require('express')
const passport = require('passport')

// pull in our model 
const Pet = require('../models/pet')
// this helps us detect certain situations and send custom errors 
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
// middleware that can send a 401
const requireOwnership = customErrors.requireOwnership
// require Token is passed as a second arg to router.<verb>
// makes it so that a token must be passes for that route to be available
// also sets 'req.user'
const requireToken = passport.authenticate('bearer', {session: false})
// removed any blank fields from req.body
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiate our router 
const router = express.Router()

// ROUTES GO HERE 

// replace with routes 
// INDEX 
// GET /pets
router.get('/pets', (req,res,next) => {
    // we will allow access to view all the pets
    // if we wanted to make it a protect resourse, we;d just need to add middleware
    Pet.find()
    .then( pets => {
        // pets will be an array of mongoose documents 
        // so we want to turn them into POJO ( plain ol js object)
        // remember that map returns a new array 
        return pets.map(pet => pet.toObject())
    })
    .then(pets=> res.status(200).json({ pets: pets}))
    .catch(next)
})
// SHOW
// get/ pets/ :id
router.get('/pets/:id', (req,res,next) => {
    // we get the id from req.params.id -> comes from :id
    Pet.findById(req.params.id)
    // if you want to get the owner as an object
        .populate('owner')
        .then(handle404)
        // if its successful, respond with an object as json
        //  otherwise pass to error handler
        .then(pet =>  res.status(200).json({ pets: pet.toObject() }))
        .catch(next)
})


// CREATE
// POST /pets
router.post('/pets', requireToken, (req,res,next) => {
    // the next is because we have custom middleware for errors below our routes - look at server.js either
    // does what petroutes wants or passes down to the error handler

    // we brougt in require token so we can have access to req.user
    // req.user is coming from require token
    req.body.pet.owner = req.user.id
    Pet.create(req.body.pet)
        .then(pet => {
            // send a succesful response like this
            res.status(201).json({ pet: pet.toObject() })
            // turns it from bson which is saved in our mongodb database
            // to json object 
            // you have to take a document out of a database turn it into an object to do stuff to it
        })
        // if an error occurs send to error handler
        .catch(next)


})


// UPDATE
// Patch /pets/:id
router.patch('/pets/:id', requireToken, removeBlanks, (req,res,next) => {
    // first if the client attempts to change the owner of the pet, we can disallow that
    delete req.body.owner
    // from the beginning
    // then we fidn our bet byid
    Pet.findById(req.params.id)
    // handle our 404
        .then(handle404)
    // require ownership and update pet 
        .then(pet => {
            requireOwnership(req, pet)
            return pet.updateOne(req.body.pet)
        })
    // send a 204 if successful
        .then(()=> res.sendStatus(204))
    // pass to error handler if not successful
        .catch(next)
})


// REMOVE
// get /pets/:id
router.delete('/pets/:id', requireToken, (req,res,next) => {
    // find pet by id
    Pet.findById(req.params.id)
    // first handle 404 if any
        .then(handle404)
    // use require ownership middleware to make sure the right person is making this equest 
        .then(pet => {
            // require ownerhsip is middleware, needs two arguments
            // the req itself and the document itself 
            requireOwnership(req, pet)
            // delete if no error is thrown from middlware
            pet.deleteOne()
        })
    // send back the 204 no content status 
        .then(()=> res.sendStatus(204))
    
    // if error occurs pass to handler
        .catch(next)
})

// ROUTES ABOVE HERE 




module.exports = router