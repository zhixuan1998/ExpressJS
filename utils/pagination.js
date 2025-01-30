
function generatePagination({ page, limit, count, totalCount }) {
    const pagination = {
        currentPage: page,
        itemFrom: 0,
        itemTo: 0,
        isLastPage: true
    }

    if (count === 0) {
        return pagination;
    }

    const offset = (page - 1) * limit;
    const from = offset + 1;

    pagination.itemFrom = from;
    pagination.itemTo = from + (limit > count ? count : limit) - 1;
    pagination.isLastPage = count <= limit;

    if (totalCount !== undefined) {
        pagination.totalItems = totalCount;
    }

    return pagination;
}

module.exports = generatePagination;