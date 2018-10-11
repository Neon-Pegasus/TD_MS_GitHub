const express = require('express');
const bodyParser = require('body-parser');
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
    console.log('starred/orgs', data);
    const newOrg = JSON.parse(data);
    console.log('NEW ORG', newOrg);
    const orgArray = newOrg.items;
    const orgData = orgArray.map((org) => {
      if (org.owner.type === 'Organization') {
        console.log('line 36', org.name);
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
gitServer.put('/starred/orgName/repoName/comments', (req, res) => {
  const orgName = 'freeCodeCamp';
  const repoName = 'freeCodeCamp';
  api.listOrgComments(orgName, repoName, (data) => {
    const newData = JSON.parse(data);
    const orgData = newData.map((org) => {
      if (org.author_association === 'MEMBER') {
        console.log(org.body);
        db.Organization.update({
          orgCommentsBody: org.body,
          orgUpdatedAt: org.updatedAt,
        }, {
          where: { orgName : orgName }
        }).then((newOrg) => {
          res.send(newOrg);
        });
      }
    });
  });
});


/** * User's ** */

// User's repos from GitHub
gitServer.get('/user/repos', (req, res) => {
  const username = req.body.username || 'andrew';
  const userId = 0;
  api.getReposByUser(username, (unit) => {
    const newData = JSON.parse(unit);
    const userRepos = newData.map(repo => JSON.stringify((repo.name)));
    db.User.create({
      userId,
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
  const repoIdNum = 0;
  const username = req.body.username || 'fabpot';
  db.User.findOne({
    where: { userName: username },
  }).then((data) => {
    data.repoNameList.forEach((repo) => {
      api.listCommentsInARepo(data.userName, repo, (unit) => {  
        const newUnit = JSON.parse(unit);  
        const data = newUnit.map((repos) => {
          if (repos.author_association !== 'CONTRIBUTOR') {
            // return db.Repo.create({
            //   repoId: repoIdNum,
            //   // repoName: repo,
            //   commentsBody: repos.body,
            //   updatedAt: repos.updatedAt,
            // }).then((repoData) => {
            //   res.send(repoData);
            //   console.log('Repo review comments have been saved!', repoData);
            // }).catch((error) => {
            //   console.log('Error - Repo Review was NOT saved', error);
            // });
          }
        });
      });
    });
  });
});

// Request for User's repos


// Incoming request for User's Repos comments
gitServer.get('/api/gateway/github/userdata', (req, res) => {
  db.User.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});


// Github top Repos by stargazers
gitServer.get('/starred/repos', () => {
  const topId = 0;
  api.reposByStars((res) => {
    const newRes = JSON.parse(res);
    const newRepo = newRes.items;
    const repoData = newRepo.map((repo) => {
      db.TopRepo.create({
        topId,
        topRepoName: repo.name,
        topRepoStargazers: repo.stargazers_count,
        updatedAt: repo.updatedAt,
      });
      return repo.url;
    });
    repoData.forEach((url) => {
      api.listComments(url, (unit) => {
        const data = JSON.parse(unit);
        const newData = data.map((repo) => {
          if (repo.author_association !== 'CONTRIBUTOR') {
            db.TopRepo.update({
              commentsBody: repo.body,
            }, {
              where: {
                topId,
              },
            }).then((resData) => {
              console.log('Success - Top Repo comments have been saved', resData);
            }).catch((error) => {
              console.log('Error', error);
            });
          }
        });
      });
    });
  });
});
