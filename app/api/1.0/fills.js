'use strict'

const db      = require('../dbmodels.js');
const bd      = require('../dbconn.js');
const jwt     = require('../jwt.js')

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
// Fetch ALL Fills
router.get('/', function(req, res, next) {
    new db.Fill()
        .where(req.query)
        .query(qb => qb.orderBy('created_at', 'desc'))
        .fetchAll({withRelated: []})
        .then(function(data){
            res.status(200).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// Fetch One Fill from Form
router.get('/:fill_id', function(req, res, next) {
    new db.Fill(req.params)
        .fetch({withRelated: ['answers.question.criterium']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
// Delete a Form CASCADE
router.delete('/:fill_id', function(req, res, next) {
    new db.Fill(req.params)
        .destroy()
        .then(function(data){         
            res.status(200).jsonp(req.params)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
// Create a new Fill with supplied Questions an returns its id 
router.post('/:org_id/:aspect_id', function(req, res, next) {    
    new db.Fill()
        .save(req.params)
        .then(function(data){
            const fill_id = _.pick(data.toJSON(), 'fill_id');
            const load = _.map ( req.body, a => _.extend (a, fill_id) )
        
            bd.knex(db.answer)
                .insert(load)
                .then(function (data){
                    res.status(201).jsonp(fill_id)
                })
                .catch(function(err){
                    res.status(404).jsonp(err)
                });
        })
        .catch(function(err) {
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router