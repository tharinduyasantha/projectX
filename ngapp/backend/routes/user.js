const util = require("util");
const jwt = require("jsonwebtoken");
const express = require("express");

const UserController = require("../controllers/user");

const router = express.Router();

async function verifyToken(req, token) {
  try {
    const verifyFunc = util.promisify(jwt.verify);
    return await verifyFunc(token, process.env.JWT_KEY);
  } catch (err) {
    console.log(err);
    throw "User role not allow";
  }
}
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(req, token)
      .then(decoded => {
        req.auth = decoded;
        next();
      })
      .catch(err => {
        console.error(err);
        res.status(401).send({
          message: "not authorized"
        });
      });
  } catch (err) {
    res.status(400).send({ status: "error", message: "auth token not found" });
    return;
  }
};

router.post("/signup", UserController.CreateUser);

router.post("/login", UserController.UserLogin);
router.get("/userProfile", authMiddleware, UserController.UserProfile);

module.exports = router;
