module.exports = {
    // General
    general: () => ({ code: 9999, message: "Internal server error." }),
    recordNotFound: (message = "Record not found.") => ({ code: 1001, message }),
    forbidden: () => ({ code: 1002, message: "Forbidden error." }),
    unauthorized: () => ({ code: 1003, message: "Unauthorized error." }),

    // Auth
    tokenExpired: () => ({ code: 1100, message: "Token expired." }),
    refreshTokenNotFound: () => ({ code: 1101, message: "Refresh token not found." }),
    fingerprintMismatch: () => ({ code: 1102, message: "Fingerprint mismatch." }),

    // TODO: different error message for different firebase error
    invalidFirebaseAccessToken: (firebaseError) => ({ code: 1103, message: "Invalid firebase access token." }),

    // rating
    referenceIdNotProvided: () => ({ code: 1200, message: "ReferenceId must be provided." }),

    // cart
    itemNotExists: () => ({ code: 1300, message: "Item not exists in cart." }),
    invalidBrandProducts: () => ({ code: 1301, message: "Invalid brand's product(s)." }),
};
