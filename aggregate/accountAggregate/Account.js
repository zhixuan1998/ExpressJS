const { ObjectId } = require("mongodb");
const accountTypeEnum = require("../../enum/accountType");
const { encrypt } = require("../../utils/encryption");

module.exports = class Account {
    constructor({
        userId,
        accType = accountTypeEnum.NORMAL,
        firebaseUid = null,
        email,
        password = null,
        isDeleted = false,
        createdAt = new Date(),
        createdBy = new ObjectId("000000000000000000000000"),
        modifiedAt = new Date(),
        modifiedBy = new ObjectId("000000000000000000000000"),
        _id = null
    }) {
        if (!Object.values(accountTypeEnum).includes(accType)) throw new Error("Invalid account type.");

        this.userId = userId;
        this.accType = accType;
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.password = password;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id;
    }

    getUserId() {
        return this.userId?.toString() ?? null;
    }

    verifyAuthentication(password, { key, iv }) {
        const encrypted = encrypt(password, key, iv);
        return encrypted === this.password;
    }
};
