require("dotenv").config();
const { users } = require("../../models");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  // 일반 회원가입
  generalSignUp: async (req, res) => {
    /* 
        1. body값에서 user_email, password, nickname, user_type 구조분해 할당으로 받기
        2. 파라미터 중에서 하나라도 빠지면 422
        3. 아니라면 findOrCreate로 db에 유저 정보 저장 (패스워드는 암호화된 상태로 저장)
        4. 이미 존재하는 이메일이라면 409
        5. 201 ok
        */
    try {
      const { userEmail, password, nickname, userType } = req.body;
      console.log(userEmail, password, nickname, userType);

      if (!userEmail || !password || !nickname || !userType) {
        return res
          .status(422)
          .json({ message: "insufficient parameters supplied" });
      }
      // password 암호화 작업
      // cryptojs 복호화
      let byte = CryptoJS.AES.decrypt(password, process.env.CRYPTOJS_SECRETKEY);
      console.log("byte:", JSON.parse(byte.toString(CryptoJS.enc.Utf8)));
      // console.log("byte2:", byte.toString(CryptoJS.enc.Utf8));
      const decryptedPassword = JSON.parse(byte.toString(CryptoJS.enc.Utf8));
      // byte.toString(CryptoJS.enc.Utf8);
      console.log("password:", decryptedPassword);
      // bcrypt 재암호화
      const salt = await bcrypt.genSalt(saltRounds);
      console.log("salt:", salt);
      const encryptedPassword = await bcrypt.hash(decryptedPassword, salt);
      console.log("encrypted:", encryptedPassword);

      const data = await users.findOne({
        where: {
          user_email: userEmail,
        },
      });
      console.log("data:", data);
      if (data) {
        return res.status(409).json({ message: "email exists" });
      } else {
        const info = await users.create({
          user_email: userEmail,
          password: encryptedPassword,
          nickname: nickname,
          user_type: userType,
        });
        console.log("info:", info);
        return res.status(201).json({ message: "sign-up ok" });
      }
    } catch (error) {
      console.log(error);
    }
  },
  // 작가 회원가입
  authorSignUp: (req, res) => {
    const { authorEmail, password, name, authorDesc, userType } = req.body;
    console.log(authorEmail, password, name, authorDesc, userType);

    if (!authorEmail || !password || !name || !userType || !authorDesc) {
      return res
        .status(422)
        .json({ message: "insufficient parameters supplied" });
    }
    // password 암호화 작업
    // cryptojs 복호화
    let byte = cryptoJS.AES.decrypt(password, process.env.CRYPTOJS_SECRETKEY);
    console.log("byte:", byte);
    password = JSON.parse(byte.toString(cryptoJS.enc.Utf8)).password;
    console.log("password:", password);
    // bcrypt 재암호화
    const salt = bcrypt.genSalt(saltRounds);
    password = bcrypt.hash(password, salt);

    users
      .findOrCreate({
        where: {
          user_email: authorEmail,
        },
        default: {
          password: password,
          nickname: name,
          user_type: userType,
        },
      })
      .then(([result, created]) => {
        if (!created) {
          return res.status(409).json({ message: "email exists" });
        }
        const data = result.dataValues;
        console.log("userinfo:", data);
        return res.status(201).json({ message: "sign-up ok" });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
