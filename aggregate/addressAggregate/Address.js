const { ObjectId } = require("mongodb");

module.exports = class Address {
    constructor({
        userId,
        title,
        address1,
        address2 = null,
        postcode,
        isDefault = false,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id = null
    }) {
        this.userId = userId;
        this.title = title;
        this.address1 = address1;
        this.address2 = address2;
        this.postcode = postcode;
        this.isDefault = isDefault;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id;
    }

    getId() {
        return this?._id.toString() ?? null;
    }

    getUserId() {
        return this?.userId.toString() ?? null;
    }
}