const request = require('request-promise');
require('dotenv').config();

const ghToken = '';

// List User's Repos from Github
const getReposByUser = (username, callback) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${ghToken}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved user repos');
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
      Authorization: `bearer ${ghToken}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos comments');
      callback(res.body);
    }
  });
};

// List Github Random Organizations
const listOrganizations = (callback) => {
  const options = {
    method: 'GET',
    url: 'https://api.github.com/organizations',
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${ghToken}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
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
      Authorization: `bearer ${ghToken}`,
    },
  };
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
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
      Authorization: `bearer ${ghToken}`,
    },
  };
  console.log(options.url);
  request.get(options, (err, res) => {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success - retrieved Repos comments');
      callback(res.body);
    }
  });
};

module.exports.getReposByUser = getReposByUser;
module.exports.listCommentsInARepo = listCommentsInARepo;
module.exports.listOrganizations = listOrganizations;
module.exports.reposByStars = reposByStars;
module.exports.listComments = listComments;

/**
 * These helper functions are used to query data from the Github API.
 */
