const generatePagination = require("../../utils/pagination");

module.exports = ({
    config
}) => {
    return {
        async getListingAndPagination({ listingFunction, countFunction, limit = 10, page = 1, filterData = {} }) {
            try {
                const obj = {
                    listing: null,
                    pagination: null
                }

                if (typeof listingFunction !== "function")
                    return [null, obj];

                limit = limit <= 0 ? 10 : limit;
                page = page <= 0 ? 1 : page;

                const listingFilterData = {
                    ...filterData,
                    limit: limit + 1,
                    skip: limit * (page - 1)
                }

                const [listingError, listing] = await listingFunction(listingFilterData);

                if (listingError)
                    throw listingError;

                const count = listing?.length ?? 0;

                const { sortBy, sortDirection, ...countFilterData } = filterData;

                const [totalCountError, totalCount] = typeof countFunction == "function" ? await countFunction(countFilterData) : [null, null];

                if (totalCountError)
                    throw totalCountError;

                if (page && limit) {
                    obj.pagination = generatePagination({ page, limit, count, totalCount });
                }

                obj.listing = count > limit ? listing.slice(0, -1) : listing;

                return [null, obj];

            } catch (error) {
                return [error];
            }
        }
    }
}