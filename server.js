var http = require('http');
var url = require("url");
    http.createServer(function (req, res) {
        res.setHeader("access-control-allow-origin","*");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("access-control-allow-headers","Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        var urlObj = url.parse(req.url);
        var pathname = urlObj.pathname;
        // 关闭nodejs 默认访问 favicon.ico
        if (!pathname.indexOf('/favicon.ico')) {
            return; 
        };

        // 获取请求方式
         let requestM=req.method;
 
         console.log(requestM);
         // 针对OPTIONS 处理
        if(requestM==="OPTIONS"){
            res.statusCode = 204;
            //res.end();
        };

        var post = '';  
       

        // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
        req.on('data', function(chunk){    
            post += chunk;
        });

        
        req.on('end', function(){ 
          console.log('11111111111111111111');
            console.log(post);
           console.log('22222222222222');
            
        });

    //         var data={
    //             "name":"nnnn"
    //         }

    //  console.log('33333333333333333')
        

    //  res.end(JSON.stringify(data));






        //获取不到post 请求过来的参数

    }).listen(3000);