'use strict'

const getopt = require('node-getopt-long');
//const url    = require('url');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const defaults = {
    serverPort  : 3001,
    serverName  : 'inkas - NYX Knowledge Application Server', 	    
    appName     : 'insit',
    copyright   : 'Copyright 2015 (c) Antonio A. Russo',
    logFormat   : 'combined',
    cors        : false,
    http2       : false,
    printAPI    : false,
    verbose     : false,
    cacheAge    : 86400000,
//    dbConn      : process.env.PG_CONNECTION_STRING,    
    certRoot    : process.env.SSL_DIR,
    certFile    : { ca:     'chain.pem',
                    key:    'privkey.pem',
                    cert:   'fullchain.pem' }
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
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
	defaults      : defaults }).process();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//const pgURI = url.parse(options.dbConn);

options.pgConn = {
	user:     process.env.PG_USER,
	host:     process.env.PG_HOST,
	database: process.env.PG_DB,
    password: process.env.PG_PASS,
//	user:     pgURI.auth,
//	host:     pgURI.hostname,
//	database: pgURI.pathname.replace(/^\//,'')
//    password: process.env.PG_PASS,
};

//console.log(options);
//process.exit(0);

options.knex = require('knex')({client: 'pg', connection: options.pgConn, debug: false });

module.exports = options;
