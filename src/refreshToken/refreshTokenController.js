const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");

const controller = ({ userCommonFunction }) => {
    return {
        async regenerateToken(req, res) {
            try {
                const [newAccessTokenError, newAccessToken] = await userCommonFunction.handleToken({ req, res });

                if (newAccessTokenError)
                    throw newAccessTokenError;

                let response = { accessToken: newAccessToken };

                return res.status(200).send(generateSuccessResponse(response));
            } catch (err) {
                console.error(err);
                return res.status(500).clearCookie("refreshToken").clearCookie("fingerprint").send(generateErrorResponse());
            }
        }
    };
};

module.exports = createController(controller)
    .prefix("/api")
    .post("/users/token", "regenerateToken");
