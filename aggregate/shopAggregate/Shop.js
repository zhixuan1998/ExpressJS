const { ObjectId } = require("mongodb");

module.exports = class Shop {
    constructor({
        name,
        ownerUserId,
        logo = null,
        isActive = true,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id
    }) {
        this.name = name;
        this.ownerUserId = ownerUserId;
        this.logo = logo;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt =  modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id
    }

    getId() {
        return this._id?.toString() ?? null;
    }

    getOwnerUserId() {
        return this.ownerUserId?.toString() ?? null;
    }
}