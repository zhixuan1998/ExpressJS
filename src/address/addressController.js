const { createController } = require("awilix-express")
const { generateSuccessResponse, generateErrorResponse } = require('../../utils/responseParser');
const { Address } = require('../../aggregate');
const errorMessages = require('../../errorMessages');

const controller = ({
    config,
    userRepository
}) => {

    return {
        async createAddress(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        },

        async getUserAddresses(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;
                let { limit, page } = req.query;

                let response = {};
                let pagination = {};

                return res.status(200).send(generateSuccessResponse(response, pagination));

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        },

        async getUserAddress(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;
                const addressId = req.params.addressId;

                return res.status(200).send(generateSuccessResponse(response));

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        },

        async updateAddress(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;
                const addressId = req.params.addressId;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        },

        async deleteAddress(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;
                const addressId = req.params.addressId;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        }
    }
}

module.exports = createController(controller)
    .prefix('/api')
    .post('/user/addresses', 'createAddress')
    .get('/user/addresses', 'getUserAddresses')
    .get('/user/addresses/:addressId', 'getUserAddress')
    .put('/user/addresses/:addressId', 'updateAddress')
    .delete('/user/addresses/:addressId', 'deleteAddress')
