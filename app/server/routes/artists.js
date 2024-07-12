var express = require('express');
var router = express.Router();
const ArtistModel = require('../models/Artist');

/* GET artists listing. */
router.get('/', function (req, res, next) {
  ArtistModel.find({}).exec(function (err, artists) {
    err ?
      res.json({
        result: "Sorry, An unknown error has occured!"
      })
      :
      res.json(artists)
  })
});

/* add new artist. */
router.post('/', function (req, res, next) {
  const { name } = req.body;
  new ArtistModel({ name }).save().then(result => {
    res.send(result);
  }).catch(error => {
    console.log(error)
    res.send(error);
  })
});

/* delete a artist. */
router.delete('/', function (req, res, next) {
  const { _id } = req.body;
  ArtistModel.findOne({ _id }).remove().exec().then(result => {
    res.send(result);
  }).catch(error => {
    console.log(error)
    res.send(error);
  })
});

module.exports = router;