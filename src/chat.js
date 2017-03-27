window.onload=function(){
    var chatroom=new Chatroom();
    chatroom.init();
};

var Chatroom=function(){
    this.socket=null;
};

Chatroom.prototype={
    init:function(){
        var _this=this;
        this.socket=io.connect();//建立连接

        this.socket.on('connect',function(){//连接以后干啥
            document.getElementById('info').textContent= 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        document.getElementById('loginBtn').addEventListener('click',function(){
            var nickName=document.getElementById('nicknameInput').value;
            if(nickName.trim().length!=0){
                _this.socket.emit('login',nickName);
            }else{
                document.getElementById('nicknameInput').focus();
            };
        },false);

        this.socket.on('nickExisted',function(){
            document.getElementById('info').textContent='昵称已被占用!'
        });

        this.socket.on('loginSuccess',function(){
            document.title="聊天室|"+document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });

        this.socket.on('system',function(nickName, userCount, type){//判断system信息的类别
            var msg=nickName+(type=='login'?'加入':'离开');
            _this._displayNewMsg('system',msg,'red');
            document.getElementById('status').textCount=userCount+(userCount>1?'users':'user')+'online';
        });

        this.socket.on('newMsg',function(user,msg){
            _this._displayNewMsg(user,msg);
        })

        document.getElementById('sendBtn').addEventListener('click',function(){//发送聊天
            var messageInput=document.getElementById('messageInput'),
                msg=messageInput.value;
            messageInput.value='';
            messageInput.focus();
            if(msg.trim().length!=0){
                _this.socket.emit('postMsg',msg);//给服务器的
                _this._displayNewMsg('me',msg);//给自己的
            };
        },false);
    },

    _displayNewMsg:function(user,msg,color){ //显示信息函数
        var container=document.getElementById('historyMsg'),
            msgToDisplay=document.createElement('p'),
            data=new Date().toTimeString().substr(0,8);

        msgToDisplay.style.color=color||'#000';
        msgToDisplay.innerHTML=user+'<span class="timespan">('+data+'):</span>'+msg;
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    }
};