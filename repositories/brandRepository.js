const { ObjectId } = require("mongodb");
const { Brand } = require("../aggregate");
const ratingTypeEnum = require("../enum/ratingType");

module.exports = ({ collections: { brands, follows, products, ratings } }) => {
    return {
        async get({ brandId }) {
            try {
                const result = await brands.findOne({
                    _id: new ObjectId(brandId),
                    isEnable: true,
                    isDeleted: false
                });

                return [null, result ? new Brand(result) : null];

            } catch (error) {
                return [error];
            }

        },

        async getAll({ search, brandIds, userId }) {
            let initQuery = {
                isEnable: true,
                isDeleted: false
            };

            if (search) {
                initQuery.name = { $regex: "^" + search, $options: "i" };
            }

            if (brandIds?.length) {
                initQuery._id = { $in: brandIds.map((id) => new ObjectId(id)) };
            }

            let pipeline = [
                { $match: initQuery },
                {
                    $lookup: {
                        from: products.collectionName,
                        let: { brandId: "$_id" },
                        as: "products",
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$brandId", "$$brandId"] },
                                    isEnable: true,
                                    isDeleted: false
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: follows.collectionName,
                        let: { brandId: "$_id" },
                        as: "followers",
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$brandId", "$$brandId"] },
                                    isDeleted: false
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: ratings.collectionName,
                        let: { brandId: "$_id" },
                        as: "ratings",
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$referenceId", "$$brandId"] },
                                    type: ratingTypeEnum.BRAND,
                                    isDeleted: false
                                }
                            }
                        ]
                    }
                },

            ];

            const isFollowed = userId ? {
                $let: {
                    vars: {
                        follows: {
                            $filter: {
                                input: "$followers",
                                as: "follower",
                                cond: { $eq: ["$$follower.userId", { $toObjectId: userId }] },
                            }
                        }
                    },
                    in: { $gte: [{ $size: "$$follows" }, 1] }
                }
            } : false;

            pipeline.push(
                {
                    $addFields: {
                        productCount: { $size: "$products" },
                        followerCount: { $size: "$followers" },
                        isFollowed,
                        rating: {
                            average: { $avg: "$ratings.rate" },
                            totalCount: { $size: "$ratings" }
                        }
                    }
                },
                {
                    $project: {
                        products: 0,
                        followers: 0,
                        ratings: 0
                    }
                }
            );

            try {
                const result = await brands.aggregate(pipeline).toArray();

                return [null, result.length ? result : null];

            } catch (error) {
                return [error];
            }
        },

        async getUserFollowed(userId) {
            try {
                const result = await follows.aggregate([
                    {
                        $match: {
                            userId: new ObjectId(userId),
                            isDeleted: false
                        }
                    },
                    {
                        $lookup: {
                            from: brands.collectionName,
                            let: { brandId: "$brandId" },
                            as: "brands",
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$_id", "$$brandId"] },
                                        isEnable: true,
                                        isDeleted: false
                                    }
                                }
                            ]
                        }
                    },
                    { $match: { "brands.0": { $exists: true } } },
                    { $unwind: "$brands" },
                    { $sort: { createdAt: -1 } },
                    { $replaceRoot: { newRoot: "brands" } }
                ]).toArray();

                return [null, result.length ? result.map((r) => new Brand(r)) : null];
            } catch (error) {
                return [error];
            }
        }
    };
};
