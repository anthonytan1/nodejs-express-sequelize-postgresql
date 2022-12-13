module.exports = app => {
    const openhour = require("../controllers/openhour.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", openhour.create);

    app.use('/api/openhours', router);
  };