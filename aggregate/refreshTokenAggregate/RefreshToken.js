const { ObjectId } = require("mongodb");
const crypto = require("crypto");

const oneYearInMs = 1 * 365 * 24 * 60 * 60 * 1000;

module.exports = class RefreshToken {
    constructor({
        userId,
        token,
        expiredAt,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000")
    }) {
        this.userId = userId;
        this.token = token ?? crypto.randomUUID();
        this.expiredAt = expiredAt ?? new Date(Date.now() + oneYearInMs);
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
    }

    getUserId() {
        return this.userId?.toString() ?? null;
    }
};
