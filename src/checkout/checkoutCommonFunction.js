const { generateErrorResponse } = require("../../utils/responseParser");
const bigdecimal = require("bigdecimal");

module.exports = ({
  cartRepository
}) => {
  function toBD(number = 0) {
    return new bigdecimal.BigDecimal(number.toString());
  }

  return {
    async calculator({ userId, selectedBrands }) {
      try {
        if (!userId || !selectedBrands?.length) {
          return [null, null];
        }

        const [cartError, cart] = await cartRepository.get(userId);

        if (cartError) throw cartError;

        let totalInBD = toBD();

        for (let brand of selectedBrands) {
          const cartBrand = cart.brands.find(b => b.brandId.toString() === brand.brandId);

          for (let productId of brand.productIds) {
            const { unitPrice, quantity } = cartBrand.items.find(i => i.productId.toString() === productId);
            const subtotalInBD = toBD(unitPrice).multiply(toBD(quantity));
            totalInBD = totalInBD.add(subtotalInBD);
          }
        }

        const result = {
          totalPrice: parseFloat(totalInBD)
        };

        return [null, result];

      } catch (error) {
        return [error];
      }
    }
  };
};