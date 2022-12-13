const db = require("../models");
const Restaurant = db.restaurants;

const BAD_REQUEST = 400;
const days = ["Sun", 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat' ];
// const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// API 1
// List all restaurants that are open at a certain datetime
exports.getWithOpenHour = async (req, res) => {
  if(!req.query.datetime) {
        const err = new Error();
        err.message = 'Required \'datetime\' param missing';
        res.status(BAD_REQUEST);
        res.send(err);
        return;
    }

    const datetime = req.query.datetime;

    const date = new Date(datetime);
    const timestamp = date.getTime();
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
        const err = new Error();
        err.message = 'Invalid datetime format';
        res.status(BAD_REQUEST);
        res.send(err);
        return;
    }
    const day = days[date.getDay()].toLowerCase();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const [results, metadata] = await db.sequelize.query(
      "SELECT restaurants.* FROM restaurants JOIN open_hours ON restaurants.id = open_hours.restaurant "
      + " WHERE LOWER(open_hours.day)=:day AND open_hours.start <= :time AND open_hours.end >= :time",
      {
        replacements: { day: day, time: hour + ":" + minute},
      }
    );
    res.send(results);
};

// API 2
// List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically. 
// More or less (than x) is a parameter that the API allows the consumer to enter.
exports.getWithMenus = async (req, res) => {
  if(!req.query.no_of_restaurant) {
    const err = new Error();
    err.message = 'Required \'no_of_restaurant\' param missing';
    res.status(BAD_REQUEST);
    res.send(err);
    return;
  }
  if(!req.query.no_of_dish_gt && !req.query.no_of_dish_lt) {
      const err = new Error();
      err.message = 'Required one of \'no_of_dish_gt\' or \'no_of_dish_lt\' param';
      res.status(BAD_REQUEST);
      res.send(err);
      return;
  }
  if(!req.query.start_price || !req.query.end_price) {
      const err = new Error();
      err.message = 'Required both \'start_price\' and \'end_price\' param';
      res.status(BAD_REQUEST);
      res.send(err);
      return;
  }

  const [results, metadata] = await db.sequelize.query(
    "SELECT * FROM ( SELECT restaurants.*, count(*) AS no_of_menu " +
    "FROM restaurants JOIN menus ON restaurants.id = menus.restaurant " +
    "WHERE menus.price >= :start_price AND menus.price <= :end_price " +
    "GROUP BY restaurants.id ORDER BY restaurants.name ASC LIMIT :no_of_restaurant) AS sub " +
    "WHERE no_of_menu >= :no_of_dish_gt AND no_of_menu <= :no_of_dish_lt ",
    {
      replacements: { 
        start_price: req.query.start_price, 
        end_price: req.query.end_price,
        no_of_restaurant: req.query.no_of_restaurant,
        no_of_dish_gt: req.query.no_of_dish_gt,
        no_of_dish_lt: req.query.no_of_dish_lt
      },
    }
  );
  res.send(results);
};

// API 3
// Search for restaurants or dishes by name, ranked by relevance to search term
// Note: By right it should use noun for API end point
//       However since it can be used to search for restaurants or dishes, I couldn't come out with better name
exports.getByName = async (req, res) => {
  if(!req.query.name) {
    const err = new Error();
    err.message = 'Required \'name\' param missing';
    res.status(BAD_REQUEST);
    res.send(err);
    return;
  } 
  const name = req.query.name;
  const [results, metadata] = await db.sequelize.query(
    "SELECT restaurants.* FROM Restaurants JOIN menus ON Restaurants.id = menus.Restaurant " +
    "WHERE restaurants.name LIKE '%" + name + "%' or menus.name LIKE '%" + name + "%'"
  );
  res.send(results);
};

// Use for testing purpose only during development
// Create and Save a new Restaurant
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
  
    // Create a Restaurant
    const restaurant = {
      name: req.body.name,
      balance: req.body.balance,
    };
  
    // Save Restaurant in the database
    Restaurant.create(restaurant)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Restaurant."
        });
      });
  };