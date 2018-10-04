const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const port = 4200; 

app.listen(port, function() {
  console.log('Server is running on port: '+ port);
});