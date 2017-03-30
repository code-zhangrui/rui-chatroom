//设置服务器、框架
var express=require('express'),
    app=express(),
    server=require('http').createServer(app),
    io=require('socket.io').listen(server);  //一层包一层
    users=[]; //在线用户

app.use('/',express.static(__dirname+'/src'));
server.listen(4000);

//连接了以后干什么
//socket表示的是当前连接到服务器的那个客户端
//所以代码socket.emit('foo')则只有自己收得到这个事件
//而socket.broadcast.emit('foo')则表示向除自己外的所有人发送该事件
//上面代码中，io表示服务器整个socket连接
//所以代码io.sockets.emit('foo')表示所有人都可以收到该事件
io.on('connection',function(socket){
    socket.on('login',function(nickname){ //设置昵称
        if(users.indexOf(nickname)>-1){
            socket.emit('nickExisted');
        }else{
            socket.userIndex=users.length; //因为是数组最后一个元素，所以索引就是数组的长度users.length
            socket.nickname=nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system',nickname,users.length,'login');//向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });
    socket.on('disconnect',function(){//断开事件
        users.splice(socket.userIndex,1);
        socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    });

    socket.on('postMsg',function(msg,color){//接收发送聊天
        socket.broadcast.emit('newMsg',socket.nickname,msg,color);
    });

    socket.on('img',function(imgData){//接收发送图片
        socket.broadcast.emit('newImg',socket.nickname,imgData);
    });

    socket.on('askUsers',function(){//++接收访客名单请求
        socket.emit('showUsers',users);//++输出访客名单
    });

    // socket.on('askRename',function(){//++接收改名请求
    //     socket.emit('rename',users);//++
    // });
});




