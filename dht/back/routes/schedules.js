var express = require( 'express' );
var router = express.Router();
const ScheduleModel = require( '../models/Schedule' );
var moment = require( 'moment-timezone' );
moment.tz.setDefault( 'Asia/Tehran' );

/* GET schedules listing. */
router.get( '/', function ( req, res, next )
{
  var now = moment( new Date(), "DD/MM/YYYY" );
  var next_week_datetime = moment( now, "DD/MM/YYYY" ).add( 7, 'days' );

  console.log( "now", now );

  ScheduleModel.find( {
    start_datetime: {
      // $gte: now,
      $lt: next_week_datetime
    }
  } ).populate( {
    path: 'podcast',
    select: '-_id name genre cover artist',
    populate: [ {
      path: 'genre',
      select: '-_id name cover'
    },
    {
      path: 'artist',
      select: '-_id name'
    } ]
  } ).exec( function ( err, schedule )
  {
    err ?
      res.json( {
        result: "Sorry, An unknown error has occured!"
      } )
      :
      res.json( schedule )
  } )
} );

/* add new live. */
router.post( '/', function ( req, res, next )
{
  let { podcast, channel, start_datetime, end_datetime } = req.body;
  start_datetime = moment.utc( start_datetime );
  end_datetime = moment.utc( end_datetime );

  console.log( start_datetime, end_datetime )
  new ScheduleModel( { podcast, channel, start_datetime, end_datetime } ).save().then( schedule =>
  {
    res.send( {
      result: true,
      schedule
    } );
  } ).catch( error =>
  {
    console.log( error )
    res.send( error );
  } )
} );

/* update live. */
router.put( '/:_id', function ( req, res, next )
{
  let { _id } = req.params;
  let { channel, start_datetime, end_datetime } = req.body;
  start_datetime = moment.utc( start_datetime );
  end_datetime = moment.utc( end_datetime );

  console.log( start_datetime, end_datetime )
  ScheduleModel.updateOne( { _id }, { channel, start_datetime, end_datetime } ).exec().then( schedule =>
  {
    res.json( {
      result: true,
      schedule
    } );
  } ).catch( error =>
  {
    console.log( error )
    res.json( error );
  } )
} );

/* delete a live. */
router.delete( '/delete/:_id', function ( req, res )
{
  let { _id } = req.params;

  ScheduleModel.findOne( { _id } ).remove().exec( function ( err, result )
  {
    err ?
      res.json( {
        result: "Sorry, An unknown error has occured!"
      } )
      :
      res.json( result )
  } )
} );

module.exports = router;