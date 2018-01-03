'use strict'
//const _      = require('lodash')
//const fs     = require('fs')
const url    = require('url')
const getopt = require('node-getopt-long')

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const defaults = {
    serverPort  : 3001,
    serverName  : 'inkas - NYX Knowledge Application Server', 	    
    copyright   : 'Copyright 2015 (c) Antonio A. Russo',
    logFormat   : 'combined',
    
    cors        : false,
    http2       : false,
    printAPI    : false,
    verbose     : false,
    cacheAge    : 86400000,
    dbConn      : process.env.PG_CONNECTION_STRING || 'postgres://inkas@localhost/inkas',    
    certRoot    : process.env.SSL_DIR || '/etc/ssl/live/leviathan.nyxk.com.br',
    certFile    : { ca:     'chain.pem',
                    key:    'privkey.pem',
                    cert:   'fullchain.pem' }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//const integer = function(v) { return parseInt(v) }

const options =  getopt.configure([
	['printAPI|a!',         { description: 'Print out ALL exposed API mountpaths' }],
	['http2!',              { description: 'Enable HTTP/2 (default)' }],
	['cors!',               { description: 'Enable CORS' }],
	['verbose|v',           { description: 'Be verbose' }],
	['dbConn=s',            { description: 'Database connection URL' }],
	['serverPort|port|p=i', { description: 'TCP Port',          on:     parseInt }],
	['cacheAge|t=i',        { description: 'HTTP Cache maxAge', on:     parseInt }],
	['logFormat|F=s',       { description: 'LogFormat',         test:   ['dev', 'combined', 'common', 'short', 'tiny'] }] ],
	{ name        : 'inkas',
	commandVersion: 3.1,
	helpPrefix    : defaults.serverName,
	helpPostfix   : defaults.copyright,	
	defaults      : defaults }).process()

const pgURI = url.parse(options.dbConn)

options.pgConn = {
	user: pgURI.auth,
	host: pgURI.hostname,
	database: pgURI.pathname.replace(/^\//,'')
}

options.events = {
    mooring: 'mooring', 
    started: 'started', 
    updated: 'updated', 
    requested: 'requested', 
    progressed: 'progressed', 
}

module.exports = options
