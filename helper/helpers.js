const request = require('request-promise');
require('dotenv').config();


// List User's Repos from Github
const getReposByUser = (username, callback) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success - retrieved users repos');
      callback(res.body);
    }
  });
};


// List the User's repo's pull request review comments
const listCommentsInARepo = (username, repo, callback) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/repos/${username}/${repo}/issues/comments`,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - Repo comments NOT received');
    } else {
      console.log('Success - Repo comments received from GH');
      callback(res.body);
    }
  });
};


// Searches repositories by Stargazers over 10,000 and language: javascript
const reposByStars = (callback) => {
  const options = {
    method: 'GET',
    url: 'https://api.github.com/search/repositories?q=stars:>20000+language:javascript?page=1&per_page=100',
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - List of Repos by Stars NOT received');
    } else {
      console.log('Success - List of Repos by Stars received from GH', res.body);
      callback(res.body);
    }
  });
};


// List the Top Repos pull request review comments
const listComments = (url, callback) => {
  const options = {
    method: 'GET',
    url: `${url}/issues/comments?page=1&per_page=100`,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - List of comments NOT received');
    } else {
      console.log('Success - List of comments received from GH');
      callback(res.body);
    }
  });
};

const listOrgComments = (orgName, repoName, callback) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/repos/${orgName}/${repoName}/issues/comments?page=1&per_page=100`,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - List of comments NOT received');
    } else {
      console.log('Success - List of comments received from GH');
      callback(res.body);
    }
  });
};


module.exports.getReposByUser = getReposByUser;
module.exports.listCommentsInARepo = listCommentsInARepo;
module.exports.reposByStars = reposByStars;
module.exports.listComments = listComments;
module.exports.listOrgComments = listOrgComments;

/**
 * These helper functions are used to query data from the Github API.
 */
