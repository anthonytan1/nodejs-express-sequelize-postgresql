# Database Configuration
Change database configuration in the /app/config/db.config.js

# ETL
Run data migration for the Restaurant / Menu / Open Hour by calling `node etlRestaurant.js` in /app/migration. Once finish, run the second data migration for User and Order by calling `node etlUser.js` in /app/migration

# Local Testing
In case there is no docker installed locally, can run `node server.js` . If docker is installed, can run using `docker-compose up`. However, if the database is using local database, there is a slight different in the database host configuration. `host.docker.internal` for docker, and `localhost` for node

# Setting Up DB
To install: `brew install postgresql`
To start: `brew services start postgresql`
To stop: `brew services stop postgresql`
To create user:
1. `psql postgres`
2. `CREATE ROLE admin WITH LOGIN PASSWORD ‘password’`
3. `ALTER ROLE admin CREATEDB;`

# Building Docker Image
`docker build . -t buyingfrenzy/node-web-app`
`docker run -p 49160:8080 -d buyingfrenzy/node-web-app`

# API Documentation
Can be seen in https://github.com/anthonytan1/nodejs-express-sequelize-postgresql/blob/main/swagger.yaml, copy paste the value in https://editor.swagger.io/

