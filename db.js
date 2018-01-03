'use strict'

const _ = require ('lodash')
const options = require ('./config.js')

// Module Require
const knex = require('knex')({client: 'pg', connection: options.pgConn});
const db   = require('bookshelf')(knex)
const uid  = require('rand-token').uid

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const Code   = db.Model.extend({ tableName: 'auth.codes',   
                              idAttribute: 'code',      
                              hasTimestamps:['created_at'] })

const Token  = db.Model.extend({ tableName: 'auth.tokens',  
                              idAttribute: 'token',
                              hasTimestamps:['created_at'],
    user:   function() { return this.belongsTo(User, 'user_id') },
    client: function() { return this.belongsTo(Client, 'client_id') },
})


const Role = db.Model.extend({ tableName: 'auth.roles', idAttribute: 'role_id' })
const Perm = db.Model.extend({ tableName: 'auth.perms', idAttribute: 'perm_id' })
const User = db.Model.extend({ tableName: 'auth.users', idAttribute: 'user_id',   
    scope: function() { return this.belongsTo(Scope, 'user_id') },                                                       
    avatar: function() { return this.belongsTo(Avatar, 'file_id') }                                                       
})

const Scope  = db.Model.extend({ tableName: 'auth.scopes',  idAttribute: 'user_id' })
const Avatar = db.Model.extend({ tableName: 'store.files',  idAttribute: 'file_id' })
const Client = db.Model.extend({ tableName: 'auth.clients', idAttribute: 'client_id' })

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const findUser = function(user_id, done) {
    new User({user_id: user_id, user_active: true})
        .fetch()
        .then(function(data){
            return done(null, !!data ? data.toJSON() : data )        
        })
        .catch(function(err){
            return done(err)
        })
}

const checkUser = function(username, password, done) {
    new User({user_name: username, password: password, user_active: true })
        .fetch()
        .then(function(data){
            return done(null, !!data ? data.toJSON() : data )
        })
        .catch(function(err){ 
            return done(err) 
        })
}
        
const findClient = function(client_id, done) {
    new Client({ client_id: client_id })
        .fetch()
        .then(function(data){
            return done(null, !!data ? data.toJSON() : data )
        })
        .catch(function(err){ 
            return done(err) 
        })
}

const checkClient = function(clientname, clientsecret, done) {
    new Client({ client_name: clientname, client_secret: clientsecret })
        .fetch()
        .then(function(data){
            return done(null, !!data ? data.toJSON() : data )
        })
        .catch(function(err){ 
            return done(err) 
        })
}

const authClient = function(clientname, redirect_url, done) {
    new Client({ client_name: clientname })
        .fetch()
        .then(function(data){
            return done(null, !!data ? data.toJSON() : data, redirect_url )
        })
        .catch(function(err){ 
            return done(err) 
        })
}
        
const checkToken = function(accessToken, done) {
    new Token({token: accessToken})
        .fetch({withRelated: ['user.scope', 'user.avatar', 'client']})
        .then(function(data){
            if ( _.isNull(data) )
                return done(null, false)
                
            const token = data.toJSON()
            const authInfo = token.user.scope
            const userInfo = _.omit(token.user, ['password','scope'])
            
            userInfo.client = _.omit(token.client, ['client_secret', 'created_at'])
            userInfo.scope  = token.user.scope
            
            return done(null, userInfo, authInfo)
        })
        .catch(function(err){
            return done(err)
        })
}

const saveToken = function(client, user, ares, done) {
    const data = _.extend({ token: uid(256) }, 
                       _.pick(user, 'user_id'), 
                       _.pick(client, 'client_id') )
    new Token()
        .save(data)
        .then(function(){
            return done(null, data.token)
        })
        .catch(function(err){
            return done(err)
        })
}

const revokeToken = function(token) {
    new Token({token: token})
        .destroy()
        .then(function(data){
            return data.toJSON()
        })
        .catch(function(err){
            return err.toJSON()
        })
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const exchangeCred = function(client, scope, done) {
    return checkClient(client.client_name, client.client_secret, function(err, client) {
        return saveToken(client, null, null, done)
    })
}

const exchangePass = function(client, username, password, scope, done) {
    return checkClient(client.client_name, client.client_secret, function(err, localClient) {
        return checkUsers(username, password, function(err, user) {
            return saveToken(localClient, user, null, done)
        })
    })
}

const exchangeCode = function(client, code, redirectURI, done) {
    new Code({code: code})
        .fetch()
        .then(function(data){
            const auth = data.toJSON()
            if ( _.isNull(auth)                          ||
                (client.client_id !== auth.client_id   ) ||
                (     redirectURI !== auth.redirect_uri)) { 
                return done(null, false)
            } else 
                return saveToken(auth, auth, null, done)
        })
        .catch(function(err){
            return done(err)
        })
}

const saveCode = function(client, redirectURI, user, ares, done) {
    const data = {   code: uid(16), 
           redirect_uri: redirectURI, 
                user_id: user.user_id, 
              client_id: client.client_id }
        
    new Code()
        .save(data)
        .then(function(){
            return done(null, data.code)
        })
        .catch(function(err){
            return done(err)
        })
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
_.extend(exports, {
    findUser:       findUser,
    findClient:     findClient,
    authClient:     authClient,
    checkUser:      checkUser,
    checkClient:    checkClient,
    checkToken:     checkToken,
    revokeToken:    revokeToken,
    saveToken:      saveToken,
    saveCode:       saveCode,
    exchangeCode:   exchangeCode,
    exchangePass:   exchangePass,
    exchangeCred:   exchangeCred
})
