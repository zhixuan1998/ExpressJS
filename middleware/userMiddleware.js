const errorMessages = require("../errorMessages");
const { generateErrorResponse } = require("../utils/responseParser");

module.exports = async (req, res, next) => {

    try {
        const user = req.httpContext?.user;

        if (!user) next();
    
        const [userProfileError, userProfile] = [];
    
        if (userProfileError)
            throw userProfileError;

        if (!userProfile)
            return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));
    
        next();
    } catch (err) {
        // console.log(err)
        return res.status(500).send(generateErrorResponse());
    }
    
}