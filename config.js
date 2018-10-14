'use strict'

const getopt = require('node-getopt-long');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const defaults = {
    appPort  : process.env.APP_PORT || 3000,
    appName  : process.env.APP_NAME || 'no app name', 	    
    copyright : 'Copyright 2015 (c) Antonio A. Russo',
    cacheAge  : 86400000,
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const options =  getopt.configure([],
	{ name        : 'inkas',
	commandVersion: 3.1,
	helpPrefix    : defaults.appName,
	helpPostfix   : defaults.copyright,	
	defaults      : defaults }).process();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
options.pgConn = {
	user:     process.env.PG_USER,
	host:     process.env.PG_HOST,
	database: process.env.PG_DB,
    password: process.env.PG_PASS,
};

options.knex = require('knex')({client: 'pg', connection: options.pgConn, debug: false });
module.exports = options;
