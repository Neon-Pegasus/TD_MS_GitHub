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
  // repoId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
});

const Repo = githubDb.define('Repo', {
  repoId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  repoName: { type: Sequelize.STRING },
  commentsBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  repoStargazers: { type: Sequelize.INTEGER },
  updatedAt: { type: Sequelize.DATE },
  // userId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
});

const TopRepo = githubDb.define('TopRepo', {
  topId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  topRepoName: { type: Sequelize.STRING },
  topCommentsBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  topRepoStargazers: { type: Sequelize.INTEGER },
  updatedAt: { type: Sequelize.DATE },
  // orgId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
});

const Organization = githubDb.define('Organizations', {
  orgId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  orgName: { type: Sequelize.STRING, unique: { args: true, message: 'orgName must be unique', fields: [Sequelize.fn('lower', Sequelize.col('orgName'))] } },
  orgStargazers: { type: Sequelize.INTEGER },
  // topId: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
});


githubDb.sync()
  .then(() => {
    User.create({})
      .then(() => {
        Repo.create({})
          .then(() => {
            TopRepo.create({})
              .then(() => {
                Organization.create({})
                  .then(() => {});
              });
          });
      });
  });

// Relations
User.hasMany(Repo);
Repo.belongsTo(User);
Organization.hasMany(TopRepo);
TopRepo.belongsTo(Organization);

module.exports.User = User;
module.exports.Repo = Repo;
module.exports.TopRepo = TopRepo;
module.exports.Organization = Organization;


/**
 * The model represents a table in the datbase.
 * Organization is a table for a list of Organization (like google).
 * The reviews for the organizations, and users are found within org repos.
 *
 */
