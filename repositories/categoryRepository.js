const { ObjectId } = require('mongodb');
const { Category } = require("../aggregate");

module.exports = ({
    collections: {
        categories,
    }
}) => {
    return {
        async getAll({ categoryIds }) {
            try {
                let query = {
                    isEnable: true,
                    isDeleted: false
                }

                if (categoryIds?.length) {
                    query._id = { $in: categoryIds.map(id => new ObjectId(id)) };
                }

                const result = await categories.find(query).toArray();

                return [null, result.length ? result.map(r => new Category(r)) : null];

            } catch (error) {
                return [error];
            }
        },
    }
}