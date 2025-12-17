import app from "./app.js";
import sequelize from "./db.js";
import Admin from "./models/Admin.js";
import AppState from "./models/AppState.js";

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();

  await Admin.findOrCreate({
    where: { username: "admin" },
    defaults: { password: "santa2025" }
  });

  await AppState.findOrCreate({
    where: { id: 1 },
    defaults: { locked: false }
  });

  app.listen(PORT, () =>
    console.log(`🚀 Server running on ${PORT}`)
  );
}

start();
