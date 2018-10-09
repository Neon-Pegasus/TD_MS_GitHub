const request = require('request-promise');
require('dotenv').config();

var ghToken = '';


// User's Repos from Github
const getReposByUser = (username, callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${ghToken}`
    }
  }
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
      callback(res.body);
    }
  })
};

//User's Comments/Reviews to a pull request by Repos
const listCommentsInARepo = (username, repo, callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/repos/${username}/${repo}/issues/comments`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${ghToken}`
    }
  }
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos comments');
      callback(res.body);
    }
  })
};

// List Github Organizations
const listOrganizations = (callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/organizations`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${ghToken}`
    }
  }
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
      callback(res.body);
    }
  })
};


// Search repositories by stargazers 
const reposByStars = (callback) => {
  let options = {
    method: 'GET',
    url: 'https://api.github.com/search/repositories?q=stars:>10000+language:javascript',
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${ghToken}`
    }
  }
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
      callback(res.body);
    }
  })
};

// List top Repos comments
const listComments = (url, callback) => {
  let options = {
    method: 'GET',
    url: `${url}/issues/comments`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${ghToken}`
    }
  }
  console.log(options.url);
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success - retrieved Repos comments');
      callback(res.body);
    }
  })
};

module.exports.getReposByUser = getReposByUser;
module.exports.listCommentsInARepo = listCommentsInARepo;
module.exports.listOrganizations = listOrganizations;
module.exports.reposByStars = reposByStars;
module.exports.listComments = listComments;

/**
 * These helper functions are used to query data from the Github API. 
 */