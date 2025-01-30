const { ObjectId } = require("mongodb");

module.exports = class OrderDetail {
    constructor({
        userId,
        orderId,
        orderNumber,
        productId,
        productName,
        quantity,
        unitPrice,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id = null,
    }) {
        this.userId = userId;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
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

    totalPrice() {
        return this.unitPrice * this.quantity;
    }
} 