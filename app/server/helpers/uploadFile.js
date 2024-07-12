var fs = require("fs");

module.exports = async (file, destination) => {
  var source = file.path;
  var target = `./public/images/${destination}/` + file.name;

  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  try {
    return await new Promise(function (resolve, reject) {
      rd.on("error", reject);
      wr.on("error", reject);
      wr.on("finish", resolve);
      rd.pipe(wr);
    });
  } catch (error) {
    rd.destroy();
    wr.end();
    throw error;
  }
};
