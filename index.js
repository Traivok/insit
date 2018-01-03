#! /usr/bin/env node

'use strict'

// Load Modules
const _			  = require('lodash')
const fs		  = require('fs')
const pg          = require('pg').native
const url         = require('url')
const path        = require('path')
const spdy        = require('spdy')
const chalk       = require('chalk')
const compression = require('compression')
const session     = require('express-session')
const pgSession   = require('connect-pg-simple')(session)
const passport    = require('passport')
const ListRoutes  = require('express-list-routes')

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

// Serve libraries and JS modules
//srv.use('/node_modules', express.static(__dirname+'/node_modules', {maxAge: options.cacheAge} ))

srv.use(bodyParser.json()) 
srv.use(bodyParser.urlencoded({extended: true}))

srv.use(session({saveUninitialized: false, 
                 secret: options.serverName, 
                 resave: false, 
                 store : new pgSession({ pg: pg, tableName: 'sessions', schemaName: 'auth', conString: options.pgConn })
}))

srv.use(passport.initialize())
srv.use(passport.session())

// OAuth2 endpoints
srv.use('/', require ('./oauth2.js') )


// CORS
if ( options.cors ) {
    srv.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS, POST, PUT, HEAD");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
}

const webapps = './webapps'


// Function that bootstraps API on a webapp dir
const bootstrapAPI = function(app) {
    const appDist  = path.join(webapps,app,'dist')
    const appAPI   = path.join(webapps,app,'api')
    const appBase  = path.join(webapps,app)
    const appRoute = path.join('/',    app)
    
    if ( !fs.statSync(appBase).isDirectory() )
        return
    
    process.stdout.write ('Application '+chalk.bold.white(app)+chalk.bold.white('\t=> ')+chalk.cyan('API '))
            
    // Serve Angular 5+ dist dir
    if ( fs.existsSync(appDist) ) {
        srv.use(appRoute, express.static( appDist, {maxAge: options.cacheAge} ))
    }
    
    // Serve API
    if ( !fs.existsSync(appAPI) ) {
        process.stdout.write(chalk.gray('none\n'))
//        return 
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
                        ListRoutes({ prefix: '=> '+route }, '\nAPI v'+vers+':\t'+scrpt, Router )
                    }

                    srv.use ( route, Router )
                })
            })
    }
}

// Load applications
fs.readdirSync(webapps).forEach(bootstrapAPI);

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
fs.readdirSync(webapps).forEach ( function(app) {
    if ( !fs.statSync (webapps+'/'+app).isDirectory() ) {
        return
    }
    
    // Register generic event handlers
    const ioApp = io.of('/'+app)
        
    ioApp.on('connection', function (socket) {
        const emit = function (evt) {
            return function(data) {
                ioApp.emit(evt, data)
            }
    }
        
        socket.on ('mooring',    emit('mooring'   ) )
        socket.on ('started',    emit('started'   ) )
        socket.on ('updated',    emit('updated'   ) )
        socket.on ('requested',  emit('requested' ) )
        socket.on ('progressed', emit('progressed') )
    })
})
