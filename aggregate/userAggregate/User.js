const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { hash } = require("../../utils/encryption");

module.exports = class User {
    constructor({
        firstName,
        lastName = null,
        gender = null,
        dob,
        email,
        phoneCode = null,
        phoneNumber,
        lastLogin = null,
        isActivated = false,
        isEnable = true,
        createdAt = new Date(),
        createdBy = "000000000000000000000000",
        modifiedAt = new Date(),
        modifiedBy = "000000000000000000000000",
        _id = null
    }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.dob = dob;
        this.email = email;
        this.phoneCode = phoneCode;
        this.phoneNumber = phoneNumber;
        this.lastLogin = lastLogin;
        this.isActivated = isActivated;
        this.isEnable = isEnable;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.modifiedAt = modifiedAt;
        this.modifiedBy = modifiedBy;
        this._id = _id;
    }

    getId() {
        return this._id?.toString() ?? null;
    }

    getFullName() {
        return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
    }

    /**
     * Generates a JSON Web Token (JWT) for user authentication.
     * @param {string} secret - The secret key for signing the token.
     * @param {number} durationInHour - The duration of the token validity in hours.
     * @returns {Object} An object containing the access token, the expiration date of the token, and a fingerprint generated from the user's ID and the current timestamp.
     */
    generateToken(secret, durationInHour) {
        const fingerprint = hash(`${this.getId()}.${Date.now()}`);

        const payload = {
            id: this.getId(),
            firstName: this.firstName,
            lastName: this.lastName,
            dob: new Date(this.dob).toISOString(),
            email: this.email,
            fingerprint
        };

        const accessTokenExpiredAt = new Date(Date.now() + durationInHour * 60 * 60 * 1000);
        const accessToken = jwt.sign(payload, secret, { expiresIn: `${durationInHour}h` });

        return { accessToken, accessTokenExpiredAt, fingerprint };
    }
};
