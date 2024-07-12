const { PassThrough } = require("stream");
var _sinks = {
    ch1: new Map(),
    ch2: new Map(),
  };
  
exports.makeResponseSink = (chNumber) => {
  const id = this.generateRandomId();
  const responseSink = PassThrough();
  _sinks[`ch${chNumber}`].set(id, responseSink);
  return { id, responseSink };
};

exports._broadcastToEverySink = (chNumber, chunk) => {
  for (const [, sink] of _sinks[`ch${chNumber}`]) {
    // console.log("sink", sink);
    sink.write(chunk);
  }
};

exports._getBitRate = (song) => {
  try {
    let bitRate = ffprobeSync(Path.join(process.cwd(), song)).format.bit_rate;
    return parseInt(bitRate);
  } catch (err) {
    return 128000; // reasonable default
  }
};

exports.removeResponseSink = (chNumber, id) => {
  _sinks[`ch${chNumber}`].delete(id);
};

exports.generateRandomId = () => Math.random().toString(36).slice(2);
