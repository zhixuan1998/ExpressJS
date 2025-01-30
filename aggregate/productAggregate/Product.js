const { ObjectId } = require("mongodb");
const config = require("../../appsettings");
const imageSizeEnum = require("../../enum/imageSize");

const { baseUrl } = config.storage;
const { logoPath, imagePath } = config.product;

module.exports = class Product {
    constructor ({
        name,
        imageIds,
        quantity,
        unitPrice,
        description = null,
        brandId,
        categoryIds = [],
        isEnable = true,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id
    }) {
        this.name = name;
        this.imageIds = imageIds;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.description = description;
        this.brandId = brandId;
        this.categoryIds = categoryIds;
        this.isEnable = isEnable;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id;
    }

    getId() {
        return this._id?.toString();
    }

    getBrandId() {
        return this.brandId?.toString();
    }

    getCategoryIds() {
        return this.categoryIds.map((categoryId) => categoryId.toString());
    }

    getImageUrl(imageId, isLarge = false) {
        const path = imagePath
            .replace("{productId}", this._id)
            .replace("{imageId}", imageId)
            .replace("{size}", isLarge ? imageSizeEnum.LARGE : imageSizeEnum.SMALL);

        return this.imageIds.find(objectId => objectId.toString() === imageId)
            ? new URL(path, baseUrl).href
            : null;
    }

    getLogoUrl() {
        return new URL(logoPath.replace("{productId}", this._id), baseUrl).href;
    }
};
