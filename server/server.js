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


// Get Organizations by top Repos by Stargazers
const getOrgs = () => {
  const array = [];
  const arr = [];
  let newArray = [];
  const comments = [];
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
            orgCommentsBody: '',
          };
          array.push(orgObj);
        }
      }
    }
    newArray = array.slice(0, 100);
  })
    .then(() => {
      newArray.forEach((data) => {
        arr.push(api.listOrgComments(data.orgName, data.orgRepo));
      });
    })
    .then(() => Promise.all(arr))
    .then((result) => {
      
      result[0].forEach((item) => { 
        if (item.author_association === 'MEMBER') {
          const comment = item.body;
          console.log('COMMENT--------------->', item.user);
          newArray[0].orgCommentsBody = comment;
          return newArray;
        }
      });
    })
    .then(() => {
      db.Organization.bulkCreate(newArray);
    })
    .then((result) => { console.log(result); console.log('HERE--->', newArray); })
    .catch((error) => { console.log(error); console.log(error.message); });
};

const queryDatabase = (userName) => {
  db.User.find({ where: { userName } }).then((data) => {
    let dataList = data.repoNameList;
    dataList = dataList.map(item => item.replace(/[\"]/gim, ''));
    dataList.forEach((repo) => {
      api.listCommentsInARepo(userName, repo)
        .then((unit) => {
          const repoData = unit.map((repos) => {
            if (repos.author_association === 'OWNER') {
              if (!Array.isArray(repos.body)) {
                const array = [repos.body];
                db.Repo.create({
                  repoName: repo,
                  commentsBody: array,
                  userName,
                  updatedAt: repos.updatedAt,
                }).then((reposData) => {
                  console.log('Repo review comments have been saved!', reposData);
                }).catch((error) => {
                  console.log('Error - Repo Review was NOT saved', error);
                });
              } else {
                db.Repo.create({
                  repoName: repo,
                  commentsBody: repos.body,
                })
                  .then((result) => {
                    console.log('Repo review comments have been saved!', result);
                  })
                  .catch((error) => {
                    console.log('Error - Repo Review was NOT saved', error);
                  });
              }
            }
          });
        });
    });
  });
};

const getUserData = (userName) => {
  api.getReposByUser(userName)
    .then((results) => {
      const userRepos = results.map(repo => (repo.name));
      return db.User.create({
        userName,
        repoNameList: userRepos,
      });
    })
    .then(() => { queryDatabase(userName); })
    .catch(error => error);
};


// User's repos from GitHub
const getUserRepos = (userName) => {
  db.User.find({ where: { userName } })
    .then((data) => {
      if (!data) {
        return api.getUserData(userName);
      }
      if (data.dataValues.userName) {
        return queryDatabase(userName);
      }
    })
    .then((data) => { res.send(data); console.log(data); })
    .catch((error) => { console.log(error.message); });
};

const getRepoData = (userName) => {
  db.Repo.find({ where: { userName } })
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.send(error.message);
    });
};


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
  const org = req.params.orgsName || 'facebook';
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
gitServer.get('/api/gateway/github/user', (req, res) => {
  const userName = req.params.userName || 'andrew';
  db.User.find({ where: { userName } }).then((data) => {
    res.send(data);
    console.log('success', data);
  }).catch((err) => {
    console.log(err);
  });
});


// Request for specific user's repo data and comments
gitServer.get('/api/gateway/github/user/repo/data', (req, res) => {
  const userName = req.params.userName || 'andrew';
  getUserRepos(userName)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.send(error.message);
    });
});

// Request for All users repos data and comments
gitServer.get('/api/gateway/github/repo/data', (req, res) => {
  db.Repo.findAll({}).then((data) => {
    res.send(data);
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

const lateNightUpdate = () => {
  getOrgs();
  api.updateUserData();
};

setInterval(lateNightUpdate, 86400000);

/** * Test ** */

// Test for deployment
gitServer.get('/', (req, res) => {
  // api.updateUserData();
  getOrgs();
  res.send('Test - HOME PAGE!!!');
});
