const { ObjectId } = require("mongodb");
const { Rating } = require("../aggregate");

module.exports = ({ collections: { ratings } }) => {
  return {
    async add(rating) {
      const ratingData = {
        userId: new ObjectId(rating.userId),
        type: rating.type,
        referenceId: new ObjectId(rating.referenceId),
        rate: rating.rate,
        isEdited: rating.isEdited,
        isDeleted: rating.isDeleted,
        createdAt: rating.createdAt,
        createdBy: rating.createdBy,
        modifiedAt: rating.modifiedAt,
        modifiedBy: rating.modifiedBy
      };

      try {
        const result = await ratings.insertOne(ratingData);

        const insertedId = result.insertedId;

        const insertedResult = await ratings.findOne({ _id: insertedId });

        return [null, new Rating(insertedResult)];

      } catch (error) {
        return [error];
      }
    },

    async getAll({
      type,
      referenceId,
      rate,
      sortBy,
      sortDirection
    }) {
      try {

      } catch (error) {
        return [error];
      }
    },

    async updateMedias(userId, ratingId, medias) {
      const mediasData = medias.map(m => ({
        type: m.type,
        mediaId: new ObjectId(m.mediaId)
      }));

      try {
        const result = await ratings.updateOne(
          {
            _id: new ObjectId(ratingId),
            isDeleted: false
          },
          {
            $set: {
              medias: mediasData,
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          }
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    },

    async delete({ userId, type, referenceId }) {
      try {
        const result = await ratings.updateOne(
          {
            userId: new ObjectId(userId),
            referenceId: new ObjectId(referenceId),
            type,
            isDeleted: false
          },
          {
            $set: {
              isDeleted: true,
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          }
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    }
  };
};