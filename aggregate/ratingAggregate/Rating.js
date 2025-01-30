const { ObjectId } = require("mongodb");
const Media = require("./Media");
const config = require("../../appsettings");
const ratingTypeEnum = require("../../enum/ratingType");
const mediaTypeEnum = require("../../enum/mediaType");

const { baseUrl } = config.storage;
const { imagePath, videoPath } = config.rating;

module.exports = class Rating {
  contructor({
    userId,
    type,
    referenceId,
    rate,
    comment = "",
    medias = [],
    isEdited = false,
    isDeleted = false,
    createdAt = new Date(),
    createdBy = new ObjectId("000000000000000000000000"),
    modifiedAt = new Date(),
    modifiedBy = new ObjectId("000000000000000000000000"),
    _id
  }) {

    if (!Object.values(ratingTypeEnum).includes(type))
      throw new Error("Invalid rating type.");

    if (![1, 2, 3, 4, 5].includes(rate))
      throw new Error("Invalid rating value.");

    this.userId = userId;
    this.type = type;
    this.referenceId = referenceId;
    this.rate = rate;
    this.comment = comment;
    this.medias = medias.map(m => new Media(m));
    this.isEdited = isEdited;
    this.isDeleted = isDeleted;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.modifiedAt = modifiedAt;
    this.modifiedBy = modifiedBy;
    this._id = _id;
  }

  getId() {
    return this._id?.toString() ?? null;
  }

  getReferenceId() {
    return this.referenceId?.toString() ?? null;
  }

  getCreatedAt() {
    return this.createdAt.toISOString();
  }

  getModifiedAt() {
    return this.modifiedAt.toISOString();
  }

  getMediaUrl(mediaId) {
    const media = this.medias.find(m => m.getId() === mediaId.toString());

    if (!media) return null;

    const path = type === mediaTypeEnum.IMAGE ? imagePath : videoPath;

    return new URL(path.replace("{ratingId}", this._id).replace("{mediaId}", mediaId), baseUrl).href;
  }
};
