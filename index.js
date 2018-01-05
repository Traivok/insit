#! /usr/bin/env node

'use strict'

// Load Modules
const _			  = require('lodash')
const fs		  = require('fs')
const pg          = require('pg').native
const path        = require('path')
const spdy        = require('spdy')
const chalk       = require('chalk')
const compression = require('compression')
const listRoutes  = require('express-list-routes')
const session     = require('express-session')
const pgSession   = require('connect-pg-simple')(session)
const passport    = require('passport')

const express	  = require('express')
const morgan      = require('morgan')
const bodyParser  = require('body-parser')

const options = require('./config.js')

// Configure Logging
const log = morgan(options.logFormat, { stream: options.logStream })

// Fix morgan HTTP/2 fail
morgan.token('http-version', function getHttpVersionToken(req){
    return req.isSpdy ? '2' : req.httpVersionMajor + '.' + req.httpVersionMinor
})

// Start express.js
const srv = express()
srv.use(compression())

// Set render engine to AUTH
srv.set('view engine', 'ejs')
srv.use(log)
console.log( chalk.bold.yellow('Starting %s'), chalk.bold.yellow(options.serverName) )

srv.use(bodyParser.json()) 
srv.use(bodyParser.urlencoded({extended: true}))

srv.use(session({saveUninitialized: false, 
                 secret: options.serverName, 
                 resave: false, 
                 store : new pgSession({ pg: pg, 
                                  tableName: 'sessions', 
                                 schemaName: 'auth', 
                                  conString: options.dbConn
                                       })
}));

srv.use(passport.initialize())
srv.use(passport.session())

// OAuth2 endpoints
srv.use('/', require ('./oauth2.js') )

// CORS
if ( options.cors ) {
    console.log( chalk.bold.yellow('CORS Enabled') );

    srv.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS, POST, PUT, HEAD");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
}


// Load applications
fs.readdirSync(options.webapps).forEach(function(app) {
    const appAPI   = path.join(options.webapps,app,'api')
    const appDist  = path.join(options.webapps,app,'dist')
    const appBase  = path.join(options.webapps,app)
    const appRoute = path.join('/', app)
    
    if ( !fs.statSync(appBase).isDirectory() )
        return
    
    process.stdout.write ('Application '+chalk.bold.white(app)+chalk.bold.white('\t=> ')+chalk.cyan('API '))
            
    // Serve Angular 5+ dist dir
    srv.use(appRoute, express.static( appDist, {maxAge: options.cacheAge} ))
    
    // Serve API
    if ( !fs.existsSync(appAPI) ) {
        process.stdout.write(chalk.gray('none\n'))
    } else {
        fs.readdirSync(appAPI)
            .filter ( (f) => fs.statSync(path.join(appAPI,f)).isDirectory() )
            .forEach(function(vers, i, allAPI){
                const last = ((i == (allAPI.length-1)) ? '\n' : ', ') 
                process.stdout.write(chalk.cyan('v'+vers+last))

                fs.readdirSync(path.join(appAPI,vers)).forEach(function(r){
                    const scrpt = path.basename(r,'.js')
                    const route = path.join(appRoute,'api',vers,scrpt)
                    if ( r == scrpt )
                        return

                    const Router = require(path.join(__dirname,appAPI,vers,r))   

                    if ( options.printAPI ) {
                        listRoutes({ prefix: '=> '+route }, '\nAPI v'+vers+':\t'+scrpt, Router )
                    }

                    srv.use ( route, Router )
                })
            })
    }
});


// printAPI
if ( options.printAPI ) {
    process.exit(0);
}



const appSrv = options.http2 ? spdy.createServer({
        ca: fs.readFileSync(options.certRoot+'/'+options.certFile.ca),
        key: fs.readFileSync(options.certRoot+'/'+options.certFile.key),
        cert: fs.readFileSync(options.certRoot+'/'+options.certFile.cert),
    }, srv) : srv;


// Run server
const io = require('socket.io').listen(
    appSrv.listen(options.serverPort, function(err){
        if (err) {
            console.error(chalk.red(error))
            return process.exit(1)
        } else {
            console.log('Listening to %s at port TCP/%s', 
                            options.http2 ? chalk.bold('HTTPS') : chalk.gray('HTTP'),
                            options.serverPort);
        }
    })
);


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
fs.readdirSync(options.webapps).forEach ( function(app) {
    if ( !fs.statSync (options.webapps+'/'+app).isDirectory() ) {
        return
    }
    
    // Register generic event handlers
    const ioApp = io.of('/'+app)        
    ioApp.on('connection', function (socket) {        
        _.each ( options.events, (e) => socket.on (e, (d) => { ioApp.emit(e,d) }) );   
    })
})
