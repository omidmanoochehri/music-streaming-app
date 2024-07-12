var express = require("express");
var router = express.Router();
const CategoryModel = require("../models/Category");
var fs = require("fs");
const uploadFile = require("../helpers/uploadFile");
var formidable = require("formidable");

// const base64_encode = file => {
//   // read binary data
//   var bitmap = fs.readFileSync(file);
//   // convert binary data to base64 encoded string
//   return new Buffer(bitmap).toString('base64');
// }

/* GET a genre. */
router.get("/:_id", function (req, res) {
  let { _id } = req.params;

  CategoryModel.findOne({ _id }).exec(function (err, genre) {
    err
      ? res.json({
          result: "Sorry, An unknown error has occured!",
        })
      : res.json(genre || {});
  });
});

/* GET categories listing. */
router.get("/", function (req, res) {
  CategoryModel.find({}).exec(function (err, categories) {
    err
      ? res.json({
          result: "Sorry, An unknown error has occured!",
        })
      : // console.log(__dirname)
        // categories.forEach((cat, i) => {
        //   categories[i].cover =  `http://194.5.193.215:9000/images/covers/${cat.name}.jpg`;
        // });
        res.json(categories);
  });
});

/* add new category. */
router.post("/", function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    const { name } = fields;
    await uploadFile(files.cover, "covers");

    new CategoryModel({ name, cover:files.cover.name })
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.send(error);
      });
  });
});

/* update a category. */
router.put("/", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    let { _id, name } = fields;
    await uploadFile(files.cover, "covers");

    CategoryModel.updateOne({ _id }, { name, cover:files.cover.name }).exec(function (
      err,
      category
    ) {
      err
        ? res.json({
            result: "Sorry, An unknown error has occured!",
          })
        : res.json(category);
    });
  });
});

/* delete a category. */
router.delete("/", function (req, res) {
  const { _id } = req.body;
  CategoryModel.findOne({ _id })
    .remove()
    .exec()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
});

module.exports = router;
