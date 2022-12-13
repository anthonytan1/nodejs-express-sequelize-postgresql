module.exports = app => {
    const order = require("../controllers/order.controller.js");
  
    var router = require("express").Router();
  
    // API 4
    // Process a user purchasing a dish from a restaurant
    router.post("/", order.create);

    app.use('/api/orders', router);
  };