var http = require("http");
var url = require("url");
var Redis=require('../lib/redis');
function start(route, handle) {
    function onRequest(request, response) {
        var urlObj = url.parse(request.url);
        var pathname = urlObj.pathname;


         // 关闭nodejs 默认访问 favicon.ico
        if (!pathname.indexOf('/favicon.ico')) {
            return; 
        };
      
        
        let requestM=request.method;
         
        if(requestM=='POST'){
             var post = '';  
             // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
             request.on('data', function(chunk){    
                 post += chunk;
             });
         
            // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
            request.on('end', function(){ 
                let   reqParamter = JSON.parse(post);
                let  token=reqParamter.token;  

                if(pathname=='/getAddress' || pathname=='/addAddress' ||  pathname=='/delAddress' || pathname=='/editAddress' || pathname=='/addCart'  || pathname=='/getCart'  || pathname=='/defaultAddress'){
                    
                     /*判断当前用户是否为有效登录*/
                        Redis.redisClient.get(token, function (err, reply) { 
                            if(err){
                                console.log(err);
                            }else if(!reply){
                                let responseJSon={
                                    status:'9999',
                                    msg:'身份验证失效,请重新登录',
                                    result:{}
                                    }
                                    response.end(JSON.stringify(responseJSon));
                            }else{
                               route(pathname, reqParamter, handle, response);  
                              // response.end();   
                            }
                        }); 

                }else{
                route(pathname, reqParamter, handle, response); 
                  //response.end();  
                } 
            });

        }else{
            route(pathname, {}, handle, response);       
        }
    }

   var app= http.createServer(onRequest).listen(3000);
    var port = 3000;
   
    var io = require('socket.io')(app);
    app.listen(port);
    io.on('connection', function (socket) {
        console.log("New user connected.");
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
    });
    console.log("server listening on: " + port);

  
}

exports.start = start;

