require('dotenv').config();
const Sequelize = require('sequelize');


const githubDb = new Sequelize(`${process.env.DB_URL}`, {
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
});

const Repo = githubDb.define('Repo', {
  repoId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userName: { type: Sequelize.STRING },
  repoName: { type: Sequelize.STRING, allowNull: false },
  commentBody: { type: Sequelize.ARRAY(Sequelize.TEXT), defaultValue: [] },
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
  orgAvatar: { type: Sequelize.TEXT('long') },
  orgBio: { type: Sequelize.TEXT('long') },
  orgStars: { type: Sequelize.INTEGER },
  orgUrl: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
  orgTopRepoUrl: { type: Sequelize.TEXT('long') },
  orgTopRepoName: { type: Sequelize.TEXT('long') },
  orgTopRepoStars: { type: Sequelize.INTEGER },
  orgTopRepoComments: { type: Sequelize.ARRAY(Sequelize.TEXT('long')) },
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
User.hasMany(Repo, { foreignKey: 'userId' });
Repo.belongsTo(User, { foreignKey: 'userId' });


module.exports.User = User;
module.exports.Repo = Repo;
module.exports.Organization = Organization;


/**
 * The model represents a table in the datbase.
 * Organization is a table for a list of Organization (like google).
 * The reviews for the organizations, and users are found within org repos.
 *
 */
