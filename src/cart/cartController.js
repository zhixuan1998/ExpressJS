const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { Cart } = require("../../aggregate");
const cartActionTypeEnum = require("../../enum/cartActionType");

const controller = ({
  cartRepository,
  brandRepository,
  productRepository,

  checkoutCommonFunction,
}) => {

  return {
    async updateCart(req, res) {
      try {
        const user = req.httpContext?.user;

        if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

        const userId = user.id;

        const { actionType, selectedBrands, updatedBrands } = req.body;

        let [cartError, cart] = await cartRepository.get(userId);

        if (cartError) throw cartError;

        if (!cart) {
          [cartError, cart] = await cartRepository.add(new Cart({ userId }));

          if (cartError) throw cartError;
        }

        let product = null;

        for (let updatedBrand of updatedBrands) {
          const brandId = updatedBrand.brandId;

          const [brandError, brand] = await brandRepository.get({ brandId });

          if (brandError) throw brandError;

          if (!brand) return res.status(404).send(generateErrorResponse(errorMessages.recordNotFound("Brand not found.")));

          const productIds = brand.items.map(i => i.productId);

          const [productsError, products] = await productRepository.getAll({ brandIds: [brandId], productIds });

          if (productsError) throw productsError;

          if (productIds.length !== products?.length) return res.status(404).send(generateErrorResponse(errorMessages.invalidBrandProducts()));

          product = products[0];
        }

        if (actionType === cartActionTypeEnum.UPDATE) { // Update action always update one item only
          const brandId = updatedBrands[0].brandId;
          const productId = updatedBrands[0].items[0].productId;

          const cartBrand = cart.brands.find(b => b.brandId.toString() === brandId);
          const cartBrandItem = cartBrand?.items.find(i => i.productId.toString() === productId) ?? null;

          const params = {
            userId,
            brandId,
            productId,
            quantity,
            unitPrice: product.unitPrice
          };

          const [updateCartError, updateCart] =
            cartBrandItem ? await cartRepository.updateItemQuantity(params)
              : cartBrand ? await cartRepository.addItem(params)
                : await cartRepository.addBrand(params);

          if (updateCartError) throw updateCartError;

        } else {
          for (let updatedBrand of updatedBrands) {
            const brandId = updatedBrand.brandId;
            const productIds = updatedBrand.items.map(i => i.productId);

            const cartBrand = cart.brands.find(b => b.brandId.toString() === brandId);
            const cartBrandItems = cartBrand?.items.filter(i => productIds.includes(i.productId.toString())) ?? null;

            if (!cartBrand || productIds.length !== cartBrandItems.length)
              return res.status(400).send(generateErrorResponse(errorMessages.itemNotExists()));

            const [removeItemError, removeItem] = cartBrand.items.length === cartBrandItems.length
              ? await cartRepository.removeBrand({ userId, brandId })
              : await cartRepository.removeBrandItems({ userId, brandId, productIds });

            if (removeItemError) throw removeItemError;
          }
        }

        const [calculatorError, calculator] = await checkoutCommonFunction.calculator({ userId, selectedBrands });

        if (calculatorError) throw calculatorError;

        const response = {
          totalPrice: calculator.totalPrice
        };

        return res.status(200).send(generateSuccessResponse(response));

      } catch (err) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
      }
    },

    async getCart(req, res) {
      try {
        const user = req.httpContext?.user;

        if (!user) return res.status(403).send(generateErrorResponse(errorMessages.forbidden()));

        const userId = user.id;

        let [cartError, cart] = await cartRepository.get(userId);

        if (cartError) throw cartError;

        if (!cart) {
          [cartError, cart] = await cartRepository.add(new Cart({ userId }));

          if (cartError) throw cartError;
        }

        const response = {
          userId: cart.getUserId(),
          brands: cart.brands.map(b => ({
            brandId: b.brandId.toString(),
            items: b.items.map(i => ({
              productId: i.productId.toString(),
              unitPrice: parseFloat(i.unitPrice),
              quantity: i.quantity
            }))
          }))
        };

        return res.status(200).send(generateSuccessResponse(response));

      } catch (err) {
        console.error(err);
        return res.status(500).send(generateErrorResponse());
      }
    }
  };
};

module.exports = createController(controller)
  .prefix("/api")
  .put("/users/cart", "updateCart")
  .get("/users/cart", "getCart");
