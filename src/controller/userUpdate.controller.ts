import { Request, Response, NextFunction} from "express"
import UserModel from "../data/user.data"
import OtpUserSettingsModel from "../data/otpSet.data"
import { emailSend } from "../Email/email.sender"
import { otpGenerate } from "../Email/otp.generator"
import { verifyToken } from "../utils/jwt.utils"

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtToken = req.headers["authorization"] as string;
    const verifyTokenResult = verifyToken(jwtToken);
    const userName = verifyTokenResult.username;
    const otpData = otpGenerate();
    const emailText = `${userName} has successfully registered for user settings change. OTP code is ${otpData.otp}`;

    const user = await UserModel.findOne({ username: userName });

    if (user) {
      const resultForOtp = await OtpUserSettingsModel.create({
        username: userName,
        otp: otpData.otp,
        expritaionTime: otpData.expirationTime,
      });

      if (resultForOtp) {
        await emailSend(user.email, "User Auth", emailText, res);
        return res.sendStatus(200);
      } else {
        return res.sendStatus(500); // OTP oluşturulamadı
      }
    } else {
      return res.sendStatus(404); // Kullanıcı bulunamadı
    }
  } catch (error) {
    console.error("Hata oluştu:", error);
    return res.sendStatus(500);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jwtToken = req.headers["authorization"] as string;
      const verifyTokenResult = verifyToken(jwtToken);
      const userName = verifyTokenResult.username;
      const settings = req.body;
  
      const otpUserSettings = await OtpUserSettingsModel.find({ username: userName }).sort({ expritaionTime: -1 });
  
      if (otpUserSettings.length > 0) {
        const latestOtpSetting = otpUserSettings[0];
        if (req.body.otpCode === latestOtpSetting.otp && Date.parse(latestOtpSetting.expritaionTime) > new Date().getTime()) {
          const responseOtpDelete = await OtpUserSettingsModel.deleteMany({ username: userName });
  
          if (responseOtpDelete) {
            const user = await UserModel.findOne({ username: userName });
  
            if (user) {
              await user.updateOne(settings);
              return res.sendStatus(200);
            } else {
              return res.sendStatus(401); // Kullanıcı bulunamadı
            }
          } else {
            return res.sendStatus(501); // OTP ayarları silinemedi
          }
        } else {
          return res.sendStatus(500); // OTP doğrulaması başarısız
        }
      } else {
        return res.sendStatus(500); // OTP ayarı bulunamadı
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
      return res.sendStatus(500);
    }
  };
  