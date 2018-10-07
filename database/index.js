const Sequelize = require('sequelize');
require('dotenv').config();

const githubDb = new Sequelize(`${process.env.DB}`);

githubDb
  .authenticate()
  .then(() => {
    console.log('Connected to Github DB');
  })
  .catch((err) => {
    console.error('Unable to connect to Github DB', err);
  });

const User = githubDb.define('User', {
  userName: Sequelize.STRING,
  full_Name: Sequelize.STRING,
  pullRequestTitle: Sequelize.STRING,
  pullRequestBody: Sequelize.STRING,
  reviewsBody: Sequelize.STRING,
  commentsBody: Sequelize.STRING,
});

const Repo = githubDb.define('repo', {
  repositoryName: Sequelize.STRING,
  description: Sequelize.STRING,
  stargazers: Sequelize.INTEGER,
  pullRequestTitle: Sequelize.STRING,
  pullRequestBody: Sequelize.STRING,
  reviewsState: Sequelize.STRING,
  reviewsBody: Sequelize.STRING,
  commentsBody: Sequelize.STRING,
  updatedAt: Sequelize.DATE,
});

const Organizations = githubDb.define('Organizations', {
  org_name: Sequelize.STRING,
  stargazers: Sequelize.INTEGER,
});

const OrgMembers = githubDb.define('OrgMembers', {
  org_Name: Sequelize.STRING,
  members_name: Sequelize.STRING,
  description: Sequelize.STRING,
  stargazers: Sequelize.INTEGER,
  pullRequestTitle: Sequelize.STRING,
  pullRequestBody: Sequelize.STRING,
});

githubDb.sync()
  .then(() => {
    User.create({})
      .then(() => {
        Repo.create({})
          .then(() => {
            Organizations.create({})
              .then(() => {
                OrgMembers.create({})
                  .then(() => {});
              });
          });
      });
  });


module.exports.User = User;
module.exports.Repo = Repo;
module.exports.Organizations = Organizations;
module.exports.OrgMembers = OrgMembers;

/**
 * The model represents a table in the datbase.
 * Organization is a table for a list of Organization (like google).
 * OrgMembers is a table for the Members of an Organization(like google) and their reviews.
 */
