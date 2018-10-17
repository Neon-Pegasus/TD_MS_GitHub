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
  const comments = [];
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
    // .then(result => result.filter(item.author_association === 'MEMBER').map(body => body.body);
    //   });
    // })
    .then((data) => { console.log(data); })
    .then(() => {
      db.Organization.bulkCreate(newArray);
    })
    .then((result) => { console.log(result); console.log('HERE--->', newArray); })
    .catch((error) => { console.log(error); console.log(error.message); });
};

// const queryDatabase = (userName) => {
//   db.User.find({ where: { userName } })
//     .then((data) => {
//       let dataList = data.repoNameList;
//       dataList = dataList.map(item => item.replace(/[\"]/gim, ''));
//       return dataList;
//       })
//       .then((dataList) => {
//         dataList.forEach((repo) => {
//           api.listCommentsInARepo(userName, repo)
//         })
//           .then((unit) => {
//             const repoData = unit.map((repos) => {
//               if (repos.author_association === 'OWNER') {
//                 if (!Array.isArray(repos.body)) {
//                   const array = [repos.body];
//                   db.Repo.create({
//                     repoName: repo,
//                     commentsBody: array,
//                     userName,
//                     updatedAt: repos.updatedAt,
//                   }).then((reposData) => {
//                     console.log('Repo review comments have been saved!', reposData);
//                   }).catch((error) => {
//                     console.log('Error - Repo Review was NOT saved', error);
//                   });
//                 } else {
//                   db.Repo.create({
//                     repoName: repo,
//                     commentsBody: repos.body,
//                   })
//                     .then((result) => {
//                       console.log('Repo review comments have been saved!', result);
//                     })
//                     .catch((error) => {
//                       console.log('Error - Repo Review was NOT saved', error);
//                     });
//                 }
//               }
//             });
//           });
//       });
//     });
// };

// const queryDatabase = (userName) => {
//   const promises = [];
//   return db.User.find({ where: { userName } })
//     .then((data) => {
//       console.log('LINE 117', data);
//       let dataList = data.repoNameList;
//       // ['reponame1', 'reponame1']
//       // dataList = dataList.map(item => item.replace(/[\"]/gim, ''));
//       return dataList;
//     })
//     .then((dataList) => {
//       dataList.forEach((repo) => { 
//         promises.push(api.listCommentsInARepo(userName, repo));
//       });
//       return Promise.all(promises);
//     })
//     .then((data) => {
//       return data.filter((repo) => {
//         return repo.length;
//       });
//     })
// .then((data) => {
//   return data.map((repos) => {
//     if (repos.author_association === 'OWNER') {
//       if (!Array.isArray(repos.body)) {
//         const array = [repos.body];
//         db.Repo.create({
//           repoName: repo,
//           commentsBody: array,
//           userName,
//           updatedAt: repos.updatedAt,
//         }).then((reposData) => {
//           console.log('Repo review comments have been saved!', reposData);
//           return reposData;
//         }).catch((error) => {
//           console.log('Error - Repo Review was NOT saved', error);
//           return error;
//         });
//       } else {
//         db.Repo.create({
//           repoName: repo,
//           commentsBody: repos.body,
//         })
//           .then((result) => {
//             console.log('Repo review comments have been saved!', result);
//             return result;
//           })
//           .catch((error) => {
//             console.log('Error - Repo Review was NOT saved', error);
//             return error;
//           });
//       }
//     }
// s
// };

const getUserData = (userName) => {
  api.getReposByUser(userName)
    .then((results) => {
      const userRepos = results.map(repo => (repo.name));
      return db.User.create({
        userName,
        repoNameList: userRepos,
      });
    })
    .then(() => { queryDatabase(userName); })
    .catch(error => error);
};


// User's repos from GitHub
const getUserRepos = (userName) => {
  db.User.find({ where: { userName } })
    .then((data) => {
      if (!data) {
        return api.getUserData(userName);
      }
      if (data.dataValues.userName) {
        return queryDatabase(userName);
      }
    })
    .then((data) => { res.send(data); console.log(data); })
    .catch((error) => { console.log(error.message); });
};

const getRepoData = (userName) => {
  db.Repo.find({ where: { userName } })
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.send(error.message);
    });
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
  db.User.find({ where: { userName } })
    .then((data) => {
      if (!data) {
        return api.getUserData(userName);
      }
      if (data.dataValues.userName) {
        return queryDatabase(userName);
      }
    })
    .then((data) => { res.send(data); console.log(data); })
    .catch((error) => { res.send(error.message); });
});

// Request for All users repos data and comments
gitServer.get('/api/gateway/github/repo/data', (req, res) => {
  const userName = req.params.userName || 'andrew';
  db.Repo.findAll({ where: { userName } })
    .then((data) => {
      res.send(data);
      console.log(data);
    }).catch((err) => {
      res.send(err.message);
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
  // api.updateUserData();
  getOrgs();
  res.send('Test - HOME PAGE!!!');
});
