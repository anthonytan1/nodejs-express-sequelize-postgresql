module.exports = {
    // HOST: "host.docker.internal", // docker local config
    HOST: "localhost", // local config
    USER: "admin",
    PASSWORD: "password",
    DB: "postgres",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};