require('dotenv').config();
const Sequelize = require('sequelize');

const dbUrl = 'postgres://onrvsfoe:YLeKOk6VJ9sAvlhrP5pjJOPTskQgKsGb@tantor.db.elephantsql.com:5432/onrvsfoe';


const githubDb = new Sequelize(`${dbUrl}`);


githubDb
  .authenticate()
  .then(() => {
    console.log('Connected to Github DB');
  })
  .catch((err) => {
    console.error('Unable to connect to Github DB', err);
  });

const User = githubDb.define('User', {
  userId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userName: { type: Sequelize.STRING, unique: { args: true, message: 'username must be unique', fields: [Sequelize.fn('lower', Sequelize.col('username'))] } },
  repoNameList: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  repoIdList: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
  orgIdList: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
});

const Repo = githubDb.define('Repo', {
  repoId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
  orgId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
  repoName: { type: Sequelize.STRING },
  repoStargazers: { type: Sequelize.INTEGER },
  pullRequestBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  reviewsBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  commentsBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  updatedAt: { type: Sequelize.DATE },
});

const Organizations = githubDb.define('Organizations', {
  orgId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  orgName: { type: Sequelize.STRING, unique: { args: true, message: 'orgName must be unique', fields: [Sequelize.fn('lower', Sequelize.col('orgName'))] } },
  orgStargazers: { type: Sequelize.INTEGER },
  userId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
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
