const { ObjectId } = require("mongodb");
const { Product } = require("../aggregate");
const sortDirectionEnum = require("../enum/sortDirection");
const productSortByEnum = require("../enum/productSortBy");

module.exports = ({ collections: { products } }) => {

    function getInitQuery({
        search,
        productIds,
        categoryIds,
        brandIds,
    }) {
        let query = {
            isEnable: true,
            isDeleted: false
        };

        if (search) {
            query.name = { $regex: "^" + search, $options: "i" };
        }

        if (productIds?.length) {
            query._id = { $in: productIds.map((id) => new ObjectId(id)) };
        }

        if (categoryIds?.length) {
            query.categoryIds = { $in: categoryIds.map((id) => new ObjectId(id)) };
        }

        if (brandIds?.length) {
            query.brandId = { $in: brandIds.map((id) => new ObjectId(id)) };
        }

        return query;
    }

    return {
        async get({ brandId, productId }) {
            let query = {
                _id: new ObjectId(productId),
                isEnable: true,
                isDeleted: false
            }

            if (brandId) [
                query.brandId = new ObjectId(brandId)
            ]

            try {
                const result = await products.findOne(query);

                return [null, result ? new Product(result) : null];

            } catch (error) {
                return [error];
            }
        },

        async getAll({
            search,
            productIds,
            categoryIds,
            brandIds,
            limit,
            skip,
            sortBy = productSortByEnum.NAME,
            sortDirection = sortDirectionEnum.ASC
        }) {

            try {
                const initQuery = getInitQuery({
                    search,
                    productIds,
                    categoryIds,
                    brandIds
                });

                const beforeResult = products
                    .aggregate([{ $match: initQuery }])
                    .sort({ [sortBy]: sortDirection });

                if (typeof skip == "number") {
                    beforeResult.skip(skip);
                }

                if (typeof limit == "number") {
                    beforeResult.limit(limit);
                }

                const result = await beforeResult.toArray();

                return [null, result.length ? result.map((r) => new Product(r)) : null];

            } catch (error) {
                return [error];
            }
        },

        async getCount({
            search,
            productIds,
            categoryIds,
            brandIds
        }) {
            try {
                const initQuery = getInitQuery({
                    search,
                    productIds,
                    categoryIds,
                    brandIds
                });

                const result = await products.aggregate([
                    { $match: initQuery },
                    { $count: "count" }
                ]).toArray();

                return [null, result[0]?.count ?? 0];

            } catch (error) {
                return [error];
            }
        }
    };
};
