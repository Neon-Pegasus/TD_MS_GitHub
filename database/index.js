require('dotenv').config();
const Sequelize = require('sequelize');


const githubDb = new Sequelize(`${process.env.DB_URL}`, {
  omitNull: true,
  pool: {
    max: 10,
    min: 2,
    idle: 10000,
  },
});


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
});

const Repo = githubDb.define('Repo', {
  repoId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  repoName: { type: Sequelize.STRING, unique: { args: true, message: 'username must be unique', fields: [Sequelize.fn('lower', Sequelize.col('repoName'))] } },
  commentsBody: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
  userName: { type: Sequelize.STRING },
  // repoUpdatedAt: { type: Sequelize.DATE(10) },
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
  // topUpdatedAt: { type: Sequelize.DATE },
});

const Organization = githubDb.define('Organizations', {
  orgId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  },
  orgName: { type: Sequelize.STRING, unique: { args: true, message: 'orgName must be unique', fields: [Sequelize.fn('lower', Sequelize.col('orgName'))] } },
  orgDescription: { type: Sequelize.STRING },
  orgAvatar: { type: Sequelize.STRING },
  orgStargazers: { type: Sequelize.INTEGER },
  orgRepo: { type: Sequelize.STRING },
  orgCommentsBody: { type: Sequelize.ARRAY(Sequelize.TEXT) },
  // orgUpdatedAt: { type: Sequelize.DATE },
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
