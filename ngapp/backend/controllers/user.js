const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.CreateUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: "User created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Invalid Authentication Credentials!"
        });
      });
  });
};

//Async Promise implimentation

exports.UserProfile = async (req, res, next) => {
  const userId = req.auth.userId;
  try {
    const userData = await User.findOne({ _id: userId }).select("-password");

    if (!userData) {
      throw "User id not valid";
    }

    return res.status(200).json({
      user: userData
    });
  } catch (err) {
    console.error(err);

    if (typeof err == "string") {
      return res.status(404).json({
        message: err,
        error_code: 1
      });
    }

    return res.status(400).json({
      message: "User not found",
      err: err,
      error_code: 2
    });
  }
};

exports.UserLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed us"
        });
      }

      fetchedUser = JSON.parse(JSON.stringify(fetchedUser));
      delete fetchedUser.password;

      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        user: fetchedUser
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid Authentication Credentials!"
      });
    });
};
