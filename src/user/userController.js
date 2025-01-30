const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const { User, Account } = require("../../aggregate");
const errorMessages = require("../../errorMessages");
const { encrypt, hash } = require("../../utils/encryption");
const { auth, verifyIdToken } = require("../../utils/firebase");
const accountTypeEnum = require("../../enum/accountType");

const controller = ({ config, userRepository, accountRepository, userCommonFunction }) => {
    async function createUserAndAccount({
        firstName,
        lastName,
        dob,
        email,
        phoneCode,
        phoneNumber,
        password,
        firebaseUid = null,
        provider
    }) {
        try {
            const userData = new User({
                firstName,
                lastName,
                dob: dob ? new Date(dob) : null,
                email,
                phoneCode,
                phoneNumber
            });

            const [createUserError, createUser] = await userRepository.createUser(userData);

            if (createUserError) throw createUserError;

            const { key, iv } = config.security.encryption;

            const encrypted = password ? encrypt(decodedPassword, key, iv) : null;

            const accountData = new Account({
                userId: createUser.getId(),
                email,
                password: encrypted,
                firebaseUid,
                accType: Object.values(accountTypeEnum).includes(provider) ? provider : accountTypeEnum.NORMAL
            });

            const [createAccountError, createAccount] = await accountRepository.createAccount(accountData);

            if (createAccountError) throw createAccountError;

            const createdObj = {
                userProfile: createUser,
                account: createAccount
            };

            return [null, createdObj];

        } catch (error) {
            return [error];
        }
    }

    return {
        async getUser(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const [userProfileError, userProfile] = await userRepository.get(userId);

                if (userProfileError) throw userProfileError;

                if (!userProfile)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));

                let response = {
                    userId: userProfile.getId(),
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    gender: userProfile.gender,
                    dob: userProfile.dob?.toISOString() ?? null,
                    email: userProfile.email,
                    phoneCode: userProfile.phoneCode,
                    phoneNumber: userProfile.phoneNumber,
                    isActivated: userProfile.isActivated
                };

                return res.status(200).send(generateSuccessResponse(response));

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse(err));
            }
        },

        async login(req, res) {
            try {
                const { email, password } = req.body;

                const [accountError, account] = await accountRepository.get({ email });

                if (accountError) throw accountError;

                if (!account)
                    return res
                        .status(404)
                        .send(generateErrorResponse(errorMessages.recordNotFound("Account not found.")));

                const decodedPassword = atob(password);

                if (!account.verifyAuthentication(decodedPassword, config.security.encryption))
                    return res.status(400).send(generateErrorResponse());

                const userId = account.getUserId();

                const [userProfileError, userProfile] = await userRepository.get(userId);

                if (userProfileError) throw userProfileError;

                if (!userProfile)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));

                const [loginError, login] = await userRepository.login(userId);

                if (loginError) throw loginError;

                const [newAccessTokenError, newAccessToken] = await userCommonFunction.handleToken({
                    req,
                    res,
                    userProfile,
                    ignoreRefreshTokenNotFound: true
                });

                if (newAccessTokenError) throw newAccessTokenError;

                let response = { accessToken: newAccessToken };

                return res.status(200).send(generateSuccessResponse(response));

            } catch (err) {
                console.error(err);
                return res.status(500).clearCookie("refreshToken").clearCookie("fingerprint").send(generateErrorResponse());
            }
        },

        async register(req, res) {
            try {
                const { firstName, lastName, dob, email, password, phoneCode, phoneNumber } = req.body;

                const [existingAccountError, existingAccount] = await accountRepository.get({ email });

                if (existingAccountError) throw existingAccountError;

                if (existingAccount) return res.status(400).send(generateErrorResponse());

                const [existingUsersError, existingUsers] = await userRepository.getByPhone(phoneCode, phoneNumber);

                if (existingUsersError) throw existingUsersError;

                if (existingUsers) return res.status(400).send(generateErrorResponse());

                const decodedPassword = atob(password);

                const { key, iv } = config.security.encryption;

                const encrypted = encrypt(decodedPassword, key, iv);

                const userData = new User({
                    firstName,
                    lastName,
                    dob: new Date(dob),
                    email,
                    phoneCode,
                    phoneNumber
                });

                const [createUserError, createUser] = await userRepository.createUser(userData);

                if (createUserError) throw createUserError;

                const accountData = new Account({
                    userId: createUser.getId(),
                    email,
                    password: encrypted
                });

                const [createAccountError, createAccount] = await accountRepository.createAccount(accountData);

                if (createAccountError) throw createAccountError;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async socialLogin(req, res) {
            try {
                const { accessToken, provider } = req.body;

                let firebaseUser = null;

                try {
                    firebaseUser = await verifyIdToken(accessToken);
                } catch (error) {
                    return res.status(400).send(generateErrorResponse(errorMessages.invalidFirebaseAccessToken(error?.errorInfo.code)));
                }

                if (!firebaseUser)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("Firebase user not found.")));

                const { name: firstName, email, uid: firebaseUid } = firebaseUser;

                let [accountError, account] = await accountRepository.get({ firebaseUid });

                if (accountError)
                    throw accountError;

                let userProfile = null;
                let userProfileError = null;

                if (account) {
                    [userProfileError, userProfile] = await userRepository.get(account.getUserId());

                    if (userProfileError)
                        throw userProfileError;

                    if (!userProfile)
                        return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));
                } else {
                    const [userAndAccountError, userAndAccount] = await createUserAndAccount({
                        firstName,
                        email,
                        // phoneNumber,
                        firebaseUid,
                        provider
                    });

                    if (userAndAccountError) throw userAndAccountError;

                    userProfile = userAndAccount.userProfile;
                    account = userAndAccount.account;
                }

                const [loginError, login] = await userRepository.login(userProfile.getId());

                if (loginError)
                    throw loginError;

                const [newAccessTokenError, newAccessToken] = await userCommonFunction.handleToken({
                    req,
                    res,
                    userProfile,
                    ignoreRefreshTokenNotFound: true
                });

                if (newAccessTokenError)
                    throw newAccessTokenError;

                let response = { accessToken: newAccessToken };

                return res.status(200).send(generateSuccessResponse(response));

            } catch (err) {
                console.error(err);
                return res.status(500).clearCookie("refreshToken").clearCookie("fingerprint").send(generateErrorResponse());
            }
        },

        async updateUser(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const [userProfileError, userProfile] = await userRepository.get(userId);

                if (userProfileError) throw userProfileError;

                if (userProfile)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));

                const [updateUserError, updateUser] = await userRepository.updateUser(userId, req.body);

                if (updateUserError) throw updateUserError;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async disableUser(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const [userProfileError, userProfile] = await userRepository.get(userId);

                if (userProfileError) throw userProfileError;

                if (!userProfile)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));

                // TODO: check incomplete order

                const [disableUserError, disableUser] = await userRepository.disableUser(userId);

                if (disableUserError) throw disableUserError;

                const [deleteAccountsError, deleteAccounts] = await accountRepository.deleteAccounts(userId);

                if (deleteAccountsError) throw deleteAccountsError;

                return res.status(200).send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        },

        async logout(req, res) {
            try {
                const user = req.httpContext.user;

                if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

                const userId = user.id;

                const [userProfileError, userProfile] = await userRepository.get(userId);

                if (userProfileError) throw userProfileError;

                if (!userProfile)
                    return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("User not found.")));

                return res.status(200)
                    .clearCookie("refreshToken")
                    .clearCookie("fingerprint")
                    .send(generateSuccessResponse());

            } catch (err) {
                console.error(err);
                return res.status(500).send(generateErrorResponse());
            }
        }
    };
};

module.exports = createController(controller)
    .prefix("/api")
    .get("/users", "getUser")
    .put("/users", "updateUser")
    .post("/users/login", "login")
    .post("/users/logout", "logout")
    .post("/users/register", "register")
    .delete("/users/disable", "disableUser")
    .post("/users/socialLogin", "socialLogin");
