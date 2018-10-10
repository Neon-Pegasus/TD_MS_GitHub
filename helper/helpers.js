const axios = require('axios');
require('dotenv').config();

// const GITHUB_TOKEN = '';

// List User's Repos from Github
const getReposByUser = (username) => {
  axios({
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => {
      console.log('Success - User Repos received from GH', response);
    })
    .catch((error) => {
      console.log('Error - User Repos GH request', error);
    });
};


// List the User's repo's pull request review comments
const listCommentsInARepo = (username, repo) => {
  axios({
    method: 'GET',
    url: `https://api.github.com/repos/${username}/${repo}/issues/comments`,
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => {
      console.log('Success - Repo comments received from GH', response);
    })
    .catch((error) => {
      console.log('Error - Repo comments NOT received', error);
    });
};


// List Github Random Organizations
const listOrganizations = () => {
  axios({
    method: 'GET',
    url: 'https://api.github.com/organizations',
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => {
      console.log('Success - List of organizations received from GH', response);
    })
    .catch((error) => {
      console.log('Error - List of organizations NOT received', error);
    });
};


// Searches repositories by Stargazers over 10,000 and language: javascript
const reposByStars = () => {
  axios({
    method: 'GET',
    url: 'https://api.github.com/search/repositories?q=stars:>20000+language:javascript?page=1&per_page=100',
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => {
      console.log('Success - List of Repos by Stars received from GH', response);
    })
    .catch((error) => {
      console.log('Error - List of Repos by Stars NOT received', error);
    });
};

// List the Top Repos pull request review comments
const listComments = (url) => {
  axios({
    method: 'GET',
    url: `${url}/issues/comments?page=1&per_page=100`,
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  })
    .then((response) => {
      console.log('Success - List of Repos by Stars received from GH', response);
    })
    .catch((error) => {
      console.log('Error - List of Repos by Stars NOT received', error);
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
