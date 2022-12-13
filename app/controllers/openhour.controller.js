const db = require("../models");
const OpenHour = db.openhours;

// Use for testing purpose only during development
// Create and Save a new OpenHour
exports.create = (req, res) => {
  // Validate request
  if (!req.body.day) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a OpenHour
  const openhour = {
    day: req.body.day,
    start: req.body.start,
    end: req.body.end,
    restaurant: req.body.restaurant
  };

  // Save OpenHour in the database
  OpenHour.create(openhour)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the OpenHour."
      });
    });
};