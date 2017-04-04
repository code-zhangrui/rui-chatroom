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
            document.getElementById('info').textContent= '选择你的昵称';
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
            _this._displayNewMsg('【系统】',msg,'#43d633');
            document.getElementById('status').textCount=userCount+(userCount>1?'users':'user')+'online';
        });

        this.socket.on('newMsg',function(user,msg,color){
            _this._displayNewMsg(user,msg,color);
        });

        document.getElementById('sendBtn').addEventListener('click',function(){//发送聊天
            var messageInput=document.getElementById('messageInput'),
                msg=messageInput.value;
                color=document.getElementById('colorStyle').value;//获取颜色值
            messageInput.value='';
            messageInput.focus();
            if(msg.trim().length!=0){
                _this.socket.emit('postMsg',msg,color);//给服务器的
                _this._displayNewMsg('你说',msg,color);//给自己的
            };
        },false);

        document.getElementById('sendImage').addEventListener('change',function(){//发送图片//change事件会在input标签内容改变时发生
            if(this.files.length!=0){//检查是否有文件被选中
                var file=this.files[0],//获取文件并用FileReader进行读取
                    reader=new FileReader();//FileReader是HTML 5的一个新接口，提供了一个异步API
                if(!reader){
                    _this._displayNewMsg('system','你的浏览器不支持FileReader','red');
                    this.value='';
                    return;
                };
                reader.onload=function(e){//onload事件是成功读取
                  this.value='';
                  _this.socket.emit('img',e.target.result);//FileReader读取的结果储存在result里
                  _this._displayImage('你说',e.target.result);
                };
                reader.readAsDataURL(file);//将文件读取为DataURL
            };
        },false);

        this.socket.on('newImg',function(user,img,color){//接收显示图片
            _this._displayImage(user,img,color);
        });

        this._initialEmoji();//点击按键显示表情选择框
          document.getElementById('emoji').addEventListener('click', function(e) {
          var emojiwrapper = document.getElementById('emojiWrapper');
          emojiwrapper.style.display = 'block';
          e.stopPropagation();
        }, false);
          document.body.addEventListener('click', function(e) {//点击别处隐藏表情选择框
          var emojiwrapper = document.getElementById('emojiWrapper');
          if (e.target != emojiwrapper) {
          emojiwrapper.style.display = 'none';
          };
        });

        document.getElementById('emojiWrapper').addEventListener('click',function(e){//获取被点击的表情
            var target=e.target;
            if(target.nodeName.toLowerCase()=='img'){
                var messageInput=document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value=messageInput.value+'[emoji:'+target.title+']';
            };
        },false);

        document.getElementById('nicknameInput').addEventListener('keyup',function(e){//回车可以登录
            if(e.keyCode==13){
                var nickName=document.getElementById('nicknameInput').value;
                if(nickName.trim().length!=0){
                    _this.socket.emit('login',nickName);
                };
            };
        },false);
        document.getElementById('messageInput').addEventListener('keyup',function(e){//回车可以发信息
            var messageInput=document.getElementById('messageInput'),
            msg=messageInput.value;
            color=document.getElementById('colorStyle').value;
        if(e.keyCode==13&&msg.trim().length!=0){
            messageInput.value='';
            _this.socket.emit('postMsg',msg,color);
            _this._displayNewMsg('你说',msg,color);
        };
       },false);

       document.getElementById('clearBtn').addEventListener('click', function() {//清除屏幕
            document.getElementById('historyMsg').innerHTML = '';
        }, false);

       document.getElementById('showUsers').addEventListener('click', function() {//++点击请求访客名单
         _this.socket.emit('askUsers');
        }, false);

       this.socket.on('showUsers',function(users){//++接收访客名单
           msg='当前在线成员有：'+users+' 等共'+users.length+'人';
          _this._displayNewMsg('【系统】',msg,'#43d633');//++输出访客名单
      });
      
      document.getElementById('rename').addEventListener('click',function(){//++点击请求改名
            var newName=document.getElementById('newNameInput').value;
            if(newName.trim().length!=0){
                _this.socket.emit('askRename',newName);
            }else{
                document.getElementById('newNameInput').focus();
            };
        },false);

       this.socket.on('renameFail',function(newName){//改名失败
           msg='"'+newName+'"这个名字已被占用，请再想一个吧！';
            _this._displayNewMsg('【系统】',msg,'#43d633');//++改名失败通知
        });

       this.socket.on('rename',function(oldName,newName){//++改名成功
          msg=oldName+'已改名为：'+newName;
          _this._displayNewMsg('【系统】',msg,'#43d633');//++发起改名通知
      });

    },//init
    
    _displayNewMsg:function(user,msg,color){ //显示信息函数
        var container=document.getElementById('historyMsg'),
            msgToDisplay=document.createElement('p'),
            data=new Date().toTimeString().substr(0,8);
            msg=this._showEmoji(msg);//将表情代码转化为图片
        msgToDisplay.style.color=color||'#000';
        msgToDisplay.innerHTML='<img class="emoji" src="emoji/45.gif" />'+user+'<span class="timespan">('+data+'):</span>'+msg;//加了表情
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },

    _displayImage: function(user, imgData, color) {//显示图片函数
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _initialEmoji: function() {//显示表情函数
           var emojiContainer = document.getElementById('emojiWrapper'),
               docFragment = document.createDocumentFragment();
           for (var i = 45; i > 0; i--) {
               var emojiItem = document.createElement('img');
               emojiItem.src = 'emoji/' + i + '.gif';
               emojiItem.title = i;
               docFragment.appendChild(emojiItem);
           };
           emojiContainer.appendChild(docFragment);
    },

    _showEmoji:function(msg){//正则判断有没有表情
        var match,result=msg,
            reg=/\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum=document.getElementById('emojiWrapper').children.length;
        while(match=reg.exec(msg)){
            emojiIndex=match[0].slice(7,-1);
            if(emojiIndex>totalEmojiNum){
                result=result.replace(match[0],'[x]');
            }else{
                result=result.replace(match[0],'<img class="emoji" src="emoji/'+emojiIndex+'.gif" />');
            };
        };
        return result;
    }
};