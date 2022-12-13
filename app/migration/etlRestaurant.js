const fs = require('fs');

const db = require("../models");
const Restaurant = db.restaurants;
const Menu = db.menus;
const OpenHour = db.openhours;

const syncDb = async () => {
    db.sequelize.sync({ force: true })
    .then(() => {
        console.log("Synced db.");
        startEtlPipeline();
    })
    .catch((err) => {
        console.error("Failed to sync db: " + err.message);
    });
}

const days = ["Sun", 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat' ];


const startEtlPipeline = async () => {
    processRestaurant();
    // processUser();
};

function processRestaurant() {
    var restaurants
   
    try {
        // Extract
        fs.readFile('./restaurant_with_menu.json', 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            restaurants = data;

            console.error(restaurants.length);
            // Transform and Save
            var restaurantarr = JSON.parse(restaurants);
            for(var i = 0; i < restaurantarr.length; i++)
            {
                saveRestaurant(restaurantarr[i])
            }
        });
    } catch (err) {
        console.error(err);
    }  
}

function saveRestaurant(restaurantObj) {
    // Create a Restaurant
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
        console.error(restaurantErr);
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
        })
        .catch(menuErr => {
            console.error(menuErr);
        });
    }
}

function processOpenHour(restaurantObj, restaurantData) {
    var openingHours = restaurantObj.openingHours.split("/");
    for (var i = 0; i < openingHours.length; i++) {

        var string = openingHours[i].trim();
        var timeRegex = string.match(/\d.*/);
        var dayRegex =  string.match(/^(\D*)/);
        var timeString = timeRegex ? timeRegex[0].trim() : '';
        var dayString = dayRegex ? dayRegex[0].trim() : '';

        // Get Start time and End time in 24 format
        var timeSplit = timeString.split("-");
        var startTime = convertTime12to24(timeSplit[0].trim())
        var endTime = convertTime12to24(timeSplit[1].trim())
        
        // Get Individual Day
        var daySplit = dayString.split(",");
        for (var j = 0; j < daySplit.length; j++) {
            var dayRange = daySplit[j].split("-");
            if (dayRange.length == 1) {
                saveOpenHour(restaurantData, dayRange[0].trim(), startTime, endTime);
            } else {
                var range = days.slice(days.indexOf(dayRange[0].trim()), days.indexOf(dayRange[1].trim()) + 1);
                for (var k = 0; k < range.length; k++) {
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
        console.error(err)
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