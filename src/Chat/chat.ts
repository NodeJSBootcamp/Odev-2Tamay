//TODO Group yaraticaz bunu mongo db de sakla
//TODO Group u yaratan kisiyi group admini olarak tutariz. 
//TODO-ODEV Sadece group admini mesaj atabilir.
//TODO-ODEV _id ile bir socket baglantisi yaratilacak

import { Server, Socket } from "socket.io";

export const createSocketConnection = (io:Server) =>{
    let numUsers = 0 
    io.on("connection",(socket:Socket)=>{
        let addedUser = false;
        socket.emit(".net")
        socket.on("add user",(username:string)=>{
           if(addedUser) return
           ++numUsers;
           addedUser = true
           console.log(username + "is connected");
           socket.emit('login',{
            numUsers:numUsers
           })
           socket.broadcast.emit("user joined",{
                username:username,
                numUsers: numUsers
           })
        })
    })
}