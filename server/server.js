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


// Github Organizations list 
// gitServer.get('/Orgs', (req, res) => {
//   let orgId = 0;
//   api.listOrganizations( function(res) {
//     let newOrgs = JSON.parse(res);
//     let eachOrg = newOrgs.map(org => JSON.stringify((org.login)));
//    eachOrg.forEach(function(element) {
//       db.Organizations.create({
//         orgId: orgId, 
//         orgName: element,
//       }).then((data) => {
//         console.log('Success - Organizations have been saved', data);
//       }).catch((error) => {
//         console.log('Error', error);
//       })
//     })
//   })
//   res.end();
// });

  // Github Organization by top Repos by Stargazers
gitServer.get('/starred/orgs', (req, res) => {
  let orgId = 0; 
  let orgName = '';
  api.reposByStars( function(res) {
    let newOrg = JSON.parse(res);
    let orgArray = newOrg.items;
    let orgData = orgArray.map((org) => {
       if ( org.owner.type === 'Organization') {
       return org.owner.login;
      }
      return null;
    })
    orgData.forEach(function(element) {
      db.Organizations.create({
          orgId: orgId, 
          orgName: element
        }).then((data) => {
          console.log('Success - Organizations have been saved', data);
        }).catch((error) => {
          console.log('Error', error);
        })
    })
  }).catch(error => console.log('Error', error));
});
