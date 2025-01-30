const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const winston = require("winston");
require("winston-mongodb").MongoDB;
const cookieParser = require("cookie-parser");
const expressWinston = require("express-winston");
const { loadControllers, scopePerRequest } = require("awilix-express");
const { container, setup } = require("./container");

module.exports = async (config) => {
    const logger = expressWinston.logger({
        transports: [
            // new winston.transports.Console(),
            new winston.transports.MongoDB({
                db: config.mongodb.log,
                level: "info",
                capped: true,
                cappedSize: 100000,
                options: { useUnifiedTopology: true }
            })
        ],
        metaField: "metadata",
        requestWhitelist: ["body", "headers", "query", "method", "url"],
        responseWhitelist: ["body", "headers", "statusCode", "error"]
    });

    await setup();

    var app = express();
    app.use(cors({ credentials: true, origin: true }));
    app.use(express.json());
    app.use(helmet());
    app.use(cookieParser());
    app.use(logger);
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        next();
    });

    // inject middlewares
    app.use(require("./middleware/jwtMiddleware"));
    // app.use(require("./middleware/userMiddleware"));

    app.use(scopePerRequest(container));
    app.use(loadControllers("src/*/*Controller.js", { cwd: __dirname }));

    return app;
};
