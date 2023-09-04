import mongoose from "mongoose";
import { randomUUID } from "crypto";

const Schema = mongoose.Schema;


const TweetSchema = new Schema({
  tweetId: {
    type: "UUID",
    default: () => randomUUID(),
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tweet: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },


  likedBy: [
    {
      userId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
  ],

  comments: [
    {
      userId: {
        type: String,
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});


export const TweetModel = mongoose.model("Tweets", TweetSchema);
