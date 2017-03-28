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

        document.getElementById('sendImage').addEventListener('change',function(){//发送图片
            if(this.files.length!=0){//检查是否有文件被选中
                var file=this.files[0],//获取文件并用FileReader进行读取
                    reader=new FileReader();
                if(!reader){
                    _this._displayNewMsg('system','你的浏览器不支持FileReader','red');
                    this.value='';
                    return;
                };
                reader.onload=function(e){//读取成功，显示到页面并发送到服务器
                  this.value='';
                  _this.socket.emit('img',e.target.result);
                  _this._displayImage('me',e.target.result);
                };
                reader.readAsDataURL(file);
            };
        },false);

        this.socket.on('newImg',function(user,img){//接收显示图片
            _this._displayImage(user,img);
        });
    },

    _displayNewMsg:function(user,msg,color){ //显示信息函数
        var container=document.getElementById('historyMsg'),
            msgToDisplay=document.createElement('p'),
            data=new Date().toTimeString().substr(0,8);

        msgToDisplay.style.color=color||'#000';
        msgToDisplay.innerHTML=user+'<span class="timespan">('+data+'):</span>'+msg;
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },

    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};