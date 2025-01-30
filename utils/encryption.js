const crypto = require("crypto");

function encrypt(message, key, iv) {
    let cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
    let encrypted = cipher.update(message, "utf-8", "hex");
    return encrypted + cipher.final("hex");
}

function decrypt(message, key, iv) {
    let decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
    let decrypted = decipher.update(message, "hex", "utf-8");
    return decrypted + decipher.final("utf-8");
}

function hash(message, algorithm = "sha256") {
    return crypto.createHash(algorithm).update(message).digest("hex");
}

module.exports = {
    encrypt,
    decrypt,
    hash
};
