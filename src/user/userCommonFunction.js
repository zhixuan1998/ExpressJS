const { generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { RefreshToken } = require("../../aggregate");


module.exports = ({
    config,
    userRepository,
    refreshTokenRepository
}) => {
    return {
        async handleToken({ req, res, userProfile = null, ignoreRefreshTokenNotFound = true }) {
            try {
                const oldRefreshToken = req.cookies?.refreshToken;

                if (oldRefreshToken) {
                    const [deleteRefreshTokenError, deleteRefreshToken] = await refreshTokenRepository.deleteRefreshToken(oldRefreshToken);

                    if (deleteRefreshTokenError) throw deleteRefreshTokenError;

                    if (!ignoreRefreshTokenNotFound && !deleteRefreshToken)
                        return res.status(400).clearCookie("refreshToken").clearCookie("fingerprint").send(generateErrorResponse(errorMessages.refreshTokenNotFound()));

                    if (!userProfile) {
                        let userProfileError = null;

                        [userProfileError, userProfile] = await userRepository.get(deleteRefreshToken.getUserId());

                        if (userProfileError)
                            throw userProfileError;
                    }
                }

                const userId = userProfile.getId();

                const { accessTokenSecret, accessTokenDurationInHour } = config.security;

                const { accessToken, accessTokenExpiredAt, fingerprint } = userProfile.generateToken(
                    accessTokenSecret,
                    accessTokenDurationInHour
                );

                const refreshTokenData = new RefreshToken({ userId: userId });

                const [newRefreshTokenError, newRefreshToken] = await refreshTokenRepository.createRefreshToken(refreshTokenData);

                if (newRefreshTokenError) throw newRefreshTokenError;

                const cookieConfig = {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                }

                res
                    .cookie("refreshToken", newRefreshToken.token, { ...cookieConfig, expires: newRefreshToken.expiredAt })
                    .cookie("fingerprint", fingerprint, { ...cookieConfig, expires: accessTokenExpiredAt });

                return [null, accessToken];

            } catch (error) {
                return [error];
            }
        }
    }
}