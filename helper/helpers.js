const request = require('request-promise');
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
const getRepoComments = (url) => {
  const options = {
    method: 'GET',
    url: `${url}/issues/comments`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};


const getOrgRepos = (url) => {
  const options = {
    method: 'GET',
    url: `${url}`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};


const getOrgInfo = (orgName) => {
  const options = {
    method: 'GET',
    url: `https://api.github.com/users/${orgName}`,
    json: true,
    headers: {
      'User-Agent': 'request',
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
  };
  return request(options);
};


module.exports.getOrgInfo = getOrgInfo;
module.exports.getOrgRepos = getOrgRepos;
module.exports.getReposByUser = getReposByUser;
module.exports.listCommentsInARepo = listCommentsInARepo;
module.exports.reposByStars = reposByStars;
module.exports.getRepoComments = getRepoComments;


/**
 * These helper functions are used to query data from the Github API.
 */
