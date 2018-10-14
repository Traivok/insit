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

////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.get('/aspects/:aspect_id', function(req, res, next) {
    new db.Status()
        .where(req.params)
        .where({has_aspect: true})
        .query(qb => qb.orderBy('grade', 'asc'))
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res, next) {
    new db.Org()
        .where(req.query)
        .query(qb => qb.orderBy('org_order', 'asc'))
        .fetchAll({withRelated: [{'status': qb => qb.orderBy('aspect_order', 'asc')}]})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
router.get('/:org_id', function(req, res, next) {
    new db.Org(req.params)
        .where(req.query)
        .fetch({withRelated: [{'status': qb => qb.orderBy('aspect_order', 'asc')}]})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.get('/:org_id/:aspect_id', function(req, res, next) {
    new db.Status(req.params)
        .fetch()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post('/:org_id/:aspect_id', function(req, res, next) {
    new db.Grade()
        .where(req.params)
        .destroy()
        .then(function(){
            const load = _.extend ( {}, req.body, req.params )
            new db.Grade()
                .save(load)
                .then(function(data){
                new db.Status(req.params)
                    .fetch()
                    .then(function(){
                        res.status(200).jsonp();
                    })
                    .catch(function(err){
                        res.status(404).jsonp(err);
                    });
                })
                .catch(function(data){
                    res.status(404).jsonp(err);
                });
        
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });    
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.delete('/:org_id/:aspect_id', function(req, res, next) {
    new db.Grade()
        .where(req.params)
        .destroy()
        .then(function(data){
            res.status(200).jsonp(req.params)
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
});


module.exports = router