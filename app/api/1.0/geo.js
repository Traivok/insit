'use strict'

const db      = require('../dbmodels.js')
const bd      = require('../dbconn.js')
const jwt     = require('../jwt.js')

const _       = require('lodash')
const promise = require('promise')
const express = require('express')
const router  = express.Router()

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

///////////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res, next) {
    new db.Geo()
        .where(req.query)
        .query(qb => qb.orderBy('geo_order', 'asc'))
        .fetchAll({withRelated: [{'counts': qb => qb.orderBy('eventtype_order', 'asc'),
                                 'bairros': qb => qb.orderBy('geo_name', 'asc')}] })
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
router.get('/:geo_id', function(req, res, next) {
    new db.Geo(req.params)
        .where(req.query)    
        .fetch({withRelated: [{'counts': qb => qb.orderBy('eventtype_order', 'asc'), 
                              'bairros.counts': qb => qb.orderBy('eventtype_order', 'asc') }]})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router