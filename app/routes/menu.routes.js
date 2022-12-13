module.exports = app => {
    const menu = require("../controllers/menu.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", menu.create);

    app.use('/api/menus', router);
  };