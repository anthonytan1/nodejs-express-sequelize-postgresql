const fs = require('fs');

const db = require("../models");
const Restaurant = db.restaurants;
const Menu = db.menus;
const User = db.users;
const Order = db.orders;
const Op = db.Sequelize.Op;

const syncDb = async () => {
    db.sequelize.sync({ force: false })
    .then(() => {
        console.log("Synced db.");
        startEtlPipeline();
    })
    .catch((err) => {
        console.error("Failed to sync db: " + err.message);
    });
}

const startEtlPipeline = async () => {
    processUser();
};

function processUser() {
    var users
   
    try {
        // Extract
        fs.readFile('./users_with_purchase_history.json', 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            users = data;
            console.log(users.length);
            // Transform
            var userarr = JSON.parse(users);
            for(var i = 0; i < userarr.length; i++)
            {
                saveUser(userarr[i])
            }
        });
    } catch (err) {
        console.error(err);
    }  
}

function saveUser(userObj) {
    // Create a User
    const user = {
        name: userObj.name,
        balance: userObj.cashBalance,
    };
    // Save User in the database
    User.create(user)
    .then(userData => {
        processPurchaseHistory(userObj, userData);
    })
    .catch(userErr => {
        console.error(userErr);
    });
}

function processPurchaseHistory (userObj, userData) {
    for (var i = 0; i < userObj.purchaseHistory.length; i++) {
        findRestaurant(userData, userObj.purchaseHistory[i]);
    }
}
function findRestaurant(userData, purchaseHistoryObj) {
    const restaurantName = purchaseHistoryObj.restaurantName;
    var restaurantCondition = { name: { [Op.eq]: `${restaurantName}` } };
    Restaurant.findAll({ where: restaurantCondition })
    .then(restaurantData => {
        findMenu(userData, purchaseHistoryObj, restaurantData[0])
    })
    .catch(restaurantErr => {
        console.log(restaurantErr)
    });
}
function findMenu (userData, purchaseHistoryObj, restaurantData) {
    const dishName = purchaseHistoryObj.dishName;
    var menuCondition = { name: { [Op.eq]: `${dishName}` }, restaurant: {[Op.eq]: `${restaurantData.id}`} };
    Menu.findAll({ where: menuCondition })
    .then(menuData => {
        saveOrder(restaurantData, menuData[0], userData, purchaseHistoryObj);
    })
    .catch(restaurantErr => {
        console.log(restaurantErr)
    });
}
function saveOrder(restaurantData, menuData, userData, purchaseHistoryObj) {
    // Create a Order
    const order = {
        amount: 1,
        price: purchaseHistoryObj.transactionAmount,
        date: purchaseHistoryObj.transactionDate,
        menu: menuData.id,
        user: userData.id,
        restaurant: restaurantData.id
    };

    // Save Order in the database
    Order.create(order)
    .then(data => {
        
    })
    .catch(err => {
        console.log(err);
    });
}

syncDb();