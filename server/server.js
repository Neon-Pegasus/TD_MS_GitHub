const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
// const db = require('../database/database.js');
const dotenv = require('dotenv');
dotenv.config();

const gitServer = express();
const port = 4200; 

gitServer.use(bodyParser.json());
// gitServer.use(bodyParser.urlencoded({extended:true}));

gitServer.listen(port, function() {
  console.log(`listening on ${port}`);
});

var github_token = '264bfe4191b90d218ea390a9c9c69c9242963010';


// //GET: User's repos from GitHub
gitServer.get('/user/repos', (req, res) => {
  var username = 'therobinkim';
  var api = `https://api.github.com/users/${username}/repos`
  axios.get(api, {headers: {Authorization: `Bearer ${github_token}`}} )
  .then(results => {
    var requests = results.data.map(result => (result.pulls_url));
    return requests;
  })
  .then(requests => {
    // console.log('line 31', requests);
    let queries = requests.map(request => {
    let url = request;
    let newUrl = url.replace(/\{([^}]+)\}/g, '?state=all');
      // console.log(newUrl);
      return axios.get(newUrl, {headers: {Authorization: `Bearer ${github_token}`}} )
    })
    Promise.all(queries)
    .then(answers => console.log('promise', answers))
  })
  .then((response) => {
    // console.log('line 41', response);
    res.send(JSON.stringify(response));
  })
  .catch(error => {
    console.log('Error', error);
  })
});


//GET: Github Organizations
// gitServer.get('/Orgs', (req, res) => {
//   var api = 'https://api.github.com/organizations'
//   axios.get(api, {headers: {Authorization: `Bearer${process.env.GITHUB_TOKEN}`}} )
//   .then((data) => {
//     console.log(data);
//     res.send(data);
//   })
//   .catch(error => {
//     console.log('Error', error);
//   }) 
// });

  //GET: Github Repos by Stargazers
// gitServer.get('/starred/repos', (req, res) => {
//   var api = 'https://api.github.com/repositories'
//   axios.get(api, {headers: {Authorization: `Bearer${process.env.GITHUB_TOKEN}`}} )
//   .then((data) => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.log('Error', error);
//   }) 
// });
