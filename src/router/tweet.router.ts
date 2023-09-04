import express from "express";
import * as tweetController from "../controller/tweet.controller";
import {
  authtenticateForUser,
  authtenticateForAll

} from "../middleware/authentication.middleware";


const tweetRouter = express.Router();


tweetRouter.post("/create", tweetController.saveTweet);

tweetRouter.post("/update", [authtenticateForUser], tweetController.updateTweet);
tweetRouter.post("/delete", [authtenticateForUser], tweetController.deleteTweet);
tweetRouter.get("/get/all", tweetController.getAllTweets);
tweetRouter.get(
  "/get/usertweet/:username",
  [authtenticateForUser],
  tweetController.getUserTweets
);
tweetRouter.post(
  "/add/like",
 [authtenticateForAll],
  tweetController.likeTweet
);
tweetRouter.post(
  "/add/comment",
[authtenticateForAll] ,
  tweetController.addCommentToOwnTweet
);


export default tweetRouter;
