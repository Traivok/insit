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
// Fake Events

////////////////////////////////////////////////////
// Create a new FakeEvent an returns its id 
router.post('/fake/:eventtype_id/:geo_id', function(req, res, next) {
    new db.Event()
        .save(req.params)
        .then(function(data){         
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


////////////////////////////////////////////////////
// Create a new FakeEvent an returns its id 
router.post('/', function(req, res, next) {
    new db.Event()
        .save(req.body)
        .then(function(data){         
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
// Fetch One Fill from Form
router.get('/:event_id', function(req, res, next) {
    new db.Event(req.params)
        .fetch({withRelated: ['eventtype', 'status', 'severity',
                              'bairro.regadm',
                              { files: function(qb) { 
                                    qb.column('store.store_id', 
                                              'mimetype', 
                                              'created_at' )} }] })
        .then(function(data){
            res.status(200).jsonp(data.toJSON({omitPivot: true}));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Fills
router.get('/', function(req, res, next) {
    new db.Event()
        .where(req.query)
        .query(qb => qb.orderBy('created_at', 'desc'))
        .fetchAll({withRelated: ['eventtype', 'status', 
                                 'severity', 'bairro.regadm']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
// Update a model by its id and return it 
router.put('/enable/:eventtype_id/:geo_id', function(req, res, next) {
    new db.EventTypeGeo()
    .where(req.params)
    .save(req.body, {patch: true, method: 'update'})
        .then(function (data){
            res.status(204).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router