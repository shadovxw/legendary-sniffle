'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Participant.init({
    token: DataTypes.STRING,
    name: DataTypes.STRING,
    assignedTo: DataTypes.STRING,
    revealed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Participant',
  });
  return Participant;
};