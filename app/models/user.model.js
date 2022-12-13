module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        name: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.DOUBLE
        }
    });
  
    return User;
};