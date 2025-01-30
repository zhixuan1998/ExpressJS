const { createController } = require("awilix-express");
const { generateSuccessResponse, generateErrorResponse } = require("../../utils/responseParser");
const errorMessages = require("../../errorMessages");
const { Cart } = require("../../aggregate");

const controller = ({
  cartRepository,
  productRepository
}) => {

  return {
  }
}

module.exports = createController(controller)
  .prefix("/api")
  .post("/users/checkout", "checkout")
  .post("/users/checkout/calculator", "checkoutCalculator")