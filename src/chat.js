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
    }
}