import express from "express";
import * as tweetController from "../controller/tweet.controller";
import {
  authenticateForUser,
  authenticateExceptUser,
} from "../middleware/authentication.middleware";

//Express router nesnesi oluşturuluyor
const tweetRouter = express.Router();

// Yeni bir tweet oluşturmak için POST isteği 
tweetRouter.post("/create", tweetController.saveTweet);
// Bir tweet'i güncellemek için POST isteği 
tweetRouter.post("/update", [authenticateForUser], tweetController.updateTweet);
tweetRouter.post("/delete", [authenticateForUser], tweetController.deleteTweet);
tweetRouter.get("/get/all", tweetController.getAllTweets);
tweetRouter.get(
  "/get/usertweets",
  [authenticateForUser],
  tweetController.getUserTweets
);
tweetRouter.post(
  "/add/like",
  [authenticateExceptUser],
  tweetController.likeTweet
);
tweetRouter.post(
  "/add/comment",
  [authenticateExceptUser],
  tweetController.addCommentToOwnTweet
);

// Oluşturulan yönlendirici modül olarak dışa aktarılıyor
export default tweetRouter;
