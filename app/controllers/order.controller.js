const db = require("../models");
const Order = db.orders;
const BAD_REQUEST = 400;
const Mutex = require('async-mutex').Mutex;

// API 4
// Process a user purchasing a dish from a restaurant
exports.create = (req, res) => {
    // Validate request
    if (!req.body.amount) {
        res.status(BAD_REQUEST).send({
        message: "Amount can not be empty!"
        });
        return;
    }
    if (!req.body.menus) {
        res.status(BAD_REQUEST).send({
        message: "Menus can not be empty!"
        });
        return;
    }
    if (!req.body.user) {
        res.status(BAD_REQUEST).send({
        message: "User can not be empty!"
        });
        return;
    }
    if (!req.body.restaurant) {
        res.status(BAD_REQUEST).send({
        message: "User can not be empty!"
        });
        return;
    }
    if (!req.body.date) {
        res.status(BAD_REQUEST).send({
        message: "Date can not be empty!"
        });
        return;
    }

    var arr = req.body.menus;
    console.log(arr);
    var promise = Promise.all(arr.map(async (menu) => {
        const order = {
            amount: menu.amount,
            menu: menu.id,
            price: menu.price,
            user: req.body.user,
            restaurant: req.body.restaurant,
            date: req.body.date
        };
        return await Order.create(order);
    }));
  
    for(var i = 0; i < arr.length; i++) {
        var menu = arr[i];
        console.log(menu);
    }

    promise.then(result => {
        let locks = new Map();
        // lock using restaurant id
        if (!locks.has(req.body.restaurant)) {
            locks.set(req.body.restaurant, new Mutex());
        }
        locks
            .get(req.body.restaurant)
            .acquire()
            .then(async (release) => {
                try {
                    const [restaurantResults, restaurantMetadata] = await db.sequelize.query(
                        "update restaurants set balance = balance + :amount where id = :id",
                        {
                            replacements: { 
                                amount: req.body.amount, 
                                id: req.body.restaurant
                            }
                        }
                      );
                    const [userResults, userMetadata] = await db.sequelize.query(
                        "update users set balance = balance - :amount where id = :id",
                        {
                            replacements: { 
                                amount: req.body.amount, 
                                id: req.body.user
                            }
                        }
                    );
                    res.send(result);
                } catch (error) {
                    console.log(error);
                    res.status(BAD_REQUEST).send(error);
                } finally {
                    console.log('Release lock')
                    release();
                }
            },
            );
    }).catch(err => {
        console.log(err);
        res.status(BAD_REQUEST).send("One of data doesn't exist");
    });
};