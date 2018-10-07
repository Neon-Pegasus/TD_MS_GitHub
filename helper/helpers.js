const request = require('request-promise');
require('dotenv').config();


const request = () => {
  request.get(options, function(err, res) {
    if (err) {
      console.log('Error - request to api failed');
    } else {
      console.log('Success- retrieved Repos');
      callback(res.body);
    }
  })
}

//GET: user's repos from github
const getReposByUsername = (username, callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/users/${username}/repos`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
    }
  }
  return request(options);
};

//Get: User's comments by Repos
const listCommentsInARepository = (username, repo, callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/repos/${username}/${repo}/pulls/comments`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
    }
  }
  return request(options);
};

//GET: Github Organizations
const listOrganizations = (callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/organizations`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
    }
  }
  return request(options);
};

//GET: organizations members 
const listOrgsMembers = (org, callback) => {
  let options = {
    method: 'GET',
    url: `https://api.github.com/orgs/${org}/members`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
    }
  }
  return request(options);
};

//GET: Search repositories by stargazers 
const reposByStars = (callback) => {
  let options = {
    method: 'GET',
    url: 'https://api.github.com/search/repositories/stars:>10000 fork:true language:javascript',
    headers: {
      'User-Agent': 'request',
      'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
    }
  }
  return request(options);
};

module.exports.getReposByUsername = getReposByUsername;
module.exports.listCommentsInARepository = listCommentsInARepository;
module.exports.listOrganizations = listOrganizations;
module.exports.listOrgMembers = listOrgsMembers;
module.exports.reposByStars = reposByStars;