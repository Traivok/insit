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
router.get('/', function(req, res, next) {
    const cols = ['ibge_id', 'toponimia', 'sigla'];
    
    new db.Macro()
        .where(req.query)
        .query(qb => qb.orderBy('ibge_id', 'asc'))
        .fetchAll({ columns: cols,
                withRelated: [{
                        'estados': function(qb) { qb.column('ibge_id', 'toponimia', 'sigla', 'macro_id' )
                                             .orderBy('toponimia') },       
                  }] })
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.get('/estado/:ibge_id', function(req, res, next) {
    const cols = ['ibge_id', 'macro_id', 'toponimia', 'sigla', 'capital', 'capital_id'];    
    new db.Estado(req.params)
        .where(req.query)
        .fetch({ columns: cols,
               withRelated: [{
                   'capital':    function(qb) { qb.column('ibge_id', 'toponimia' ) },
                   'macro':      function(qb) { qb.column('ibge_id', 'toponimia', 'sigla') },
                   'meso':       function(qb) { qb.column('ibge_id', 'toponimia', 'estado_id').orderBy('toponimia') },
                   'meso.munis': function(qb) { qb.column('ibge_id', 'toponimia', 'meso_id').orderBy('toponimia') },
             }] })
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.get('/municipio/:ibge_id', function(req, res, next) {
    const cols = ['ibge_id', 'estado_id', 'toponimia'];    
    new db.Mun(req.params)
        .where(req.query)
        .fetch({ columns: cols,
               withRelated: [{
                   'estado': function(qb) { qb.column('ibge_id', 'toponimia', 'sigla'); },
                   'distritos': function(qb) { qb.column('ibge_id', 'toponimia', 'municipio_id', 'estado_id' ); },
                   'subdistritos': function(qb) { qb.column('ibge_id', 'toponimia', 'municipio_id', 'estado_id' ); },
               }] })
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.get('/allow/:user_id', function(req, res, next) {
    new db.Allow()
        .where(req.params)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.delete('/allow/:user_id', function(req, res, next) {
    new db.Allow()
        .where(req.params)
        .destroy()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
router.post('/allow/:user_id', function(req, res, next) {
    new db.Allow()
        .where(req.params)
        .destroy()
        .then(function(){
            const load = _.map ( req.body, (g) => _.extend({ibge_id: g}, req.params) )
                
            bd.knex(db.allow)
                .insert(load)
                .then(function(data){
                    res.status(200).jsonp(data);
                })
                .catch(function(err){
                    res.status(404).jsonp(err);
                });
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


module.exports = router