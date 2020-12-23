const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname+'/dist/sf-trees'));

app.listen(process.env.PORT||8080);


//Path Location Strategy
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/dist/sf-trees/index.html'));
});

console.log('Console Listening'); 