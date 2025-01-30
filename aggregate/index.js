const Account = require("./accountAggregate/Account");
const Address = require("./addressAggregate/Address");
const Brand = require("./brandAggregate/Brand");
const Cart = require("./cartAggregate/Cart");
const Category = require("./categoryAggregate/Category");
const Follow = require("./followAggregate/Follow");
const Order = require("./orderAggregate/Order");
const OrderDetail = require("./orderDetailAggregate/OrderDetail");
const Product = require("./productAggregate/Product");
const Rating = require("./ratingAggregate/Rating");
const RefreshToken = require("./refreshTokenAggregate/RefreshToken");
const Shop = require("./shopAggregate/Shop");
const User = require("./userAggregate/User");


module.exports = {
    Account,
    Address,
    Brand,
    Cart,
    Category,
    Follow,
    Order,
    OrderDetail,
    Product,
    Rating,
    RefreshToken,
    Shop,
    User
};
