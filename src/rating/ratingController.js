const { createController } = require("awilix-express");
const { ObjectId } = require("mongodb");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { Rating } = require("../../aggregate");
const { uploadFile, deleteFile } = require("../../utils/firebase");
const ratingTypeEnum = require("../../enum/ratingType");
const mediaTypeEnum = require("../../enum/mediaType");

const controller = ({ config, brandRepository, productRepository, ratingRepository }) => {
  return {
    async createRating(req, res) {
      try {
        const user = req.httpContext.user;

        if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

        const userId = user.id;

        const { type, referenceId, rate, comment } = req.body;

        const isBrandType = type === ratingTypeEnum.BRAND;

        const [referenceObjError, referenceObj] = isBrandType
          ? await brandRepository.get({ brandId: referenceId })
          : await productRepository.get({ productId: referenceId });

        if (referenceObjError)
          throw referenceObjError;

        if (!referenceObj)
          return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound(`${isBrandType ? 'Brand' : 'Product'} not found.`)));

        const ratingData = new Rating({
          userId,
          type,
          referenceId,
          rate,
          comment,
        });

        const [addRatingError, addRating] = await ratingRepository.add(ratingData);

        if (addRatingError)
          throw addRatingError;

        return res.status(200).send(generateSuccessResponse());

      } catch (err) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
      }
    },

    async getRatings(req, res) {
      try {
        const { type, referenceId, rate, sortBy, sortDirection } = req.query;

        const [ratingsError, ratings] = await ratingRepository.getAll({
          type,
          referenceId,
          rate,
          sortBy,
          sortDirection
        });

        if (ratingsError)
          throw ratingsError;

        const response = ratings ? ratings.map(r => {
          const medias = r.medias.map(m => {
            return {
              type: m.type,
              mediaUrl: r.getMediaUrl(m.mediaId)
            };
          });

          return {
            ratingId: r.getId(),
            type: r.type,
            referenceId: r.getReferenceId(),
            rate: r.rate,
            comment: r.comment,
            medias,
            isEdited: r.isEdited,
            createdAt: r.getCreatedAt(),
            modifiedAt: r.getModifiedAt()
          };
        }) : [];

        return res.status(200).send(generateSuccessResponse(response));

      } catch (err) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
      }
    },

    async updateMedias(req, res) {
      try {
        const { ratingId } = req.params;
        const { medias } = req.body;

        const [ratingError, rating] = await ratingRepository.get(ratingId);

        if (ratingError)
          throw ratingError;

        if (!rating)
          return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("Rating not found.")));

        const { imagePath, videoPath } = config.rating;

        const mediaIdsToBeDeleted = rating.medias.map(m => m.getId());

        const mediasData = await Promise.all(medias.map(async (media) => {
          let { mediaId, type, base64 } = media;

          if (mediaId) {
            const indexRemain = mediaIdsToBeDeleted.indexOf(mediaId);
            mediaIdsToBeDeleted.splice(indexRemain, 1);
          } else {
            mediaId = new ObjectId();
            const path = type === mediaTypeEnum.IMAGE ? imagePath : videoPath;
            await uploadFile(base64, path.replace("{ratingId}", ratingId).replace("{mediaId}", mediaId));
          }

          return { mediaId, type };
        }));

        await Promise.all(mediaIdsToBeDeleted.map(async (mediaId) => {
          const path = type === mediaTypeEnum.IMAGE ? imagePath : videoPath;
          await deleteFile(path.replace("{ratingId}", ratingId).replace("{mediaId}", mediaId));
        }));

      } catch (error) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
      }
    }
  };
};

module.exports = createController(controller)
  .prefix("/api")
  .post("users/rating", "createRating")
  .get("users/rating", "getRatings")
  .put("/users/rating/:ratingId/medias", "updateMedias");
