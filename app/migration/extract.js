const fs = require('fs');

const db = require("../models");
const Restaurant = db.restaurants;
const Menu = db.menus;
const OpenHour = db.openhours;
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
        console.log("Failed to sync db: " + err.message);
    });
}

const days = ["Sun", 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat' ];


const startEtlPipeline = async () => {
    // var restaurants
   
    // try {
    //     // Extract
    //     fs.readFile('./restaurant_with_menu.json', 'utf8', (err, data) => {
    //         if (err) {
    //           console.error(err);
    //           return;
    //         }
    //         restaurants = data;
    //         // console.log(restaurants);
    //         console.log(restaurants.length);
    //         // Transform
    //         var restaurantarr = JSON.parse(restaurants);
    //         for(var i = 0; i < restaurantarr.length; i++)
    //         {
    //             saveRestaurant(restaurantarr[i])
    //         }
    //     });
    //     // Load
    // } catch (err) {
    //     console.log(err);
    // }  
    processUser();
};

function saveRestaurant(restaurantObj) {
    // Create a Restaurant
    console.log(restaurantObj.restaurantName + " " + restaurantObj.cashBalance + " " + restaurantObj.menu);
    const restaurant = {
        name: restaurantObj.restaurantName,
        balance: restaurantObj.cashBalance,
    };
    // Save Restaurant in the database
    Restaurant.create(restaurant)
    .then(restaurantData => {
        saveMenu(restaurantObj, restaurantData);
        processOpenHour(restaurantObj, restaurantData);
    })
    .catch(restaurantErr => {
        console.log(restaurantErr);
    });
}

function saveMenu(restaurantObj, restaurantData) {
    for (var i = 0; i < restaurantObj.menu.length; i++) {
        // Create a Menu
        const menu = {
            name: restaurantObj.menu[i].dishName,
            price: restaurantObj.menu[i].price,
            restaurant: restaurantData.id
        };
        // Save Menu in the database
        Menu.create(menu)
        .then(menuData => {
            // console.log(menuData)
        })
        .catch(menuErr => {
            console.log(menuErr);
        });
    }
}

function processOpenHour(restaurantObj, restaurantData) {
    var openingHours = restaurantObj.openingHours.split("/");
    for (var i = 0; i < openingHours.length; i++) {
        console.log(openingHours[i].trim());
        var string = openingHours[i].trim();
        var timeRegex = string.match(/\d.*/);
        var dayRegex =  string.match(/^(\D*)/);
        var timeString = timeRegex ? timeRegex[0].trim() : '';
        var dayString = dayRegex ? dayRegex[0].trim() : '';
        // console.log(dayString);
        // console.log(timeString);

        // Get Start time and End time in 24 format
        var timeSplit = timeString.split("-");
        var startTime = convertTime12to24(timeSplit[0].trim())
        var endTime = convertTime12to24(timeSplit[1].trim())
        // console.log(startTime + " until " + endTime);
        
        // Get Individual Day
        var daySplit = dayString.split(",");
        for (var j = 0; j < daySplit.length; j++) {
            var dayRange = daySplit[j].split("-");
            if (dayRange.length == 1) {
                // console.log(dayRange[0].trim() + " " + startTime + " " + endTime)
                saveOpenHour(restaurantData, dayRange[0].trim(), startTime, endTime);
            } else {
                var range = days.slice(days.indexOf(dayRange[0].trim()), days.indexOf(dayRange[1].trim()) + 1);
                for (var k = 0; k < range.length; k++) {
                    // console.log(range[k] + " " + startTime + " " + endTime)
                    saveOpenHour(restaurantData, range[k], startTime, endTime)
                }
            }
        }
    }
}

function saveOpenHour(restaurantData, day, start, end) {
    // Create a OpenHour
    const openhour = {
        day: day,
        start: start,
        end: end,
        restaurant: restaurantData.id
    };

    // Save OpenHour in the database
    OpenHour.create(openhour)
    .then(data => {
    })
    .catch(err => {
        console.log(err)
    });
}

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
        // Load
    } catch (err) {
        console.log(err);
    }  
}

function saveUser(userObj) {
    // Create a User
    console.log(userObj.name + " " + userObj.cashBalance + " " + userObj.purchaseHistory);
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
        console.log(userErr);
    });
}

function processPurchaseHistory (userObj, userData) {
    for (var i = 0; i < userObj.purchaseHistory.length; i++) {
        savePurchaseHistory(userData, userObj.purchaseHistory[i]);
    }
}
function savePurchaseHistory(userData, purchaseHistoryObj) {
    const restaurantName = purchaseHistoryObj.restaurantName;
    // var restaurantCondition = { name: { [Op.eq]: `${restaurantName}` } };
    // Restaurant.findAll({ where: restaurantCondition })
    // .then(restaurantData => {
    //     findMenu(userData, purchaseHistoryObj, restaurantData)
    // })
    // .catch(restaurantErr => {
    //     console.log(restaurantErr)
    // });
    const [restaurantResult, restaurantMetadata] = db.sequelize.query(
    "select id from restaurants where name =:name",
    {
        replacements: { 
            name: restaurantName
        }
    }
    );
    findMenu(userData, purchaseHistoryObj, restaurantResult);
}
function findMenu (userData, purchaseHistoryObj, restaurantData) {
    const dishName = purchaseHistoryObj.dishName;
    // var menuCondition = { name: { [Op.eq]: `${dishName}` }, restaurant: {[Op.eq]: `${restaurantData.id}`} };
    // Menu.findAll({ where: menuCondition })
    // .then(menuData => {
    //     saveOrder(restaurantData, menuData, userData, purchaseHistoryObj);
    // })
    // .catch(restaurantErr => {
    //     console.log(restaurantErr)
    // });
    const [menuResult, restaurantMetadata] = db.sequelize.query(
    "select id from menu where name =:name and restaurant =:restaurant",
    {
        replacements: { 
            name: dishName,
            restaurant: restaurantData
        }
    }
    );
    saveOrder(restaurantData, menuResult, userData, purchaseHistoryObj)
}
function saveOrder(restaurantData, menuData, userData, purchaseHistoryObj) {
    // Create a Order
    const order = {
        amount: 1,
        price: purchaseHistoryObj.transactionAmount,
        date: purchaseHistoryObj.transactionDate,
        user: userData.id,
        // menu: menuData.id,
        // restaurant: restaurantData.id
        menu: menuData,
        restaurant: restaurantData
    };

    // Save Order in the database
    Order.create(order)
    .then(data => {
        
    })
    .catch(err => {
        console.log(err);
    });
}

const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
    if (!minutes) {
        minutes = '00';
    }
  
    if (modifier.toLowerCase() === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }
  
    return `${hours}:${minutes}`;
}

syncDb();