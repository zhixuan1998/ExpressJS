const jwt = require("jsonwebtoken");
const { generateErrorResponse } = require("../utils/responseParser");
const errorMessages = require("../errorMessages");
const config = require("../appsettings");

const { verify, TokenExpiredError } = jwt;

module.exports = async (req, res, next) => {
    try {
        // await new Promise((resolve) => setTimeout(() => resolve(), 1000));

        const authToken = req.headers["authorization"];

        const [authType, token] = authToken?.split(" ") ?? [];

        if (req.path === "/api/users/token" || authType !== "Bearer") {
            return next();
        }

        if (!token) return res.status(401).send(generateErrorResponse(errorMessages.unauthorized()));

        verify(token, config.security.accessTokenSecret, (err, payload) => {
            if (err instanceof TokenExpiredError)
                return res.status(401).send(generateErrorResponse(errorMessages.tokenExpired()));

            // if (payload.fingerprint !== req.cookies.fingerprint) {
            //     return res
            //         .status(401)
            //         .clearCookie("refreshToken")
            //         .clearCookie("fingerprint")
            //         .send(generateErrorResponse(errorMessages.fingerprintMismatch()));
            // }

            const user = {
                id: payload.id,
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                dob: payload.dob
            };

            req.httpContext = { ...req.httpContext, user };

            next();
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
    }
};
