const db = require("../models");
const Menu = db.menus;

// Use for testing purpose only during development
// Create and Save a new Menu
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Menu
  const menu = {
    name: req.body.name,
    price: req.body.price,
    restaurant: req.body.restaurant
  };

  // Save Menu in the database
  Menu.create(menu)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Menu."
      });
    });
};