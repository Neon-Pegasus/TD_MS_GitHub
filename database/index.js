require('dotenv').config();
const Sequelize = require('sequelize');


const githubDb = new Sequelize(`${process.env.DB_URL}`, {
  omitNull: true,
  pool: {
    max: 100,
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
  userName: { type: Sequelize.STRING, alloNull: false, unique: { args: true, message: 'username must be unique', fields: [Sequelize.fn('lower', Sequelize.col('userName'))] } },
  repoNameList: { type: Sequelize.ARRAY(Sequelize.TEXT) },
});

const Repo = githubDb.define('Repo', {
  repoId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  repoName: { type: Sequelize.STRING },
  commentsBody: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
  userName: { type: Sequelize.STRING },
  // repoUpdatedAt: { type: Sequelize.DATE(10) },
});

const Organization = githubDb.define('Organization', {
  orgId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  },
  orgName: { type: Sequelize.STRING, allowNull: false },
  orgDescription: { type: Sequelize.TEXT('long') },
  orgAvatar: { type: Sequelize.TEXT('long') },
  orgStargazers: { type: Sequelize.INTEGER },
  orgRepo: { type: Sequelize.STRING },
  orgCommentsBody: { type: Sequelize.ARRAY(Sequelize.TEXT('long')) },
  // orgUpdatedAt: { type: Sequelize.DATE },
});


githubDb.sync()
  .then(() => {
    User.create({})
      .then(() => {
        Repo.create({})
          .then(() => {
            Organization.create({})
              .then(() => {});
          });
      });
  });


// Relations
User.hasMany(Repo);
Repo.belongsTo(User);


module.exports.User = User;
module.exports.Repo = Repo;
module.exports.Organization = Organization;


/**
 * The model represents a table in the datbase.
 * Organization is a table for a list of Organization (like google).
 * The reviews for the organizations, and users are found within org repos.
 *
 */
