module.exports = (sequelize, Sequelize) => {
    const Restaurant = sequelize.define("restaurant", {
        name: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.DOUBLE
        }
    }, {
        indexes: [
            {
                name: 'restaurant_name_index',
                using: 'BTREE',
                fields: ['name']
            }
        ]
    });
    Restaurant.associate = function(models) {
        models.restaurants.hasMany(models.openhours)};
    return Restaurant;
};