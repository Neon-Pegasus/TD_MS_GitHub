const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const db = require('../database/index.js');
const api = require('../helper/helpers.js');
require('dotenv').config();


const gitServer = express();
const port = process.env.PORT || 4200;

gitServer.use(bodyParser.json());

gitServer.listen(port, () => {
  console.log(`listening on ${port}`);
});

/** * Test ** */

// Test for deployment
gitServer.get('/', (req, res) => {
  res.send('Test - HOME PAGE!!!');
});


// Get Organizations by top Repos by Stargazers
gitServer.get('/starred/orgs', (req, res) => {
  let array = [];
  let arr = [];
  let newArray = [];
  api.reposByStars().then((data) => {
    const orgArray = data.items;
    for (let i = 0; i < orgArray.length; i += 1) {
      if (orgArray[i]) {
        const org = orgArray[i];
        if (org.owner.type === 'Organization') {
          const orgObj = {
            orgName: org.owner.login,
            orgDescription: org.description,
            orgAvatar: org.owner.avatar_url,
            orgStargazers: org.stargazers_count,
            orgRepo: org.name,
            orgCommentsBody:'', 
          };
          array.push(orgObj);
        } 
      }
    }
    newArray = array.slice(0, 100);
  })
    .then(() => { newArray.forEach((data) => { arr.push(api.listOrgComments(data.orgName, data.orgRepo)); });})
    .then(() => Promise.all(arr))
    .then(result => result[0].filter(body => body.author_association === 'MEMBER').map(member => member.body))
    .then((result) => { 
      for (let j = 0; j < newArray.length; j+= 1) {
        newArray[j].orgCommentsBody = result;
      }
      return db.Organization.bulkCreate(newArray);
    })
    .then((answer) => { res.send(answer) })
    .catch((error) => { console.log(error); res.send(error.message); });
});


// User's repos from GitHub
gitServer.get('/user/repos', (req, res) => {
  const username = req.body.username || 'andrew';
  api.getReposByUser(username, (unit) => {
    const newData = JSON.parse(unit);
    const userRepos = newData.map(repo => JSON.stringify((repo.name)));
    db.User.create({
      userName: username,
      repoNameList: userRepos,
    }).then((user) => {
      res.send(user);
      console.log('Sucess - Data is saved');
    }).catch((error) => {
      console.log('Error - NOT saved', error);
    });
  });
});


// User's repos and User's review comments
gitServer.get('/user/repo/review', (req, res) => {
  const userName = 'andrew';
  db.User.find({ where: { userName } }).then((data) => {
    let dataList = data.repoNameList;
    dataList = dataList.map(item => item.replace(/[\"]/gim, ''));
    dataList.forEach((repo) => {
      api.listCommentsInARepo(userName, repo, (unit) => {
        const newUnit = JSON.parse(unit);
        const repoData = newUnit.map((repos) => {
          if (repos.author_association === 'OWNER') {
            if (!Array.isArray(repos.body)) {
              const array = [repos.body];
              db.Repo.create({
                repoName: repo,
                commentsBody: array,
                userName,
                updatedAt: repos.updatedAt,
              }).then((repoData) => {
                res.send(repoData);
                console.log('Repo review comments have been saved!', repoData);
              }).catch((error) => {
                console.log('Error - Repo Review was NOT saved', error);
              });
            } else {
              db.Repo.create({
                repoName: repo,
                commentsBody: repos.body,
                updatedAt: repos.updatedAt,
              }).then((reposData) => {
                res.send(reposData);
                console.log('Repo review comments have been saved!', reposData);
              }).catch((error) => {
                console.log('Error - Repo Review was NOT saved', error);
              });
            }
          }
        });
      });
    });
  });
});


/** **** API GATEWAY ********* */
// Incoming Request for list of Organizations
gitServer.get('/api/gateway/github/orglist', (req, res) => {
  db.Organization.findAll({ attributes: ['orgName'] }).then((data) => {
    res.send(data);
    console.log('success', data);
  }).catch((err) => {
    console.log(err);
  });
});


// Incoming Request for Organization Data
gitServer.get('/api/gateway/github/org/data', (req, res) => {
  const org = req.params.orgsName || 'tensorflow';
  db.Organization.findOne({ where: { orgName: org } }).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});


gitServer.get('/api/gateway/github/orgdata', (req, res) => {
  db.Organization.findOne({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});


// Get list of Users Repos
gitServer.get('/api/gateway/github/user/repo', (req, res) => {
  const userName = req.params.userName || 'andrew';
  db.User.find({ where: { userName } }).then((data) => {
    res.send(data);
    console.log('success', data);
  }).catch((err) => {
    console.log(err);
  });
});


// Incoming request for User's Repos comments
gitServer.get('/api/gateway/github/userdata', (req, res) => {
  db.User.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

// Request for All users repos data and comments
gitServer.get('/api/gateway/github/repodata', (req, res) => {
  db.Repo.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

// Request for specific user's repo data and comments
gitServer.get('/api/gateway/github/user/repo/data', (req, res) => {
  const user = req.params.user || 'andrew';
  db.Repo.findOne({ where: { userName: user } }).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

