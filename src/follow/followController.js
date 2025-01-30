const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { Follow } = require("../../aggregate");

const controller = ({
    config,
    followRepository
}) => {

    return {
        async createFollow(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const { brandId } = req.body;

                const [existingFollowError, existingFollow] = await followRepository.get(userId, brandId);

                if (existingFollowError)
                    throw existingFollowError;

                if (existingFollow)
                    return res.status(400).send(generateErrorResponse());

                const followData = new Follow({
                    userId,
                    brandId
                });

                const [addFollowError] = await followRepository.add(userId, followData);

                if (addFollowError)
                    throw addFollowError;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async deleteFollow(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const { brandId } = req.params;
                console.log(userId, brandId)

                const [followError, follow] = await followRepository.get(userId, brandId);

                if (followError)
                    throw followError;

                if (!follow)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("Follow not found.")));

                const [deleteFollowError] = await followRepository.delete(userId, brandId);

                if (deleteFollowError)
                    throw deleteFollowError;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        }


    }
}

module.exports = createController(controller)
    .prefix("/api")
    .post("/users/follows", "createFollow")
    .delete("/users/follows/brands/:brandId", "deleteFollow")