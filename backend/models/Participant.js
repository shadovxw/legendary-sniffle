import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Participant = sequelize.define("Participant", {
  token: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.STRING
  },
  revealed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Participant;
