const db = require("../../data/dbConfig");

module.exports = {
  insert,
  getByUsername,
};

async function insert(user) {
  const [id] = await db("users").insert(user);
  return db("users").where({ id }).first();
}

function getByUsername(username) {
  return db("users").where({ username }).first();
}
