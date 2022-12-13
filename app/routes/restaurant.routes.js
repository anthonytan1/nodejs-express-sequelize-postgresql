module.exports = app => {
    const restaurant = require("../controllers/restaurant.controller.js");
  
    var router = require("express").Router();
  
    router.post("/", restaurant.create);
    
    // API 1
    // List all restaurants that are open at a certain datetime
    router.get("/", restaurant.getWithOpenHour);

    // API 2
    // List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically. 
    // More or less (than x) is a parameter that the API allows the consumer to enter.
    router.get("/top", restaurant.getWithMenus);

    // API 3
    // Search for restaurants or dishes by name, ranked by relevance to search term
    router.get("/search", restaurant.getByName);

    app.use('/api/restaurants', router);
  };