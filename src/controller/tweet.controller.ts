import { Request, Response, NextFunction } from "express";
import { TweetModel } from "../data/tweet.data";

//---TODO Save tweet

export const saveTweet = (req: Request, res: Response, next: NextFunction) => {
  try {
    TweetModel.create({
      userName: req.body.userName,
      content: req.body.content,
    })
      .then((result) => {
        if (result) {
          res.sendStatus(200);
        }
      })
      .catch((exception) => {
        console.error(exception);
        res.sendStatus(404);
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//---TODO Update tweet - Only the user call (Middleware)
export const updateTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userName = res.locals.username;

    const tweetId = req.body.id as string;

    const updatedContent = req.body.updatedContent;

    //tweeti güncelle
    const updatedTweet = await TweetModel.findOneAndUpdate(
      { tweetId: tweetId, userName: userName, isDeleted: false },

      { tweet: updatedContent },

      { new: true }
    );

    if (updatedTweet) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//---TODO Delete (Soft delete) tweet - Only the user call (Middleware)
export const deleteTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userName = res.locals.username;

    const tweetId = req.body.id as string;

    const deletedTweet = await TweetModel.findOneAndUpdate(
      { tweetId: tweetId, userName: userName, isDeleted: false },
      { new: true }
    );

    if (deletedTweet) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//---TODO Get All tweet
export const getAllTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allTweets = await TweetModel.find({ isDeleted: false });

    if (allTweets) res.status(200).json(allTweets);
    else res.sendStatus(404);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//+++TODO Get User's tweet - Only the user call (Middleware)
export const getUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tweetId = req.body.id as string;

    const userTweets = await TweetModel.find({
      tweetId: tweetId,
      isDeleted: false,
    });

    if (userTweets) res.status(200).json(userTweets);
    else res.sendStatus(404);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//TODO Like tweet tweet - Except from user (Middleware)
export const likeTweet = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userName = res.locals.username;

    const tweetId = req.body.id as string;

    TweetModel.findOneAndUpdate(
      {
        tweetId: tweetId,
        isDeleted: false,
        "likedBy.username": { $ne: userName },
      },
      { $push: { likedBy: { username: userName } } },
      { new: true }
    )
      .then((result) => {
        if (result) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(500);
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

//---TODO Add comment to own tweet
export const addCommentToOwnTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userName = res.locals.username;

    const tweetId = req.body.tweet;

    const tweet = await TweetModel.findById(tweetId);

    if (!tweet) {
      return res.status(404).json();
    }

    if (tweet.userName !== userName) {
      return res
        .status(401)
        .json({ error: "You are not allowed to comment your own tweets" });
    }

    const newComment = {
      userId: userName.userId,
      userName: userName,
      comment: req.body.comment,
    };

    tweet.comments.push(newComment);

    await tweet.save();

    res
      .status(200)
      .json({ status: "success", message: "Comment Added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment to the tweet" });
  }
};
