var http = require("http");
var url = require("url");
var Redis=require('../lib/redis');
var jwtToken =require('../tools/jwtToken');
function start(route, handle) {
    function onRequest(request, response) {
        // 获取请求的url对象
        var urlObj = url.parse(request.url);
        // 获取请求路径
        var pathname = urlObj.pathname;
        
        //设置响应头，解决跨域问题 
        response.setHeader("access-control-allow-origin","*");
        response.setHeader("Content-Type", "application/json");
        response.setHeader("access-control-allow-headers","Content-Type,Content-Length, Authorization, Accept,X-Requested-With");

         // 关闭nodejs 默认访问 favicon.ico
        if (!pathname.indexOf('/favicon.ico')) {
            return; 
        };
      
        //获取请求方法 
        let requestM=request.method;
          // 针对OPTIONS 处理
          if(requestM==="OPTIONS"){
           // response.statusCode = 204;
            response.end();
        };
    
        if(requestM=='REQUEST'){
            let responseJSon={
                    status:'9999',
                    msg:'请使用POST请求方式',
                    result:{}
                }
            response.end(JSON.stringify(responseJSon));
            return ;
        }

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
                if(pathname=='/getAddress' || pathname=='/addAddress' ||  pathname=='/delAddress' || pathname=='/editAddress' || pathname=='/addCart'  || pathname=='/getCart'  || pathname=='/defaultAddress' || pathname=="/cancelCollect" || pathname=="/getCollect" || pathname=="/collect" || pathname=="/getCoupon" || pathname=="/drawCoupon"){
                   
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
                              
                                try{
                                    var userId=jwtToken.verifyToken(token);  // 用户id
                                     reqParamter.userId=userId;
                                     route(pathname, reqParamter, handle, response);  
                                }catch(err){
                                    let responseJSon={
                                        status:'9999',
                                        msg:'身份验证失效,请重新登录',
                                        result:{}
                                     }
                                      response.end(JSON.stringify(responseJSon));
                                    
                                }
                               
                             
                              
                            }
                        }); 

                }else{
                  route(pathname, reqParamter, handle, response); 
                } 
            });
        }
    }
   http.createServer(onRequest).listen(3000);
}

exports.start = start;

