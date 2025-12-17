import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Admin = sequelize.define("Admin", {
  username: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Admin;
