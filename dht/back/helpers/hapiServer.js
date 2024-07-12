const Hapi = require("@hapi/hapi");
const StaticFilePlugin = require("@hapi/inert");
const { makeResponseSink, removeResponseSink } = require("./streamHandler");
const Path = require("path");

const route = {
  name: "streamServer",
  register: async (server) => {
    server.route({
      //   config: {
      //     cors: {
      //       origin: ["*"],
      //       additionalHeaders: ["cache-control", "x-requested-with"],
      //     },
      //   },
      method: "GET",
      path: "/stream/{channelNumber}",
      handler: (request, h) => {
        let channelNumber = request.params.channelNumber;
        let referer = request.headers.referrer || request.headers.referer;
        console.log("refferrer", referer);
        if (
          referer &&
          (referer.indexOf("https://app.deephousetehran.net") > -1 ||
            referer.indexOf("http://localhost:5000") > -1)
        ) {
          const { id, responseSink } = makeResponseSink(channelNumber);
          request.app.sinkId = id;
          return h.response(responseSink).type("audio/mpeg");
        } else {
          return {
            result: false,
            response: "Access Denied!",
          };
        }
      },
      options: {
        ext: {
          onPreResponse: {
            method: (request, h) => {
              let channelNumber = request.params.channelNumber;
              request.events.once("disconnect", () => {
                removeResponseSink(channelNumber, request.app.sinkId);
              });
              return h.continue;
            },
          },
        },
      },
    });
  },
};

void (async function start() {
  const server = Hapi.server({
    port: process.env.LIVE_PORT || 8000,
    host: process.env.HOST || "localhost",
    compression: false,
    routes: { files: { relativeTo: Path.join(__dirname, "client") } },
  });

  await server.register(StaticFilePlugin);
  await server.register(route);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
})();
