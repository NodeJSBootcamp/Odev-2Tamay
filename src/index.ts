import express from "express"
import http from 'http';
import socketIo from 'socket.io';
import { createSocketConnection } from "./Chat/chat";

const app = express()
app.use(express.json())
const server = http.createServer(app);
const io = new socketIo.Server(server);

var socketMap= new Map<string, socketIo.Namespace>();
export { socketMap, io }; 

import userRouter from "./router/user.router"
import tweetRouter from "./router/tweet.router"
import chatRouter from "./router/chat.router"

app.use("/user",userRouter)
app.use("/tweet",tweetRouter)
app.use("/chat",chatRouter)

export default server