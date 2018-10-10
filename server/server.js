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


// User's repos from GitHub
gitServer.get('/api/user/repos', (req, res) => {
  const username = req.body.username || 'therobinkim';
  const userId = 0;
  api.getReposByUser(username, (unit) => {
    const newData = JSON.parse(unit);
    const userRepos = newData.map(repo => JSON.stringify((repo.name)));
    console.log(userRepos);
    db.User.create({
      userId,
      userName: username,
      repoNameList: userRepos,
    }).then((user) => {
      console.log('Sucess - Data is saved', user);
    }).catch((error) => {
      console.log('Error - NOT saved', error);
    });
  })
    .catch(error => console.log('Error - Repo comments were NOT saved', error));
  res.end();
});


// User's repos and User's review comments
gitServer.get('/user/repo/review', (res) => {
  const username = 'therobinkim';
  const repo = 'lets-recreate-axios';
  const repoIdNum = 0;
  api.listCommentsInARepo(username, repo, (unit) => {
    const newRepo = JSON.parse(unit);
    const data = newRepo.map((repos) => {
      if (repos.author_association !== 'CONTRIBUTOR') {
        return repos.body;
      }
    });
    db.Repo.create({
      repoId: repoIdNum,
      repoName: repo,
      commentsBody: data,
    }).then((repoData) => {
      console.log('Repo review comments have been saved!', repoData);
    }).catch((error) => {
      console.log('Error - Repo Review was NOT saved', error);
    });
  })
    .catch(error => console.log('Error - Repo comments were NOT saved', error));
  res.end();
});


// Github Organization by top Repos by Stargazers
gitServer.get('/starred/orgs', () => {
  const orgId = 0;
  api.reposByStars((unit) => {
    const newOrg = JSON.parse(unit);
    const orgArray = newOrg.items;

    const orgData = orgArray.map((org) => {
      if (org.owner.type === 'Organization') {
        db.Organization.create({
          orgId,
          orgName: org.owner.login,
          orgStargazers: org.stargazers_count,
        }).then((orgs) => {
          console.log('Success - Organizations have been saved', orgs);
        }).catch((error) => {
          console.log('Error', error);
        });
      }
    });
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

// Incoming Request for ALL Organizations
db.Organization.findAll({}).then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err);
});
