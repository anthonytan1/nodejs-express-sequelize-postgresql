module.exports = (sequelize, Sequelize) => {
    const OpenHour = sequelize.define("open_hour", {
        day: {
            type: Sequelize.STRING
        },
        start: {
            type: Sequelize.TIME
        },
        end: {
            type: Sequelize.TIME
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
                name: 'open_hour_day_time_index',
                using: 'BTREE',
                fields: ['day', 'start', 'end']
            }
        ]
    });
    OpenHour.associate = function(models) {
        models.openhours.belongsTo(models.restaurants);
    };
    return OpenHour;
};