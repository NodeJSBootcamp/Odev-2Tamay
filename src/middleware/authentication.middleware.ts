import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";

export const authtenticateForAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jwtToken = req.headers["authorization"] as string;
  const verifyTokenResult = verifyToken(jwtToken);
  if (verifyTokenResult.isAdmin) {
    next();
  } else {
    res.sendStatus(500);
  }
};






export const authenticateForUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //JWT token alınır.
  const jwtToken = req.headers["authorization"] as string;
  //verify token ile doğrulanıyor.
  const verifyTokenResult = verifyToken(jwtToken);

  //verify token doluysa isim res.local e  aktarılır.
  if (verifyTokenResult.username) {
    res.locals.username = verifyTokenResult.username;
    //bir sonraki middleware geçmeyi sağlar
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const authenticateExceptUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //JWT token alınır.
  const jwtToken = req.headers["authorization"] as string;
  //verify token ile doğrulanıyor.
  const verifyTokenResult = verifyToken(jwtToken);

  //
  if (verifyTokenResult.username != res.locals.username) {
    //bir sonraki middleware geçmeyi sağlar
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
