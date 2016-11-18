var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

//connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.routine_table + '` ( \
    `name` VARCHAR(20), \
    `userName` VARCHAR(20), \
    `QRCode` VARCHAR(50), \
    `machineName` VARCHAR(50),\
        PRIMARY KEY (`name`, `userName`, `machineName`)\
);');

console.log('Success: Database Created!')

connection.end();