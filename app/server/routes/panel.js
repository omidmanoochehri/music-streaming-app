require( "dotenv" ).config();
var express = require( 'express' );
var router = express.Router();
var passport = require( 'passport' );
var formidable = require( 'formidable' );
const fs = require( 'fs' );
const coversFolder = __dirname + '/../public/images/covers/';
const podcastsFolder = __dirname + '/../media/podcasts/';
const { DEVELOPMENT_HOST, PRODUCTION_HOST, IS_PRODUCTION, PORT } = process.env;
const routeData = {
    mainURL: `${IS_PRODUCTION == "true" ? PRODUCTION_HOST : DEVELOPMENT_HOST + ':' + PORT}`
}


router.get( '/',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'dashboard', pageTitle: "Dashboard" } );
    } )

router.get( '/podcasts',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'podcasts', pageTitle: "Podcasts" } );
    } )

router.get( '/genres',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'genres', pageTitle: "Genres" } );
    } )

router.get( '/artists',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'artists', pageTitle: "Artists" } );
    } )

router.get( '/liveSchedules',
    //  require("connect-ensure-login").ensureLoggedIn("/auth/login"), 
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'liveSchedules', pageTitle: "Live Schedules" } );
    } )

router.get( '/media/covers',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'covers', pageTitle: "Covers" } );
    } )

router.get( '/media/podcasts',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'podcastFiles', pageTitle: "Podcasts" } );
    } )

router.get( '/users',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        res.render( 'admin/containers', { ...routeData, page: 'users', pageTitle: "Users" } );
    } )

router.get( '/media/coversList',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res )
    {
        let files = [];
        fs.readdirSync( coversFolder ).forEach( file =>
        {
            if ( file.indexOf( "jpg" ) > 0 || file.indexOf( "jpeg" ) > 0 )
            {
                files.push( file );
            }
        } );
        res.send( files );
    } )

router.get( '/media/podcastsList',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res )
    {
        let files = [];
        fs.readdirSync( podcastsFolder ).forEach( file =>
        {
            if ( file.indexOf( "mp4" ) > 0 || file.indexOf( "mp3" ) > 0 )
            {
                files.push( file );
            }
        } );
        res.send( files );
    } )

router.post( '/media/cover/add',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res )
    {
        var form = new formidable.IncomingForm();

        form.parse( req, function ( err, fields, files )
        {
            // const { name } = fields;
            console.log( files )
            var mediaFileOldPath = files.mediaFile.path;
            var mediaFileNewPath = './public/images/covers/' + files.mediaFile.name;

            fs.copyFile( mediaFileOldPath, mediaFileNewPath, function ( mediaFileError )
            {
                if ( mediaFileError ) throw mediaFileError;
                res.json( {
                    result: true
                } )
            } );
        } );
    } )

router.post( '/media/podcast/add',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res )
    {
        var form = new formidable.IncomingForm();

        form.parse( req, function ( err, fields, files )
        {
            // const { name } = fields;

            var mediaFileOldPath = files.mediaFile.path;
            var mediaFileNewPath = './media/podcasts/' + files.mediaFile.name;

            fs.copyFile( mediaFileOldPath, mediaFileNewPath, function ( mediaFileError )
            {
                if ( mediaFileError ) throw mediaFileError;
                res.json( {
                    result: true
                } )
            } );
        } );
    } )

router.delete( '/media/cover/remove',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        const { name } = req.body;
        try
        {
            fs.unlinkSync( coversFolder + name );
            res.json( {
                result: true
            } )
        } catch ( err )
        {
            // handle the error
        }
    } )

router.delete( '/media/podcast/remove',
    require( "connect-ensure-login" ).ensureLoggedIn( "/auth/login" ),
    function ( req, res, next )
    {
        const { name } = req.body;
        try
        {
            fs.unlinkSync( podcastsFolder + name );
            res.json( {
                result: true
            } )
        } catch ( err )
        {
            // handle the error
        }
    } )


router.get( '/login', function ( req, res, next )
{
    req.user ?
        res.redirect( '/panel' ) :
        res.render( 'admin/pages/login' );
} )

router.post( '/login',
    passport.authenticate( 'local', {
        successRedirect: '/panel',
        failureRedirect: '/panel/login'
    } ) );

module.exports = router;