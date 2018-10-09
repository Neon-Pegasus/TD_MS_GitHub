const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/index.js');
const api = require('../helper/helpers.js');
require('dotenv').config()


const gitServer = express();
const port = process.env.PORT || 4200; 

gitServer.use(bodyParser.json());

gitServer.listen(port, function() {
  console.log(`listening on ${port}`);
});


//User's repos from GitHub
  gitServer.get('/api/user/repos', (req, res) => {
    let username = req.body.username || 'therobinkim';
    let userId = 0;
    api.getReposByUser(username, function(res) {
      let newData = JSON.parse(res);
      var userRepos = newData.map(repo => JSON.stringify((repo.name)));
      console.log(userRepos);
      db.User.create({
          userId: userId, 
          userName: username, 
          repoNameList: userRepos
        }).then((user) => {
          console.log('Sucess - Data is saved', user);
        }).catch((error) => {
          console.log('Error - NOT saved', error)
        });
    })
    .catch(error => console.log('Error - Repo comments were NOT saved', error));
    res.end();
  });

  // User's repos and User's review comments
  gitServer.get('/api/user/repo/review', (req, res) => {
    let username = 'therobinkim';
    let repo ='lets-recreate-axios';
    let repoId = 0;
    api.listCommentsInARepo(username, repo, function(res) {
      let newRepo = JSON.parse(res);
      let data = newRepo.map((repo) => {
        if (repo.author_association !== 'CONTRIBUTOR') {
          return repo.body;
        }
      });
      console.log(data);
      db.Repo.create({
        repoId: repoId,
        repoName: repo,
        commentsBody: data, 
      }).then((data) => {
        console.log('Repo review comments have been saved!', data);
      }).catch((error) => {
        console.log('Error - Repo Review was NOT saved', error);
      })
      
    })
    .catch(error => console.log('Error - Repo comments were NOT saved', error));
    res.end();
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
