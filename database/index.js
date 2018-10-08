require('dotenv').config();
const Sequelize = require('sequelize');

let db_url = '';


const githubDb = new Sequelize(`${db_url}`);


githubDb
  .authenticate()
  .then(() => {
    console.log('Connected to Github DB');
  })
  .catch((err) => {
    console.error('Unable to connect to Github DB', err);
  });

const User = githubDb.define('User', {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userName: Sequelize.STRING,
  repo_id_list: Sequelize.Array(Sequelize.Text),
  org_id_list: Sequelize.Array(Sequelize.Text),
});

const Repo = githubDb.define('repo', {
  repo_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: Sequelize.Arry(Sequelize.Text),
  org_id: Sequelize.Arry(Sequelize.Text),
  repoName: Sequelize.STRING,
  repo_stargazers: Sequelize.INTEGER,
  pullRequestBody: Sequelize.Array(Sequelize.Text),
  reviewsBody: Sequelize.Array(Sequelize.Text),
  commentsBody: Sequelize.Array(Sequelize.Text),
  updatedAt: Sequelize.DATE,
});

const Organizations = githubDb.define('Organizations', {
  org_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  org_name: Sequelize.STRING,
  org_stargazers: Sequelize.INTEGER,
  user_id: Sequelize.Arry(Sequelize.Text),
});


githubDb.sync()
  .then(() => {
    User.create({})
      .then(() => {
        Repo.create({})
          .then(() => {
            Organizations.create({})
              .then(() => {});
          });
      });
  });


module.exports.User = User;
module.exports.Repo = Repo;
module.exports.Organizations = Organizations;


/**
 * The model represents a table in the datbase.
 * Organization is a table for a list of Organization (like google).
 * The reviews for the organizations, and users are found within org repos.
 *
 */
