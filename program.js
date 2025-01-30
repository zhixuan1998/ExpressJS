require("dotenv-flow").config();

const http = require("http");
const debug = require("debug");
const config = require("./appsettings.js");

async function main() {
    try {
        const app = await require("./startup.js")(config);

        http.createServer(app).listen(config.port, () => {
            console.log(`Listening port: ${config.port}`);
            debug(`Listening port: ${config.port}`);
        });
    } catch (e) {
        console.error(e);
        debug("ERROR", e);
    }
}

main();
