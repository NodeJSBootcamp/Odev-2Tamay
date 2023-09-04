import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
    {
        isGroupChat: {
            type: Boolean,
            default: false,
          },
        admin:{
            type:String,
            required:true
        },
        users:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ],
    }
)

const ChatModel = mongoose.model('Chat',ChatSchema)

export default ChatModel;