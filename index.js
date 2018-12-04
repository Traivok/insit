'use strict'

const fs		  = require('fs');
const pg          = require('pg').native;
const path        = require('path');
const chalk       = require('chalk');
const express	  = require('express');
const morgan      = require('morgan');
const xmlParser   = require('express-xml-bodyparser');
const bodyParser  = require('body-parser');
const compression = require('compression');
const history     = require('connect-history-api-fallback');

const options     = require('./config.js');

// Configure Logging
const log = morgan('combined');

// Start express.js
const srv = express();
srv.use(compression());
srv.use(history({rewrites: [{ from: /^\/api.*$/,
                                to: c => c.parsedUrl.pathname }] } ));
// Logging
srv.use(log);
console.log( chalk.bold.yellow('Starting %s'), chalk.bold.yellow(options.appName) );

// BODY Parsers
srv.use(bodyParser.json());
srv.use(bodyParser.urlencoded({extended: true}));
srv.use(xmlParser());

srv.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS, POST, PUT, HEAD");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Serve Angular 5+ dist dir
const appDist = './app/dist';
if ( fs.existsSync(appDist) ) {
    srv.use('/', express.static(appDist, {maxAge: options.cacheAge} ));
}

// Serve API
const appAPI = './app/api';
if ( fs.existsSync(appAPI) ) {
    fs.readdirSync(appAPI)
        .filter ( (f) => fs.statSync(path.join(appAPI,f)).isDirectory() )
        .forEach(function(vers, i, allAPI){
            const last = ((i == (allAPI.length-1)) ? '\n' : ', ') ;
            process.stdout.write(chalk.cyan('v'+vers+last));

            fs.readdirSync(path.join(appAPI,vers)).forEach(function(r){
                const scrpt = path.basename(r,'.js');
                const route = path.join('/api',vers,scrpt);
                if ( r == scrpt )
                    return;

                console.log('\t => ', path.join(appAPI,vers,r));    
                const Router = require(path.join(__dirname,appAPI,vers,r)); 
                srv.use ( route, Router );
            })
        })
}

// Run server
srv.listen(options.appPort, (err) => {
    if (err) {
        console.error(chalk.red(error));
        process.exit(1);    
    } else {
        console.log(`Listening to HTTP at port TCP/${options.appPort}`);    
    }
});