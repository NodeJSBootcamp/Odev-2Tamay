import { Request, Response, NextFunction } from "express";
import UserModel from "../data/user.data";
import { generateToken } from "../utils/jwt.utils";

export const register = (req: Request, res: Response, next: NextFunction) => {
  try {
    UserModel.create({
      username: req.body.username,
      password: req.body.password,
    })
      .then((result) => {
        if (result) {
          res.sendStatus(200);
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
      if (jwtToken) res.json({ token: jwtToken });
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
    //HTTP isteğinden gelen req  ve body özelliğinden gelen verileri ayrıştırarak değişkenlere atama.
    const { username, newPassword, isAdmin } = req.body;
    const updateFields: any = {};

    //yeni şifre tanımlıysa güncelleme yapılabilir.
    updateFields.password = newPassword ? newPassword : undefined;

    //isAdmin tanımlıysa ve undefined değilse, güncellenebilir.
    updateFields.isAdmin = isAdmin !== undefined ? isAdmin : undefined;

    //finOneAndUpdate yöntemi, kullanıcı adına ve silinmemiş olma durumuna göre güncelleme yapar.
    //Yeni güncellenmiş kullanıcı bilgilerini döndürür.
    const updatedUser = await UserModel.findOneAndUpdate(
      //kullanıcı adı ve silinmemiş durumu sorgular.
      { username, isDeleted: false },
      //mongoose içerisinde güncellencek alanı belirler.
      { $set: updateFields },
      //yeni güncellenmiş kullanıcı döner.
      { new: true }
    );
    //Güncellenmiş bilgi JSON olarak döner eğer güncellenmemişse boş döner.
    if (updatedUser) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    //genel hata sonucu hatayı yazdırır ve boş JSON döndürür.
    console.error(error);
    res.status(500).json({});
  }
};
