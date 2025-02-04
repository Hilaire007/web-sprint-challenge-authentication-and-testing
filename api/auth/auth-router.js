const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { insert, getByUsername } = require("../users/user-model");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function validateUser(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json("username and password required");
  }
  next();
}

router.post("/register", validateUser, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const existingUser = await getByUsername(username);
    if (existingUser) {
      return res.status(400).json("username taken");
    }

    const rounds = 8;
    const hash = bcrypt.hashSync(password, rounds);
    const userToInsert = { username, password: hash };

    const newUser = await insert(userToInsert);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post("/login", validateUser, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await getByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json("invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: `welcome, ${user.username}`, token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
