const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const octokit = require('@octokit/rest')({debug:true})
// const db = require('../database/database.js');

const gitServer = express();
const port = 4200; 

gitServer.use(bodyParser.json());
// gitServer.use(bodyParser.urlencoded({extended:true}));

gitServer.listen(port, function() {
  console.log(`listening on ${port}`);
});

//GET: User's repos from GitHub
gitServer.get('/user/repos', (req, res) => {
  var username = 'therobinkim';

  var api = `https://api.github.com/users/${username}/repos`
  axios.get(api, {headers: {Authorization: `Bearer${process.env.GITHUB_TOKEN}`}} )
  .then((data) => {
    console.log(data);
  })
})





