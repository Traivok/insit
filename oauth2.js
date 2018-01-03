'use strict'
const _  = require ('lodash')
const ejs  = require('ejs')
const express  = require('express')
const router  = express.Router()

const login    = require('connect-ensure-login')
const passport = require('passport')
const oauth2orize = require('oauth2orize')
const LocalStrategy  = require('passport-local').Strategy
const BasicStrategy  = require('passport-http').BasicStrategy
const BearerStrategy = require('passport-http-bearer').Strategy
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy

const db = require('./db')

// Express configuration
const app = express()

passport.use(new LocalStrategy(db.checkUser))
passport.use(new BasicStrategy(db.checkClient))
passport.use(new BearerStrategy(db.checkToken))
passport.use(new ClientPasswordStrategy(db.checkClient))

// create OAuth 2.0 server
const server = oauth2orize.createServer()

server.grant(oauth2orize.grant.code(db.saveCode))
server.grant(oauth2orize.grant.token(db.saveToken))
server.exchange(oauth2orize.exchange.code(db.exchangeCode))
server.exchange(oauth2orize.exchange.password(db.exchangePass))
server.exchange(oauth2orize.exchange.clientCredentials(db.exchangeCred))

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
passport.deserializeUser(db.findUser)
passport.serializeUser(function(user, done) {
    return done(null, user.user_id)
})

server.deserializeClient(db.findClient)
server.serializeClient(function(client, done) {
    return done(null, client.client_id)
})

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
// Load passport Strategies
const authDialog = function(req, res) {
    res.render('dialog.ejs', {  user: req.oauth2.user.user_fullname, 
                   transactionID: req.oauth2.transactionID, 
                          client: req.oauth2.client.client_desc })
}

const loginDialog = function(req, res) {
    res.render('login.ejs')
}


///////////////////////////////////////////////////////////////////////
// OAuth2 endpoints

router.post('/dialog/authorize/decision',  login.ensureLoggedIn(), 
                                        server.decision() )

router.get ('/dialog/authorize',           login.ensureLoggedIn(),
                                        server.authorization(db.authClient), 
                                        authDialog )

router.post('/oauth/token',                passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
                                        server.token(),
                                        server.errorHandler() )

///////////////////////////////////////////////////////////////////////
// Login / Logout endpoints
router.get('/', function(req, res) {
    res.send('INKAS OAuth2 provider')
})

router.get('/logout', function(req, res) {
    const token = _.split (req.get('Authorization'), ' ')[1]
    db.revokeToken(token)
    req.logout()
    res.redirect('/')
})

router.get ('/login', loginDialog)
router.post('/login',
    passport.authenticate('local', { successReturnToOrRedirect: '/', 
                                     failureRedirect: '/login' }))

///////////////////////////////////////////////////////////////////////
// User Info  (OpenId Connect)
router.get('/userinfo', 
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
        res.json( req.user )
})

///////////////////////////////////////////////////////////////////////
module.exports = router
