const UserModel = require("../models/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthController = {
  signup: async (req, res) => {
    try {
      let body = req.body;
      let obj = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
      };

      let existingUser = await UserModel.findOne({
        email: obj.email,
      });

      if (existingUser) {
        res.status(409).send({
          isSuccessfull: false,
          data: null,
          message: "User with this Email is already exists",
        });
        return;
      } else {
        obj.password = await bcrypt.hash(obj.password, 10);

        let UserObj = new UserModel(obj);
        UserObj.save()
          .then((result) => {
            res.status(201).send({
              isSuccessfull: true,
              data: result,
              message: "User Created Successfully",
            });
          })
          .catch((err) => {
            res.status(500).send({
              isSuccessfull: false,
              data: null,
              message: "Internal Server Error",
              error:err.message
            });
          });
      }
    } catch (error) {
      res.status(500).send({
        isSuccessfull: false,
        data: null,
        message: "Internal Server Error",
      });
    }
  },

  login: async (req, res) => {
    try {
      let body = req.body;

      let existingUser = await UserModel.findOne({ email: body.email });

      if (!existingUser) {
        res.status(401).send({
          isSuccessfull: false,
          data: null,
          message: "Invalid Credentials",
        });
        return;
      } else {
        let isCorrectPassword = await bcrypt.compare(
          body.password,
          existingUser.password
        );

        if (isCorrectPassword) {
          res.status(200).send({
            isSuccessfull: true,
            data: existingUser,
            token: await jwt.sign(
              { ...existingUser },
              process.env.SECURITY_KEY
            ),
            message: "User Login Successfully",
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        isSuccessfull: false,
        data: null,
        message: "Internal Server Error",
        error:error.message
      });
    }
  },

};

module.exports = AuthController;
