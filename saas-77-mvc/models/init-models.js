var DataTypes = require("sequelize").DataTypes;
var _Answers = require("./Answers");
var _Keywords = require("./Keywords");
var _Questions = require("./Questions");
var _Users = require("./Users");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);
  var Questions = _Questions(sequelize, DataTypes);
  var Answers = _Answers(sequelize, DataTypes);
  var Keywords = _Keywords(sequelize, DataTypes);

  Answers.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Answers, { foreignKey: "QuestionsId"});
  Answers.belongsTo(Users, { foreignKey: "UsersId"});
  Users.hasMany(Answers, { foreignKey: "UsersId"});
  Keywords.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Keywords, { foreignKey: "QuestionsId"});
  Questions.belongsTo(Questions, { foreignKey: "UsersId"});
  Questions.hasMany(Questions, { foreignKey: "UsersId"});

  return {
    Users,
    Questions,
    Answers,
    Keywords,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;