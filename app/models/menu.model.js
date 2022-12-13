module.exports = (sequelize, Sequelize) => {
    const Menu = sequelize.define("menu", {
        name: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.DOUBLE
        },
        restaurant: {
            type: Sequelize.INTEGER,
            references: {
                model: 'restaurants',
                key: 'id'
            }
        }
    }, {
        indexes: [
            {
                name: 'menu_price_index',
                using: 'BTREE',
                fields: ['price']
            }, {
                name: 'menu_name_index',
                using: 'BTREE',
                fields: ['name']
            }
        ]
    });
  
    return Menu;
};