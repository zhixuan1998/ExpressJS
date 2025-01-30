const { ObjectId } = require("mongodb");
const orderStatusEnum = require("../../enum/orderStatus");

module.exports = class Order {
    constructor({
        userId,
        orderNumber,
        orderStatus = orderStatusEnum.PENDING,
        totalAmount = 0,
        paidAmount = 0,
        paidAt = null,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id = null,
    }) {
        this.userId = userId;
        this.orderNumber = orderNumber;
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.paidAt = paidAt;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id;
    }

    getId() {
        return this._id?.toString() ?? null;
    }
}