 
//connection = require("express-myconnection");

// // mysql 
// connection = mysql.createConnection(
module.exports = {
    'connection': {
  host     : 'cepheus.cvcp3fyhu8aj.us-east-1.rds.amazonaws.com',
  user     : 'cepheus',
  password : 'cepheus!'},
  database : 'cepheus',
  users_table: 'users',
  trainer_table: 'trainerInfo',
  machine_table: 'machineInfo',
  routine_table: 'routines'
};