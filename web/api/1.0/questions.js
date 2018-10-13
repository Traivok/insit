'use strict'

const db      = require('../dbmodels.js');
const jwt     = require('../jwt.js');

const _       = require('lodash');
const promise = require('promise');
const express = require('express');
const router  = express.Router();


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Forms
router.get('/', function(req, res, next) {
    new db.Question()
        .where(req.query)
        .query(qb => qb.orderBy('question_order', 'asc'))
        .fetchAll({withRelated: ['unit.criteria']})
        .then(function(data){
            res.status(200).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
// Delete a Questions
router.delete('/:question_id', function(req, res, next) {
    new db.Question(req.params)
        .destroy()
        .then(function(data){         
            res.status(200).jsonp(req.params)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
// Create a new Question an returns its id 
router.post('/', function(req, res, next) {    
    new db.Question()
        .save(req.body)
        .then(function (data){
            res.status(201).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
// Update a Question by its id and return it 
router.put('/:question_id', function(req, res, next) {
    new db.Question(req.params)
        .save(req.body, {patch: true})
        .then(function (data){
            res.status(204).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
// Reorder questions
router.post('/reorder', function(req, res, next) {    
    const all = _.map ( req.body, q => {
        new db.Question( _.pick(q,'question_id') )
            .save( _.pick(q,'question_order'), { patch: true, method: 'update' })
    });
    
    promise.all(all)
        .then(function (data){
            res.status(201).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router;