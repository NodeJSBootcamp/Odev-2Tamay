import mongoose from "mongoose";
import { randomUUID } from "crypto";

//mongoose kullanılaeak yeni bir şema oluşturulması.
const Schema = mongoose.Schema;

//şema tanımlaması buradan başlıyor.
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

  //bu alanda likes dizininde, userId ve usrname alanlatı içeren neseneler bulanacak.
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

//Tweets adında mongoose modeli oluşturuluyor.
export const TweetModel = mongoose.model("Tweets", TweetSchema);
