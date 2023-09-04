import { Request, Response, NextFunction } from "express";
import UserModel from "../data/user.data";
import { generateToken } from "../utils/jwt.utils";
import { emailSend } from "../Email/email.sender";
import { otpGenerate } from "../Email/otp.generator";
import OtpModel from "../data/otp.data";

export const register = (req: Request, res: Response, next: NextFunction) => {
  try {
    UserModel.create({
      username: req.body.username,
      password: req.body.password,
    })
      .then((result) => {
        if (result) {
          const otpData = otpGenerate();
          const emailText =
            req.body.username +
            " has succesfully registered. OTP code is " +
            otpData.otp;
          OtpModel.create({
            username: result.username,
            otp: otpData.otp,
            expritaionTime: otpData.expirationTime,
          }).then((resultForOtp) => {
            if (resultForOtp) {
              //@TODO Please put your email here or email address u wanna send email
              emailSend("tamaayerdogdu@gmail.com", "User Auth", emailText, res);
            }
          });
        }
      })
      .catch((exception) => {
        console.error(exception);
        res.sendStatus(500);
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const userModel = UserModel.findOne({
    username: req.body.username,
    password: req.body.password,
    isDeleted: false,
  })
    .then((value) => {
      if (value) {
        return generateToken({
          username: req.body.username,
          isAdmin: value.isAdmin,
          userId: undefined,
        });
      } else {
        res.sendStatus(500);
      }
    })
    .then((jwtToken) => {
      //header
      res
        .cookie("token", jwtToken ?? "")
        .setHeader("token", jwtToken ?? "")
        .sendStatus(200);
    })
    .catch((exception) => {
      console.error(exception);
      res.sendStatus(500);
    });
};

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  UserModel.updateOne({ username: req.body.username }, { isDeleted: true })
    .then((result) => {
      console.log(result);

      if (result) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    })
    .catch((exception) => {
      console.error(exception);
      res.sendStatus(500);
    });
};

//TODO Update user - not restirected to give all attributes (Middleware)

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, newPassword, isAdmin } = req.body;
    const updateFields: any = {};

    updateFields.password = newPassword ? newPassword : undefined;

    updateFields.isAdmin = isAdmin !== undefined ? isAdmin : undefined;

    const updatedUser = await UserModel.findOneAndUpdate(
      { username, isDeleted: false },

      { $set: updateFields },

      { new: true }
    );

    if (updatedUser) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
};
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageIndex = parseInt(req.query.pageIndex as string);
    const pageSize = parseInt(req.query.pageSize as string);

    if (isNaN(pageIndex) || isNaN(pageSize)) {
      return res
        .status(400)
        .json({ error: "Geçersiz pageIndex veya pageSize" });
    }

    const users = await UserModel.find()
      .skip(pageIndex * pageSize)
      .limit(pageSize);

    if (!users) {
      return res.status(404).json({ error: "Kullanıcılar bulunamadı." });
    }

    const nextPage =
      "http://localhost:8000/user/getUsers?pageIndex=" +
      (pageIndex + 1) +
      "&pageSize=" +
      pageSize;

    res.setHeader("_link", nextPage).json({ data: users });
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.sendStatus(500);
  }
};
