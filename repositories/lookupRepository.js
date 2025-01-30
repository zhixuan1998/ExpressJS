const { ObjectId } = require("mongodb");

module.exports = ({ collections: { phoneCodes } }) => {
    return {
        async getCountryPhoneCodes() {
            try {
                const result = await phoneCodes.find().toArray();

                return [null, result.length ? result : null];
            } catch (error) {
                return [error];
            }
        }
    };
};
