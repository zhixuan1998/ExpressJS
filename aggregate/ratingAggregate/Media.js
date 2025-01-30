const mediaTypeEnum = require("../../enum/mediaType");

module.exports = class Media {
  constructor ({
    mediaId,
    type
  }) {
    if (!Object.values(mediaTypeEnum).includes(type))
      throw new Error("Invalid media type.");

    this.mediaId = mediaId;
    this.type = type;
  }

  getId() {
    return this.mediaId?.toString() ?? null;
  }
};