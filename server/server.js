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
    .then(result => result[0].filter(body => body.author_association === 'MEMBER').map(member => member.body))
    .then((result) => {
      for (let j = 0; j < newArray.length; j += 1) {
        newArray[j].orgCommentsBody = result;
      }
      return db.Organization.bulkCreate(newArray);
    })
    .then((answer) => { console.log(answer); })
    .catch((error) => { console.log(error); console.log(error.message); });
};


// User's repos from GitHub
const getUserRepos = (userName) => {
  db.User.find({ where: { userName } })
    .then((data) => {
      if (!data) {
        return api.getUserData(userName);
      }
      if (data.dataValues.userName) {
        return api.queryDatabase(userName);
      }
    })
    .then((data) => { console.log(data); res.send(data); })
    .catch((error) => { res.send(error.message); });
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
  getUserRepos(userName);
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
  getOrgs();
  res.send('Test - HOME PAGE!!!');
});
