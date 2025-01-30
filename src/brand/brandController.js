const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { Brand } = require("../../aggregate");

const controller = ({ config, brandRepository, followRepository }) => {
    return {
        async getBrands(req, res) {
            try {
                const user = req.httpContext?.user;

                const userId = user?.id;

                const { brandIds } = req.query;

                const [brandsError, brands] = await brandRepository.getAll({ userId, brandIds });

                if (brandsError)
                    throw brandsError;

                let response = brands ? brands.map((r) => {
                    const brand = new Brand(r);
                    const brandId = brand.getId();

                    const { baseUrl } = config.storage;
                    const { logoPath } = config.brand;

                    const logoUrl = new URL(logoPath.replace("{brandId}", brandId), baseUrl).href;

                    return {
                        brandId,
                        name: brand.name,
                        logoUrl,
                        productCount: r.productCount ?? 0,
                        followerCount: r.followerCount ?? 0,
                        isFollowed: r.isFollowed,
                        rating: {
                            average: r.rating.average ? parseFloat(r.rating.average.toFixed(1)) : 0,
                            totalCount: r.rating.totalCount
                        },
                        createdAt: brand.getCreatedAt(),
                    };
                }) : [];

                return res.status(200).send(generateSuccessResponse(response));
            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async getUserFollowed(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const [brandsError, brands] = await brandRepository.getUserFollowed(userId);

                if (brandsError)
                    throw brandsError;

                let response = brands ? brands.map((brand) => {
                    return {
                        brandId: brand.getId(),
                        name: brand.name
                    };
                }) : [];

                return res.status(200).send(generateSuccessResponse(response));
            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },


    };
};

module.exports = createController(controller)
    .prefix("/api")
    .get("/users/brands", "getBrands")
    .get("/users/followedBrands", "getUserFollowedBrands");
