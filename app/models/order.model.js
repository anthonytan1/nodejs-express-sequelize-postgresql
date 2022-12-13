module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        amount: {
            type: Sequelize.DOUBLE
        },
        price: {
            type: Sequelize.DOUBLE
        },
        date: {
            type: Sequelize.DATE
        },
        menu: {
            type: Sequelize.INTEGER,
            references: {
                model: 'menus',
                key: 'id'
            }
        },
        user: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        restaurant: {
            type: Sequelize.INTEGER,
            references: {
                model: 'restaurants',
                key: 'id'
            }
        }
    });
  
    return Order;
};