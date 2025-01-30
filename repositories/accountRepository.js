const { ObjectId } = require('mongodb');
const { Account } = require("../aggregate");

module.exports = ({
    collections: {
        accounts,
        brands,
        products,
    }
}) => {
    return {
        async createAccount(account) {
            const userData = {
                userId: new ObjectId(account.userId),
                accType: account.accType,
                email: account.email,
                password: account.password,
                isDeleted: account.isDeleted,
                createdAt: account.createdAt,
                createdBy: account.createdBy,
                modifiedAt: account.modifiedAt,
                modifiedBy: account.modifiedBy
            }

            try {
                const result = await accounts.insertOne(userData);

                const insertedId = result.insertedId;

                const insertedResult = await accounts.findOne({ _id: insertedId });

                return [null, new Account(insertedResult)];

            } catch (error) {
                return [error];
            }
        },

        async get({ email, firebaseUid }) {
            try {
                let query = {
                    isDeleted: false
                };

                if (email) {
                    query.email = email;
                }

                if (firebaseUid) {
                    query.firebaseUid = firebaseUid;
                }

                const result = await accounts.findOne(query);

                return [null, result ? new Account(result) : null];
            } catch (error) {
                return [error];
            }
        },

        async deleteAccounts(userId) {
            try {
                const result = await accounts.updateMany(
                    {
                        _id: userId,
                        isDeleted: false,
                    },
                    {
                        $set: {
                            modifiedAt: new Date(),
                            modifiedBy: new ObjectId(userId),
                            isDeleted: true
                        }
                    }
                )

                return [null, result.modifiedCount ? true : false];
            } catch (error) {
                return [error];
            }
        },

    }
}
