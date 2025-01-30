const { ObjectId, Decimal128 } = require('mongodb');
const { Cart } = require("../aggregate");

module.exports = ({
  collections: {
    carts
  }
}) => {

  return {
    async add(cart) {
      const cartData = {
        userId: new ObjectId(cart.userId),
        brands: cart.brands,
        isDeleted: cart.isDeleted,
        createdAt: cart.createdAt,
        createdBy: cart.createdBy,
        modifiedAt: cart.modifiedAt,
        modifiedBy: cart.modifiedBy
      };

      try {
        const result = await carts.insertOne(cartData);

        const insertedId = result.insertedId;

        const insertedResult = await carts.findOne({ _id: insertedId });

        return [null, new Cart(insertedResult)];

      } catch (error) {
        return [error];
      }
    },

    async get(userId) {
      try {
        const result = await carts.findOne({
          userId: new ObjectId(userId),
          isDeleted: false
        });

        return [null, result ? new Cart(result) : null];

      } catch (error) {
        return [error];
      }
    },

    async addBrand({ userId, brandId, productId, unitPrice, quantity }) {
      if (quantity <= 0) {
        return [null, false];
      }

      try {
        const result = await carts.updateOne(
          {
            userId: new ObjectId(userId),
            isDeleted: false
          },
          {
            $push: {
              brands: {
                brandId: new ObjectId(brandId),
                items: [{
                  productId: new ObjectId(productId),
                  unitPrice: new Decimal128(unitPrice.toString()),
                  quantity
                }]
              }
            },
            $set: {
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          },
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    },

    async addItem({ userId, brandId, productId, unitPrice, quantity }) {
      if (quantity <= 0) {
        return [null, false];
      }

      try {
        const result = await carts.updateOne(
          {
            userId: new ObjectId(userId),
            'brands.brandId': new ObjectId(brandId),
            isDeleted: false
          },
          {
            $push: {
              'brands.$[brand].items': {
                productId: new ObjectId(productId),
                unitPrice: new Decimal128(unitPrice.toString()),
                quantity
              }
            },
            $set: {
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          },
          { arrayFilters: [{ 'brand.brandId': new ObjectId(brandId) }] }
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    },

    async updateItemQuantity({ userId, brandId, productId, quantity }) {
      if (quantity <= 0) {
        return [null, false];
      }

      try {
        const result = await carts.updateOne(
          {
            userId: new ObjectId(userId),
            brands: {
              $elemMatch: {
                brandId: new ObjectId(brandId),
                items: {
                  $elemMatch: { productId: new ObjectId(productId) }
                }
              }
            },
            isDeleted: false
          },
          {
            $set: {
              'brands.$[brand].items.$[item].quantity': quantity,
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          },
          {
            arrayFilters: [
              { 'brand.brandId': new ObjectId(brandId) },
              { 'item.productId': new ObjectId(productId) }
            ]
          }
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    },

    async removeBrand({ userId, brandId }) {
      try {
        const result = await carts.updateOne(
          {
            userId: new ObjectId(userId),
            'brands.brandId': new ObjectId(brandId),
            isDeleted: false
          },
          {
            $pull: {
              brands: {
                brandId: new ObjectId(brandId)
              }
            },
            $set: {
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

    async removeBrandItems({ userId, brandId, productIds }) {


      try {
        const result = await carts.updateOne(
          {
            userId: new ObjectId(userId),
            brands: {
              $elemMatch: {
                brandId: new ObjectId(brandId),
                items: {
                  $elemMatch: { productId: { $in: productIds.map(p => new ObjectId(p.productId)) } }
                }
              }
            },
            isDeleted: false
          },
          {
            $pull: {
              'brands.$[brand].items': { productId: { $in: productIds.map(p => new ObjectId(p.productId)) } }
            },
            $set: {
              modifiedAt: new Date(),
              modifiedBy: new ObjectId(userId)
            }
          },
          { arrayFilers: [{ 'brand.brandId': new ObjectId(brandId) }] }
        );

        return [null, result.modifiedCount ? true : false];

      } catch (error) {
        return [error];
      }
    },
  };
};
