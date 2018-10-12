const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
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

/** * Organization ** */

// Get Organizations by top Repos by Stargazers
gitServer.get('/starred/orgs', (req, res) => {
  const orgId = 0;
  api.reposByStars((data) => {
    const newOrg = JSON.parse(data);
    const orgArray = newOrg.items;
    const orgData = orgArray.map((org) => {
      if (org.owner.type === 'Organization') {
        db.Organization.create({
          orgId,
          orgName: org.owner.login,
          orgDescription: org.description,
          orgAvatar: org.owner.avatar_url,
          orgStargazers: org.stargazers_count,
          orgRepo: org.name,
        }).then((orgs) => {
          res.json(orgs);
          console.log('Success - Organizations have been saved');
        }).catch((error) => {
          console.log('Error', error);
        });
      }
    });
  });
});


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
gitServer.get('/api/gateway/github/orgdata', (req, res) => {
  db.Organization.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

// // Get an Organization's comments
gitServer.get('/starred/orgName/repoName/comments', (req, res) => {
  const orgName = req.params.orgName || 'bitcoin';
  const repoName = req.params.repoName || 'Bitcoin Core integration/staging tree';
  api.listOrgComments(orgName, repoName, (data) => {
    const inputData = JSON.parse(data);
    const newData = inputData.map(item => item.body);
    db.Organization.update({
      orgCommentsBody: newData,
    }, {
      where: { orgName },
    }).then(() => {
      console.log('Updated Successfully');
    });
  });
});


/** * User's ** */

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

// Get list of Users Repos
gitServer.get('/api/gateway/github/userrepo', (req, res) => {
  const userName = req.params.userName || 'fabpot';
  db.User.find({ where: { userName } }).then((data) => {
    res.send(data);
    console.log('success', data);
  }).catch((err) => {
    console.log(err);
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


// Incoming request for User's Repos comments
gitServer.get('/api/gateway/github/userdata', (req, res) => {
  db.User.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

// Request for User's Repo data and comments
gitServer.get('/api/gateway/github/user/repodata', (req, res) => {
  db.Repo.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});


/** * TOP RATED REPOs ** */

// Github top Repos by stargazers
gitServer.get('/starred/repos', () => {
  api.reposByStars((res) => {
    const newRes = JSON.parse(res);
    const newRepo = newRes.items;
    const repoData = newRepo.map((repo) => {
      db.TopRepo.create({
        topRepoName: repo.name,
        topRepoStargazers: repo.stargazers_count,
      });
      return repo.url;
    })
    })
   
    repoData.forEach((url, repoName) => {
      
      api.listComments(url, (unit) => {
        const data = JSON.parse(unit);
        const newData = data.map((item) => {
          if (item.author_association === 'OWNER') {
            db.TopRepo.update({
              commentsBody: item.body,
            }, {
              where: {
                newName,
              },
            }).then((resData) => {
              console.log('Success - Top Repo comments have been saved');
            }).catch((error) => {
              console.log('Error', error);
            });
          }
        });
      });
    });
  });
// });
