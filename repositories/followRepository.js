const { ObjectId } = require('mongodb');
const { Follow } = require("../aggregate");

module.exports = ({
    collections: {
        brands,
        follows,
    }
}) => {
    return {
        async add(userId, follow) {
            const followData = {
                userId: new ObjectId(userId),
                type: follow.type,
                brandId: new ObjectId(follow.brandId),
                isDeleted: follow.isDeleted,
                createdAt: follow.createdAt,
                createdBy: new ObjectId(userId),
                modifiedAt: follow.modifiedAt,
                modifiedBy: new ObjectId(userId),
            };

            try {
                const result = await follows.insertOne(followData);

                const insertedId = result.insertedId;

                const insertedResult = await follows.findOne({ _id: insertedId });

                return [null, new Follow(insertedResult)];

            } catch (error) {
                return [error];
            }
        },

        async get(userId, brandId) {
            try {
                const result = await follows.findOne({
                    userId: new ObjectId(userId),
                    brandId: new ObjectId(brandId),
                    isDeleted: false
                });

                return [null, result ? new Follow(result) : null];

            } catch (error) {
                return [error];
            }
        },

        async delete(userId, brandId) {
            try {
                const date = new Date();

                const result = await follows.updateOne(
                    {
                        userId: new ObjectId(userId),
                        brandId: new ObjectId(brandId),
                        isDeleted: false
                    },
                    {
                        $set: {
                            isDeleted: true,
                            modifiedAt: date,
                            modifiedBy: new ObjectId(userId)
                        }
                    }
                );

                return [null, result.modifiedCount ? true : false];

            } catch (error) {
                return [error];
            }
        }
    };
};