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


const getOrgRepoData = () => {
  let topReposList;
  let repoComments;
  return api.reposByStars()
    .then((results) => {
      topReposList = results.items.filter(repo => repo.owner.type === 'Organization')
        .map((repo) => {
          return {
            orgName: repo.owner.login,
            orgAvatar: repo.owner.avatar_url,
            orgTopRepoUrl: repo.url,
            orgTopRepoName: repo.name,
            orgTopRepoStars: repo.stargazers_count,
          };
        });

      return Promise.all(topReposList.map(repo => api.getRepoComments(repo.orgTopRepoUrl)));
    })
    .then((results) => {
      repoComments = results.map((orgRepo) => {
        return orgRepo.filter((repo) => {
          return repo.author_association === 'MEMBER';
        });
      });
      const orgRepoArray = repoComments.map((org) => {
        return org.reduce((acc, cv) => {
          acc.organization = cv.url.split('https://api.github.com/repos/')[1].split('/')[0];
          acc.comment = acc.comment.concat(cv.body);
          return acc;
        }, { comment: [] });
      });
      return orgRepoArray.filter((commentLine) => {
        return commentLine.comment.length;
      });
    })
    .then((results) => { 
      results.forEach(repo => topReposList.forEach((org) => {
        if (repo.organization === org.orgName) {
          org.orgTopRepoComments = repo.comment;
        }
      }));
      db.Organization.bulkCreate(topReposList);
      return topReposList;
    })
    .then((result) => { return result; })
    .catch((error) => { console.log(error); });
};


const getUserData = (userName) => {
  const promises = [];
  api.getReposByUser(userName)
    .then((results) => {
      const userRepos = results.map(repo => (repo.url));
      userRepos.forEach((url) => { 
        promises.push(api.getRepoComments(url));
      });
      return Promise.all(promises);
    })
    .then((results) => {
      return results.filter((repo) => {
        return repo.length;
      });
    })
    .then((results) => {
      const userRepoArray = results.map((repos) => {
        repos.filter(repo => repo.author_association === 'OWNER')
        if (!Array.isArray(repos.body)) {
          const array = [repos.body];
          db.Repo.create({
            userName,
            repoName: (repos.url).split('https://api.github.com/repos/')[1].split('/')[1],
            commentsBody: array,
          });
        } else {
          db.Repo.create({
            userName,
            repoName: (repos.url).split('https://api.github.com/repos/')[1].split('/')[1],
            commentsBody: repos.body,
          });
        }
      });
      return userRepoArray;
    })
    .catch((error) => { console.log('Error', error)});
};


/** **** API GATEWAY ********* */


// Incoming Request for list of Organizations
gitServer.get('/api/gateway/github/orgdata', (req, res) => {
  db.Organization.findAll({})
    .then((result) => {
      res.send(result);
      console.log('success', result);
    }).catch((err) => {
      console.log(err);
    });
});


// Incoming Request for Organization Data
gitServer.get('/api/gateway/github/orglist', (req, res) => {
  const org = req.params.orgsName || 'facebook';
  db.Organization.findAll({ where: { orgName: org } })
    .then((result) => {
      res.send(result);
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });
});


// Request for specific user's repo data and comments
gitServer.get('/api/gateway/github/user/repo/data', (req, res) => {
  const userName = req.params.userName || 'ornicar';
  db.Repo.findOne({ where: { userName } })
    .then((result) => {
      if (!result || result === undefined) {
        return getUserData(userName);
      }
      if (result.dataValues.userName) {
        return db.Repo.findAll({ where: { userName } });
      }
    })
    .then((result) => { res.send(result); console.log(result); })
    .catch((error) => { res.send(error.message); });
});

// Request for All users repos data and comments
gitServer.get('/api/gateway/github/repo/data', (req, res) => {
  const userName = req.params.userName || 'andrew';
  db.Repo.findAll({ where: { userName } })
    .then((result) => {
      res.send(result);
      console.log(result);
    }).catch((err) => {
      res.send(err.message);
    });
});

const lateNightUpdate = () => {
  getOrgRepoData();
  api.updateUserData();
};

setInterval(lateNightUpdate, 86400000);

/** * Test ** */

// Test for deployment
gitServer.get('/', (req, res) => {
  res.send('Test - HOME PAGE!!!');
});
