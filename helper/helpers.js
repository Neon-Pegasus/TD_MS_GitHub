const request = require('request-promise');
const db = require('../database/index.js');
require('dotenv').config();


// List User's Repos from Github
const getReposByUser = (username) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};


// List the User's repo's pull request review comments
const listCommentsInARepo = (username, repo) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/repos/${username}/${repo}/issues/comments`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};

// Searches repositories by Stargazers over 10,000 and language: javascript
const reposByStars = () => {
  const options = {
    method: 'GET',
    url: 'https://api.github.com/search/repositories?q=stars:>40000+language:javascript?page=1&per_page=100',
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};


// List the Top Repos pull request review comments
const listComments = (url) => {
  const options = {
    method: 'GET',
    url: `${url}/issues/comments?page=1&per_page=100`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};

const listOrgComments = (orgName, repoName) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/repos/${orgName}/${repoName}/issues/comments?page=1&per_page=100`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};

const getUserData = (userName) => {
  return getReposByUser(userName)
    .then((results) => {
      const userRepos = results.map(repo => (repo.name));
      return db.User.create({
        userName,
        repoNameList: userRepos,
      });
    })
    .catch(error => error);
};


const queryDatabase = (userName) => {
  const array = [];
  db.User.findOne({ where: { userName } })
    .then((data) => {
      const dataList = data.dataValues.repoNameList;
      dataList.forEach((repo) => {
        array.push(listCommentsInARepo(userName, repo));
        db.Repo.create({
          userName,
          repoName: repo,
        });
      });
    })
    .then(() => Promise.all(array))
    .then(data => data[0].filter(body => body.author_association === 'OWNER').map(comment => comment.body))
    .then((result) => {
      db.Repo.update(
        { commentsBody: result },
        { where: { userName } },
      )
        .then(() => { console.log('Database is updated'); });
    })
    .catch((error) => { console.log('Database in NOT updated', error); });
};

const updateUserData = () => {
  const arr = [];
  db.User.findAll({})
    .then((results) => {
      results.forEach((data) => { arr.push(getReposByUser(data.userName)); });
    })
    // .then(() => Promise.all(arr))
    // .then((results) => {
    //   const userRepos = results.map(repo => (repo.name));
    //   return db.User.update(
    //     { repoNameList: userRepos },
    //     { where: { userName } },
    //   );
    // })
    // .then((data) => {
    //   data.forEach((item) => { queryDatabase(item.userName); });
    // })
    .catch(error => error);
};


// module.exports.getOrgs = getOrgs;
module.exports.updateUserData = updateUserData;
module.exports.queryDatabase = queryDatabase;
module.exports.getUserData = getUserData;
module.exports.getReposByUser = getReposByUser;
module.exports.listCommentsInARepo = listCommentsInARepo;
module.exports.reposByStars = reposByStars;
module.exports.listComments = listComments;
module.exports.listOrgComments = listOrgComments;


/**
 * These helper functions are used to query data from the Github API.
 */
