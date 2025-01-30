const { ObjectId } = require('mongodb');
const { User } = require("../aggregate");

module.exports = ({
    collections: {
        users
    }
}) => {
    return {
        async createUser(user) {
            const userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                dob: user.dob,
                email: user.email,
                phoneCode: user.phoneCode,
                phoneNumber: user.phoneNumber,
                lastLogin: user.lastLogin,
                isActivated: user.isActivated,
                isEnable: user.isEnable,
                createdAt: user.createdAt,
                createdBy: user.createdBy,
                modifiedAt: user.modifiedAt,
                modifiedBy: user.modifiedBy
            }

            try {
                const result = await users.insertOne(userData);

                const insertedId = result.insertedId;

                const insertedResult = await users.findOne({ _id: insertedId });

                return [null, new User(insertedResult)];

            } catch (error) {
                return [error];
            }
        },

        async get(userId) {
            try {
                const result = await users.findOne({
                    _id: new ObjectId(userId),
                    isEnable: true
                });

                return [null, result ? new User(result) : null];

            } catch (error) {
                return [error];
            }
        },

        async getByPhone(phoneCode, phoneNumber) {
            try {
                const result = await users.findOne({
                    phoneCode,
                    phoneNumber,
                    isEnable: true
                });

                return [null, result ? new User(result) : null];

            } catch (error) {
                return [error];
            }
        },

        async updateUser(userId, user) {
            try {
                const result = await users.updateOne(
                    {
                        _id: new ObjectId(userId),
                        isEnable: true
                    },
                    {
                        $set: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            gender: user.gender,
                            modifiedAt: new Date(),
                            modifiedBy: new ObjectId(userId)
                        }
                    }
                );

                return [null, result.modifiedCount ? true : false];

            } catch (error) {
                return [error];
            }
        },

        async login(userId) {
            try {
                const date = new Date();

                const result = await users.updateOne({
                    _id: new ObjectId(userId),
                    isEnable: true
                }, {
                    $set: {
                        lastLogin: date,
                        modifiedAt: date,
                        modifiedBy: new ObjectId("000000000000000000000000")
                    }
                })

                return [null, result.modifiedCount ? true : false]
            } catch (error) {
                return [error];
            }
        }
    }
}
