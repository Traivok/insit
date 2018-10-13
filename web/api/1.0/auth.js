'use strict'

const db      = require('../dbconn.js')
const jwt     = require('../jwt.js')

const _       = require('lodash')
const express = require('express')
const router  = express.Router()

const request = require('request');
const storage = require('node-persist');

const getTokenParams = {  method: 'POST',
                             url: 'https://nyxk.auth0.com/oauth/token',
                         headers: { 'content-type': 'application/json' },
                            body: '{ "client_id":"j8V7kjjkRYllDI2QGWpD3E0gEIKhkW7S",\
                                 "client_secret":"BtNL5YrKEO-qsP8T5W8NUXRDd-E5RGcBzHcUC1zYH-8FqSFPgwqQHQJNbRbIrUdu",\
                                 "audience":"urn:auth0-authz-api","grant_type":"client_credentials"}' };



storage.initSync({
    dir: '/tmp/.node-persist',
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.use(jwt.validator);
router.use(jwt.errorHandler);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Forms
router.get('/:user_id/:client_id', function(req, res, next) {
    storage.getItem ('authorization', function(err,authz){
        if (err || !authz ) {
            request(getTokenParams, function (err, resp, body){
                const token = JSON.parse(body);

                authz = token.token_type + ' ' + token.access_token;
                storage.setItemSync('authorization', authz, {ttl: token.expires_in * 1000});
            });    
        }
        
        request({ method: 'POST',
                     url: 'https://nyxk.us.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/users/' + req.params.user_id + '/policy/' + req.params.client_id,
                            body:'{ "connectionName": "Username-Password-Database" }', 
                         headers: { 'content-type': 'application/json', 
                                    'authorization': authz } }, function(err, resp, data) {
                            if (err) {
                                res.status(404).jsonp(err);
                            } else {
                                res.status(200).jsonp(JSON.parse(data));
                            }        
        });
    });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router