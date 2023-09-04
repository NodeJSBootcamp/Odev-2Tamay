import { Request, Response, NextFunction } from "express";
import ChatModel from "../data/chat.data";
import UserModel from "../data/user.data";
import { socketMap, io } from "../index";
import { verifyToken } from "../utils/jwt.utils";

//Group Oluşturma ve MongoDB ile Saklama
export const createGroup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { groupName } = req.body;
    const jwtToken = req.headers["authorization"] as string;
    const verifyTokenResult = verifyToken(jwtToken);
    const adminUserName = verifyTokenResult.username;

    ChatModel.create({
      groupName: groupName,
      admin: adminUserName, //grup yöneticisi kullanıcı adı kaydedilir.
      users: [],
    }).then((response) => {
      if (response) {
        const groupId = response._id.toString(); //_id ile bir socket baglantisi

        let namespace = io.of("/" + groupId);

        namespace.on("connection", function (socket) {
          //sadece group admini mesaj atabilir.
          socket.on("messageFromAdmin", (message) => {
            if (socket.handshake.headers.userName === adminUserName) {
              socket.send(message);
            }
          });
        });

        socketMap.set(groupId, namespace); //grup ile ilgili bilgiler kaydedilir.

        res.json({ chatID: groupId });
      } else {
        res.sendStatus(500);
      }
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const addUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtToken = req.headers["authorization"] as string;
    const verifyTokenResult = verifyToken(jwtToken);
    const clientUserName = verifyTokenResult.username;
    const userID = req.body.userID;
    ChatModel.findOne({ groupName: req.body.groupName }).then((response) => {
      if (response?.admin === clientUserName) {
        response.users.push(userID);
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const leaveGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwtToken = req.headers["authorization"] as string;
    const verifyTokenResult = verifyToken(jwtToken);
    const userName = verifyTokenResult.username;

    const user = await UserModel.findOne({ username: userName });
    if (!user) {
      return res.status(404).send("Kullanıcı bulunamadı.");
    }

    const userID = user._id;
    const chat = await ChatModel.findOne({ groupName: req.body.groupName });

    if (!chat) {
      return res.status(404).send("Grup bulunamadı.");
    }

    if (chat.admin === userName) {
      chat.users = chat.users.filter((id) => id != userID);
      await chat.save();
      return res.sendStatus(200);
    } else {
      return res.status(403).send("Bu işlemi gerçekleştirmeye yetkiniz yok.");
    }
  } catch (error) {
    console.error("Hata oluştu:", error);
    res.sendStatus(500);
  }
};
