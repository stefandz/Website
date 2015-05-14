/* jshint unused: false, -W117, esnext: true */

// The Workers Server
// ==================
//
// The server for the workers website

// Modules
// =======
var http = require( 'http' );
var repl = require( 'repl' );
var util = require( 'util' );
var path = require( 'path' );
var W = require( 'w-js' );
var express = require( 'express' );
var jade = require( 'jade' );
var superagent = require( 'superagent' );
var serveStatic = require( 'serve-static' );
var fs = require( 'fs' );

// Init
// ====
var init = W.composePromisers( makeExpressApp,
                               makeServer,
                               makeReplIfLocal );

var options = { port: process.env.PORT || 10001,
                isLocal: W.isUndefined( process.env.IS_LOCAL ) ? false : process.env.IS_LOCAL };

init( options, ( app ) => report( 'OK', 'Server created' ) );

// Express
// =======
function makeExpressApp ( app ) {
    return W.promise( function ( resolve, reject ) {
         app.expressApp = express();

        // Jade
        // ----
        // Without views directory
        app.expressApp.set( 'view engine', 'jade' );
        app.expressApp.set( 'views', path.join( __dirname, 'views' ) );
        app.expressApp.locals.pretty = true;

        // Middleware
        // ----------
        
        // Static Files & Directory Listing
        // ---------------------------------
        app.expressApp.use( serveStatic( path.join( __dirname, 'public' ) ) );

        // Errors
        // ------
        app.expressApp.use( function ( err, req, res, next ){
            res.send( '<pre>' + err  + '<pre>' );
        });

        // Router
        // ------
        app.expressApp.get( '/', ( req, res ) => res.render( 'home', makeJadeData( app ) ) );

        resolve( app );
    });
}

// Server
// ======
function makeServer ( app, done ) {
    return W.promise( function ( resolve, reject ) {
        app.server = http.createServer( app.expressApp );
        app.server.listen( app.port );
        report( 'OK', 'Server running on: ' + app.port );
        resolve( app );
    });
}

// REPL
// ====
function makeReplIfLocal ( app, done ) {
    return W.promise( function ( resolve, reject ) {
        if ( app.isLocal ) {
            setTimeout( function () {
                var r = repl
                        .start({
                            prompt: "REPL> ",
                            input: process.stdin,
                            output: process.stdout
                        });
                r.context.app = app;
            }, 1000 );
        }
        resolve( app );
    });
}

// Utils
// =====

// Jade
// ----
function makeJadeData ( app ) {
    return {
        isLocal: app.isLocal
    };
}

// Reporting
// ---------
function report( status, str ) {
    console.log( '[', status, ']', W.rest( W.toArray( arguments ) ).join( ' ' ) );
}

function makeReporter( status, str ) {
    var reportArgs = arguments;
    return function () {
        report.apply( this, reportArgs );
        var calleeArgs = arguments;
        return W.promise( function ( resolve, reject ) {
            resolve.apply( this, calleeArgs );
        });
    };
}



