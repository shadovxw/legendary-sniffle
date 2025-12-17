import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const AppState = sequelize.define("AppState", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default AppState;
