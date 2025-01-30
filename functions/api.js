require("dotenv-flow").config();

const http = require("http");
const debug = require("debug");
const config = require("../appsettings.js");
const serverless = require("serverless-http");

// async function main() {
//     try {
//         const app = await require("../startup.js")(config);

//         http.createServer(app).listen(config.port, () => {
//             console.log(`Listening port: ${config.port}`);
//             debug(`Listening port: ${config.port}`);
//         });
//     } catch (e) {
//         console.error(e);
//         debug("ERROR", e);
//     }
// }

// main();

module.exports.handler = async function () {
    const app = await require("../startup.js")(config);
    return app;
};
