const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");

const controller = ({
    config,
    productRepository,
    // wishlistRepository,

    listingCommonFunction
}) => {
    return {
        async getProduct(req, res) {
            try {
                const { productId } = req.params;

                const [productError, product] = await productRepository.get({ productId });

                if (productError) throw productError;

                if (!product) return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("Product not found")));

                const images = product.imageIds.map(objectId => {
                    const imageId = objectId.toString();

                    return {
                        imageId,
                        smallImageUrl: product.getImageUrl(imageId),
                        largeImageUrl: product.getImageUrl(imageId, true)
                    };
                });

                const response = {
                    productId: product.getId(),
                    brandId: product.getBrandId(),
                    categoryIds: product.getCategoryIds(),
                    name: product.name,
                    quantity: product.quantity,
                    unitPrice: parseFloat(product.unitPrice),
                    description: product.description,
                    logoUrl: product.getLogoUrl(),
                    images
                };

                return res.status(200).send(generateSuccessResponse(response));

            } catch (err) {
                console.log(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async getProducts(req, res) {
            try {
                let {
                    search,
                    categoryIds = [],
                    brandIds = [],
                    isWishlist,
                    limit,
                    page
                } = req.body;

                search = decodeURI(search);

                const user = req.httpContext?.user;

                if (isWishlist === true && !user)
                    return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                let productIds = [];

                // if (isWishlist === true) {
                //     const [wishlistsError, wishlists] = await wishlistRepository.getAll(userId);

                //     if (wishlistsError)
                //         throw wishlistsError;

                //     if (wishlists) {
                //         productIds.concat(wishlists.map(r => r.getProductId()));
                //     }
                // }

                const filterData = {
                    search,
                    productIds,
                    categoryIds,
                    brandIds
                };

                const [productAndPaginationError, productAndPagination] = await listingCommonFunction.getListingAndPagination({
                    listingFunction: productRepository.getAll,
                    countFunction: productRepository.getCount,
                    limit,
                    page,
                    filterData
                });

                if (productAndPaginationError) throw productAndPaginationError;

                const { listing: products, pagination } = productAndPagination;

                const response = products ? products.map((r) => {
                    const productId = r.getId();

                    return {
                        productId,
                        logoUrl: r.getLogoUrl(),
                        name: r.name,
                        description: r.description,
                        unitPrice: parseFloat(r.unitPrice),
                        quantity: r.quantity,
                        brandId: r.getBrandId(),
                        categoryIds: r.getCategoryIds()
                    };
                }) : [];

                return res.status(200).send(generateSuccessResponse(response, pagination));
            } catch (err) {
                console.log(err);
                return res.status(500).send(generateErrorResponse());
            }
        }
    };
};

module.exports = createController(controller)
    .prefix("/api")
    .post("/users/products", "getProducts")
    .get("/users/products/:productId/detail", "getProduct");
