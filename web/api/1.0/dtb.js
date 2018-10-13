'use strict'

const db      = require('../dbmodels.js')
const _       = require('lodash')
const express = require('express')
const router  = express.Router()

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
//// format 
/////////////////////////////////////////////////////////////////////////////////
const format = function(data) {
    const blacklist = ['geom', 'geom_3857', 'geometry']

    return { 
        type: "Feature",
        geometry: JSON.parse(data.geometry),
        properties: _.omit (data, blacklist)
    };
}

const formatCollection = function(data) {
    return { 
        type: "FeatureCollection",
        features: _.map(data, format)
    };
}

const formatPoints = function(data) {
    const blacklist = ['geom', 'geometry', 'lat', 'lon']
    
    return { type: 'FeatureCollection', 
         features: _.map (data, function(s) {
            return {
                type: 'Feature',
                properties:  _.omit (s, blacklist),
                geometry:  { type: 'Point', coordinates: [Number(s.lon), Number(s.lat)] },
            }    
        })           
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/regadm', function(req, res, next) {
    new db.GeoGeom()
        .where(req.query)
        .where({is_child: false})
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(formatCollection(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/regmet', function(req, res, next) {
    new db.GeoGeomRM()
        .where(req.query)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(formatCollection(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res, next) {
    new db.DTB()
        .where(req.query)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/bairro', function(req, res, next) {
    new db.GeoGeom()
        .where(req.query)
        .where({is_child: true})
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(formatCollection(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/events', function(req, res, next) {
    new db.EventGeom()
        .where(req.query)
        .fetchAll()
        .then(function(data) {
            res.status(200).jsonp(formatPoints(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/colors/:eventtype_id', function(req, res, next) {
    new db.GeoColors()
        .where(req.params)
        .fetchAll()
        .then(function(data) {
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/:geo_id', function(req, res, next) {
    new db.GeoGeom(req.params)
        .fetch()
        .then(function(data){
            res.status(200).jsonp(format(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
module.exports = router