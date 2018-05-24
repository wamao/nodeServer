var querystring = require("querystring");
var request = require('request');
var fs = require("fs");
var data= require('../tools/data')
var Mysql=require('../lib/mysql');
var Redis=require('../lib/redis');
var jwtToken =require('../tools/jwtToken');
var moment = require('moment');
var NewRegExp=require('../tools/RegExp');
var getUUID=require('../tools/randomString');
var categoryJSON=require('../tools/category.json');


/*用户注册*/
let register=(reqParamter,response)=>{

   response.writeHead(200, {'Content-Type': 'application/json'});

   /*获取请求的参数*/
   let userName=reqParamter.userName;
   let userPwd=reqParamter.userPwd;
   let confirmPwd=reqParamter.confirmPwd;


    /*http请求返回数据结构*/ 
   let  responseJSon={
            status:'',          // 状态
            message:'',         // 提示信息
            result:{            // 返回json 数据
                memberAccount:{},  // 用户模型
                token:''           // token
            } 
        }
 
   /*参数校验*/
   if((!userPwd) && (!userName) && !(confirmPwd)){
      responseJSon.status='1';
      responseJSon.message='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));

      return;
   } 

   if(!NewRegExp.ExpUser.test(userName)){
      responseJSon.status='1';
      responseJSon.message='用户名格式不正确';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));

       return;
   }  


   if(!NewRegExp.ExpUser.test(userPwd)){
      responseJSon.status='1';
      responseJSon.message='密码格式不正确';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));

       return;
   } 

   if(userPwd!==confirmPwd){
      responseJSon.status='1';
      responseJSon.message='两次密码输入不一致';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));

       return;
   } 


    /*查询该注册用户是否已经存在*/
    Mysql.searchUser(userName).then((result)=>{
        if(result.length){
            responseJSon.status='1';
            responseJSon.message='用户名已存在';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
        }else{

           /*不存在则插入*/

       
            let   userId=getUUID.generateUUID(); // 随机生成userId
            let   createTime= moment().format('YYYY-MM-DD HH:mm:ss');

            Mysql.insertUser([userName,userPwd,userId,createTime]).then((result)=>{
                  responseJSon.status='0';
                  responseJSon.message='注册成功';
                  /* 获取 userID 生成token 并返回给客户端*/ 
                  let token= jwtToken.setToken(userId);
                  responseJSon.result.token=token;
                  let memberAccount={
                    userName:userName,
                    addAddress:false,
                    goodsCount:0
                  }
                  responseJSon.result.memberAccount=memberAccount;
                  response.end(JSON.stringify(responseJSon));
             }).catch((err)=>{
                responseJSon.status='1';
                responseJSon.message='注册失败请稍后重试';
                responseJSon.result={};
                response.end(JSON.stringify(responseJSon));
             });
        }
      
    }).catch((err)=>{
       console.log(err);
    });
}


/*微信授权登录*/

let wxlogin=(reqParamter,response)=>{

      /*http请求返回数据结构*/ 
   let responseJSon={
        status:'',          // 状态
        message:'',         // 提示信息
        result:{            // 返回json 数据
            memberAccount:{},  // 用户模型
            token:''           // token
        } 
    }   
  
    /*获取请求的参数*/
    let js_code=reqParamter.code;

    if(!js_code){
        responseJSon.status="1";
        responseJSon.message="缺少业务参数";
        response.end(JSON.stringify(responseJSon));
        
    }
        
    let  appid='wx86b076066195fa3e';
    let  secret='c00782393322e04feba2d2faa0cb5093';
    let  grant_type='authorization_code';

        
    let requestUrl= `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=${grant_type}`;
    request(requestUrl, function (error, res, body) {
        if (!error && response.statusCode == 200) {
            let resBody=JSON.parse(body);
            if(resBody.openid){
                console.log(resBody.openid);
                let token= jwtToken.setToken(resBody.openid);
              
                Redis.redisClient.set(token,token, function (err, reply) { 
                        if (err){
                            responseJSon.status="9999";
                            responseJSon.message="授权失败请稍后重试";
                            response.end(JSON.stringify(responseJSon));
                           
                        } else{
                           
                            responseJSon.status="0";
                            responseJSon.message="授权成功";
                            responseJSon.result.token=token;
                            response.end(JSON.stringify(responseJSon));
                        
                        }
                }); 
            }else{
                responseJSon.status="9999";
                responseJSon.message="授权失败请稍后重试";
                response.end(JSON.stringify(responseJSon));
            }
        }else{
            responseJSon.status="9999";
            responseJSon.message="授权失败请稍后重试";
            response.end(JSON.stringify(responseJSon));
        }
    });
}


/**************************  用户登录 ********************************************/

let login=(reqParamter, response)=>{
   
   /*获取请求的参数*/
  let userName=reqParamter.username;
  let userPwd=reqParamter.password;

   /*http请求返回数据结构*/ 
   let responseJSon={
            status:'',          // 状态
            message:'',         // 提示信息
            result:{            // 返回json 数据
                memberAccount:{},  // 用户模型
                token:''           // token
            } 
       }


  /*参数校验*/
   if((!userPwd) && (!userName) ){
      responseJSon.status='1';
      responseJSon.message='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   } 

   if(!NewRegExp.ExpUser.test(userName)){
      responseJSon.status='1';
      responseJSon.message='用户名格式不正确';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   }  


   if(!NewRegExp.ExpUser.test(userPwd)){
      responseJSon.status='1';
      responseJSon.message='密码格式不正确';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   } 


  Mysql.searchUser(userName).then((result)=>{
     if(result.length==0){
        responseJSon.status='1';
        responseJSon.message='该用户尚未注册';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
     }else{
        if(result[0].userPwd==userPwd){

             
         /* 获取 userID 生成token 并返回给客户端*/ 
         let token= jwtToken.setToken(result[0].userId);
         
          Redis.redisClient.set(token,token, function (err, reply) { 
              if (err){
                  console.log(err)
              } else{
                   responseJSon.status='0';
                   responseJSon.message='登录成功！';
                   responseJSon.result.token=token;
                    let memberAccount={
                        userName:userName,
                        addAddress:false,
                        goodsCount:0
                    }
                   responseJSon.result.memberAccount=memberAccount;
                   response.end(JSON.stringify(responseJSon));
              }
          }); 
        }else{
           responseJSon.status='1';
           responseJSon.message='密码错误！';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
        } 
     }
  }).catch((err)=>{

  });
}


/*添加地址*/
let addAddress=(reqParamter, response)=>{
   
    /*http请求返回数据结构*/ 
    let responseJSon={
        status:'',          // 状态
        message:'',         // 提示信息
        result:{   }           // 返回json 数据
    }

    let ContactPerson = reqParamter.ContactPerson;   // 
    let ContactNumber=  reqParamter.ContactNumber;
    let ContactAddress = reqParamter.ContactAddress;
    let ContactDetailAddress = reqParamter.ContactDetailAddress;
    let isDefault=reqParamter.isDefault?1:0;
    let Token=reqParamter.token; 
    if((!ContactPerson) && (!ContactNumber) && (!ContactAddress) && (!ContactDetailAddress)  ){
         responseJSon.status='1';
         responseJSon.message='缺少必要的业务参数';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
         return;
    }

   
     let   userId = jwtToken.verifyToken(Token);
     let   createTime= moment().format('YYYY-MM-DD HH:mm:ss');
     let   AddressId=getUUID.generateUUID(); // 生成addressId

    Mysql.addAddress([userId,ContactPerson,ContactNumber,ContactAddress,ContactDetailAddress,AddressId,isDefault,createTime]).then((result)=>{
        
        responseJSon.status='0';
         responseJSon.message='添加新地址成功';
         responseJSon.result={
            ContactPerson:ContactPerson,
            ContactNumber:ContactNumber,
            ContactAddress:ContactAddress,
            ContactDetailAddress:ContactDetailAddress,
            AddressId:AddressId
         };
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((err)=>{
       
    });
  
}



/*获取地址列表*/
let addressList=(reqParamter,response)=>{
    let   Token=reqParamter.token;
    let   userId = jwtToken.verifyToken(Token);

     /*http请求返回数据结构*/ 
     let responseJSon={
        status:'',          // 状态
        message:'',         // 提示信息
        result:{            // 返回json 数据
            addressList:[],  
           
        } 
   }

   

    Mysql.addressList([userId]).then((result)=>{
       responseJSon.status='0';
       responseJSon.message='获取地址成功';
       responseJSon.result.addressList=result;
       response.end(JSON.stringify(responseJSon));
           
         
     }).catch(()=>{});
};


/*修改地址*/


let editAddress=(reqParamter,response)=>{
   /*验证token 是否有效*/
    let Token =reqParamter.token;
    let userId=jwtToken.verifyToken(Token);
    let ContactPerson = reqParamter.ContactPerson;   // 
    let ContactNumber=  reqParamter.ContactNumber;
    let ContactAddress = reqParamter.ContactAddress;
    let ContactDetailAddress = reqParamter.ContactDetailAddress;
    let AddressId=reqParamter.AddressId;
 
    let responseJSon={
        status:'',          // 状态
        message:'',         // 提示信息
        result:{  }          // 返回json 数据
   }  


    if((!ContactPerson) && (!ContactNumber) && (!ContactAddress) && (!ContactDetailAddress)  && (!AddressId) ){
         responseJSon.status='1';
         responseJSon.message='缺少必要的业务参数';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
         return;
    }
     

    Mysql.editAddress([ContactPerson,ContactNumber,ContactAddress,ContactDetailAddress,AddressId]).then((result)=>{
           responseJSon.status='0';
           responseJSon.message='地址修改成功';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;    
    }).catch((error)=>{
        console.log(error);
    })


}


/*删除地址*/
let delAddress=(reqParamter,response)=>{


    let responseJSon={
        status:'',          // 状态
        message:'',         // 提示信息
        result:{  }          // 返回json 数据
   }  



   /*验证token 是否有效*/
   let Token =reqParamter.token;
   let addressId=reqParamter.AddressId;
   if(!addressId){
      responseJSon.status='1';
      responseJSon.message='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   }
  
   let userId=jwtToken.verifyToken(Token);
 

    Mysql.delAddress([addressId]).then((result)=>{
       responseJSon.status='0';
       responseJSon.message='删除地址成功';
       responseJSon.result={};
       response.end(JSON.stringify(responseJSon));
    }).catch((err)=>{
       responseJSon.status='2';
       responseJSon.message='删除地址失败，请稍后重试';
       responseJSon.result={};
       response.end(JSON.stringify(responseJSon));
    });
}


/*设置默人地址*/

let defaultAddress=(reqParamter,response)=>{
   let Token =reqParamter.token;
   let addressId=reqParamter.AddressId;
   if(!addressId){
      responseJSon.status='1';
      responseJSon.message='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   }
  
   let userId=jwtToken.verifyToken(Token);


   Mysql.defaultAddress([0]).then((result)=>{
          Mysql.setDefaultAddress([addressId]).then((result)=>{
                 responseJSon.status='0';
                 responseJSon.message='设置默认地址成功！';
                 responseJSon.result={};
                 response.end(JSON.stringify(responseJSon));
           }).catch((err)=>{
              console.log(err);
           });
   }).catch((err)=>{
      console.log(err);
   });

}


/*获取所有的分类*/
let category=(reqParamter, response)=>{
    let responseJSon={
        status:'0',
        message:'成功获取所有的分类',
        result:{
            category:categoryJSON
        }
    }

    response.end(JSON.stringify(responseJSon));
}


/*获取商品列表*/
let categoryList=(reqParamter, response)=>{
    let page=reqParamter.page;
    let pageSize=reqParamter.pageSize || 10;
    let TopCategoryId=reqParamter.TopCategoryId||''; // 一级分类
    let SecondaryCategoryId=reqParamter.TopCategoryId||'';  // 二级分类
    let ThirdCategoryId=reqParamter.ThirdCategoryId||''; // 三级分类
    let responseJSon={
        status:'',
        message:'',
        result:{
            categoryList:[]
        }
    }


    if(!page){
        responseJSon.status='·';
        responseJSon.message="缺少必要的业务参数";
        responseJSon.result.categoryList=result;
        response.end(JSON.stringify(responseJSon));
    }


     if(!(TopCategoryId || SecondaryCategoryId || ThirdCategoryId )){
        responseJSon.status='1';
        responseJSon.message='缺少业务参数';
        response.end(JSON.stringify(responseJSon));  
        return ;
     }
    Mysql.categoryList(TopCategoryId,SecondaryCategoryId,ThirdCategoryId,Number(page),pageSize).then((result)=>{
        responseJSon.status='0';
        responseJSon.message="数据获取成功";
        responseJSon.result.categoryList=result;
        response.end(JSON.stringify(responseJSon));
    }).catch((err)=>{
        responseJSon.status='9';
        responseJSon.message="数据获取失败,请稍后重试";
        responseJSon.result.categoryList=result;
        response.end(JSON.stringify(responseJSon));
    });
}


/*******************获取商品详情****************/

let goodsDetail=(reqParamter,response)=>{

   let goodsId=reqParamter.goodsId; // 商品id

    //返回参数格式
     let    responseJSon={
             status:'',   // 查询状态
             message:'',  // 提示信息
             result:{     //返回结果
                goodsDetail:{}   // 商品详情
             }   
            
          }

    
    if(!goodsId){
        responseJSon.status='9999';
        responseJSon.message='缺少业务参数';
        responseJSon.result=[];
        response.end(JSON.stringify(responseJSon));  
        return ;
    }

     /*查询商品信息*/
    Mysql.goodsDetail([goodsId]).then((result)=>{
       
       responseJSon.status='0';
       responseJSon.message='商品详情获取成功';
       result[0].goodsImgArr=result[0].goodsImgArr.split(',');
       result[0].goodsSize=result[0].goodsSize.split(',');
       responseJSon.result.goodsDetail=result[0];
       response.end(JSON.stringify(responseJSon));  

    }).catch((error)=>{

    });
}



/****************获取购物车商品****************/

let  getCart=(reqParamter,response)=>{
  var Token =reqParamter.token; 
  let userId =reqParamter.userId;
  let responseJSon={
      status:'',   // 状态码
      message:'',  // 提示信息
      result:{      // 结果
         cartList:[]
      } 
  }
  Mysql.getCart([userId]).then((result)=>{
       responseJSon.status='0';
       responseJSon.message='获取购物车商品成功';
       responseJSon.result.cartList=result;
       response.end(JSON.stringify(responseJSon));
       return;
  }).catch((error)=>{
    responseJSon.status='1';
    responseJSon.message='获取购物车商品失败,请稍后重试';
    responseJSon.result.cartList=[];
    response.end(JSON.stringify(responseJSon));
  });

}


/************************************加入购物车*************************************************/
let addCart=(reqParamter,response)=>{
   /*验证token 是否有效*/


   var Token =reqParamter.token; 
   var goodsNumber=reqParamter.goodsNumber?reqParamter.goodsNumber:1;  // 商品数量
   var goodsId=reqParamter.goodsId;    // 商品id
   var goodsSize=reqParamter.goodsSize;    // 商品规格
   var goodsStyle=reqParamter.goodsStyle;    // 商品款式
   var goodsPrice,goodsImgArr,goodsName,categoryId;
   var userId=reqParamter.userId;  // 用户id
  
   //返回参数格式
    let     responseJSon={
                status:'',   // 查询状态
                message:'',  // 提示信息
                result:{     //返回结果
             
                } 
            }
 
    /*判断是否缺少参数*/        
   if(!(goodsId && goodsSize && String(goodsStyle) )){
    responseJSon.status='1';
    responseJSon.message='缺少必要的业务参数';
    responseJSon.result={};
    response.end(JSON.stringify(responseJSon));
    return;
   }


 
   /*查询商品信息*/
    Mysql.goodsDetail([goodsId]).then((result)=>{
          goodsName=result[0].goodsName;
          goodsPrice =result[0].goodsPrice; 
          goodsImgUrl =result[0].goodsImgArr.split(',')[goodsStyle];  
          Mysql.addCart([userId,goodsName,goodsPrice,goodsImgUrl,goodsId,goodsNumber,goodsSize,goodsStyle]).then((result)=>{
             responseJSon.status='0';
             responseJSon.message='加入购物车成功';
             responseJSon.result={};
             response.end(JSON.stringify(responseJSon));
          }).catch((err)=>{
             responseJSon.status='1';
             responseJSon.message='操作失败，请稍后重试';
             responseJSon.result={};
             response.end(JSON.stringify(responseJSon));
            
          }); 

    }).catch((error)=>{

    });
    

   
}



/*从购物车删除商品*/
let delCart=(reqParamter,response)=>{
    /*验证token 是否有效*/
   var Token =reqParamter.token; 
   var goodsId=reqParamter.goodsId;    // 商品id
   var userId=jwtToken.verifyToken(Token);  // 用户id
     
   // 返回参数格式
   let responseJSon={
        status:'',
        message:'',
        result:{}
   }

    Mysql.delCart([goodsId]).then((result)=>{
           responseJSon.status='0';
           responseJSon.message='已成功从购物车删除';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
    }).catch((error)=>{
       
        responseJSon.status='1';
        responseJSon.message='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
    });
}



/*退出登录*/
let loginOut=(reqParamter,response)=>{
   
    var Token =reqParamter.token; 

    // 删除redis
    Redis.redisClient.del(Token, function (err, reply) { 
    if (err){
         console.log(err);
    }
     responseJSon.status='0';
     responseJSon.message='已成功退出';
     responseJSon.result={};
     response.end(JSON.stringify(responseJSon));
}); 
     
   
}




/*添加优惠券*/

let addCoupon=(reqParamter,response)=>{
    /*验证token 是否有效*/
 
   var spendMoney=reqParamter.spendMoney;
   var disCount=reqParamter.disCount;
   var endTime=reqParamter.endTime;   
   var  title=reqParamter.title; 
   let  couponId=getUUID.generateUUID(); // 随机生成couponId

     
   // 返回参数格式
   let responseJSon={
        status:'',
        message:'',
        result:{}
   }


   if(!(spendMoney&&disCount&&title&&endTime)){
            responseJSon.status='1';
            responseJSon.message='缺少业务参数';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
            return;  
   }

    Mysql.addCoupon([couponId,spendMoney,disCount,endTime,title]).then((result)=>{
           responseJSon.status='0';
           responseJSon.message='添加成功';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
    }).catch((error)=>{
        console.log(error)
        responseJSon.status='1';
        responseJSon.message='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
    });
}

/*用户领取优惠券*/
let drawCoupon= async (reqParamter,response)=>{
    let Token =reqParamter.token; 
    let userId=jwtToken.verifyToken(Token);  // 用户id
    let  couponId=reqParamter.couponId; // 获取couponId
   // 返回参数格式
   let responseJSon={
        status:'',
        message:'',
        result:{}
   }


   if(!couponId){
            responseJSon.status='1';
            responseJSon.message='缺少业务参数';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
            return;  
   }

   let couponDetail=await  Mysql.searchCoupon([couponId]);
    Mysql.drawCoupon([userId,couponDetail[0].couponId,couponDetail[0].money,couponDetail[0].limt,couponDetail[0].startTime,couponDetail[0].endTime]).then((result)=>{
            responseJSon.status='0';
            responseJSon.message='购物券领取成功';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
     }).catch((error)=>{
         console.log(error)
         responseJSon.status='1';
         responseJSon.message='操作失败，请稍后重试!';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
     });
}



/****************获取用户购物券****************/

let  getCoupon=(reqParamter,response)=>{
    var Token =reqParamter.token; 
    var userId=jwtToken.verifyToken(Token);  // 用户id
    let responseJSon={
        status:'',   // 状态码
        message:'',  // 提示信息
        result:{      // 结果
            couponList:[]
        } 
    }
    Mysql.getCoupon([userId]).then((result)=>{
         responseJSon.status='0';
         responseJSon.message='获取购物券成功';
         responseJSon.result.couponList=result;
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((error)=>{
      responseJSon.status='1';
      responseJSon.message='获取购物券失败,请稍后重试';
      responseJSon.result.couponList=[];
      response.end(JSON.stringify(responseJSon));
    });
  
  }
  


/*获取系统所有优惠券*/

let couponList=(reqParamter,response)=>{
  // 返回参数格式
    let responseJSon={
        status:'',
        message:'',
        result:{
            couponList:[] 
        }
    }

    Mysql.couponList([]).then((result)=>{
           responseJSon.status='0';
           responseJSon.message='获取成功';
           responseJSon.result.couponList=result;
           response.end(JSON.stringify(responseJSon));
    }).catch((error)=>{
        console.log(error)
        responseJSon.status='1';
        responseJSon.message='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
    });
}


/*****提交订单******/

let submitOrder=(reqParamter,response)=>{


    let responseJSon={
        status:'',
        message:'',
        result:{
            couponList:[] 
        }
    }

      let order=reqParamter.order;
      var Token =reqParamter.token; 
      var userId=jwtToken.verifyToken(Token);  // 用户id

      if(!order){
        responseJSon.status='1';
        responseJSon.message='缺少必要的业务参数!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
        return; 
      }
     
      let sql='' 
        order.forEach(item => {
           let   createTime= moment().format('YYYY-MM-DD HH:mm:ss');
            let sqlString =`('${userId}','${getUUID.generateUUID()}','${item.goodsId}','${item.addressId}','${item.goodsNumber}',0,'${item.goodsSize}','${item.remark}','${createTime}','${getUUID.randomNum()}'),`;
            sql+=sqlString;
        });
       let  newSql=sql.substring(0,sql.length-1);
        // 提交订单 
        Mysql.addOrder(newSql).then((result)=>{
            responseJSon.status='0';
            responseJSon.message='订单提交成功';
            responseJSon.result.couponList=result;
            response.end(JSON.stringify(responseJSon));
        }).catch((error)=>{
        console.log(error)
        responseJSon.status='1';
        responseJSon.message='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
        });


}

/*****订单查询******/


let getOrder=async  (reqParamter,response)=>{
    let responseJSon={
        status:'',
        message:'',
        result:{
        orderList:[] 
        }
    }

    let orderType=reqParamter.orderType?reqParamter.orderType:0;
    var Token =reqParamter.token; 
    var userId=jwtToken.verifyToken(Token);  // 用户id


    let result= await  Mysql.getOrder(userId,orderType);

    Mysql.getOrder(userId,orderType).then((result)=>{
       
        responseJSon.status='0';
        responseJSon.message='订单获取成功';
        responseJSon.result.orderList=result;
        response.end(JSON.stringify(responseJSon));
        
    }).catch((error)=>{
   
    responseJSon.status='1';
    responseJSon.message='操作失败，请稍后重试!';
    responseJSon.result={};
    response.end(JSON.stringify(responseJSon));
    });
}

/*取消订单*/
let cancelOrder=(reqParamter,response)=>{
   /*验证token 是否有效*/
   var Token =reqParamter.token; 
   var orderId=reqParamter.orderId;    // 商品id
  
   // 返回参数格式
   let responseJSon={
        status:'',
        message:'',
        result:{}
   }

   if(!orderId){
    responseJSon.status='1';
        responseJSon.message='缺少业务参数';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
        return;  
}

    Mysql.cancelOrder([orderId]).then((result)=>{
           responseJSon.status='0';
           responseJSon.message='已成功取消订单';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
    }).catch((error)=>{
       
        responseJSon.status='1';
        responseJSon.message='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
    });
}


/*商品收藏*/
let collect=(reqParamter,response)=>{
    /*验证token 是否有效*/
    var Token =reqParamter.token; 
    var goodsId=reqParamter.goodsId;    // 商品id
    var userId=jwtToken.verifyToken(Token);  // 用户id
    // 返回参数格式
    let responseJSon={
         status:'',
         message:'',
         result:{
             hasCollect:1
         }
    }

    if(!goodsId){
        responseJSon.status='1';
            responseJSon.message='缺少业务参数';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
            return;  
    }
 
     Mysql.collect([userId,goodsId,getUUID.generateUUID()]).then((result)=>{
            responseJSon.status='0';
            responseJSon.message='收藏成功';
            responseJSon.result.hasCollect=1;
            response.end(JSON.stringify(responseJSon));
            return;
     }).catch((error)=>{
        
         responseJSon.status='1';
         responseJSon.message='操作失败，请稍后重试!';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
     });
 }

 /*取消收藏*/
let cancelCollect=(reqParamter,response)=>{
    /*验证token 是否有效*/
    var Token =reqParamter.token; 
    var goodsId=reqParamter.goodsId;    // 商品id
    var userId=jwtToken.verifyToken(Token);  // 用户id
   
 
    // 返回参数格式
    let responseJSon={
         status:'',
         message:'',
         result:{
             hasCollect:0
         }
    }
 
    if(!goodsId){
           responseJSon.status='1';
            responseJSon.message='缺少业务参数';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
            return;  
    }
 
     Mysql.cancelCollect(userId,goodsId).then((result)=>{
            responseJSon.status='0';
            responseJSon.message='已成功取消收藏';
            responseJSon.result.hasCollect=0;
            response.end(JSON.stringify(responseJSon));
            return;
     }).catch((error)=>{
        
         responseJSon.status='1';
         responseJSon.message='操作失败，请稍后重试!';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
     });
 }

 

 /****************获取用户所有的收藏****************/

let  getCollect=(reqParamter,response)=>{
    var Token =reqParamter.token; 
    var userId=jwtToken.verifyToken(Token);  // 用户id
    let responseJSon={
        status:'',   // 状态码
        message:'',  // 提示信息
        result:{      // 结果
            collectList:[]
        } 
    }
    Mysql.getCollect([userId]).then((result)=>{
         responseJSon.status='0';
         responseJSon.message='获取所有收藏成功';
         responseJSon.result.collectList=result;
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((error)=>{
      responseJSon.status='1';
      responseJSon.message='获取失败,请稍后重试';
      responseJSon.result.collectList=[];
      response.end(JSON.stringify(responseJSon));
    });
  
  }


/****************判断用户是否已经收藏****************/
let  isCollect=(reqParamter,response)=>{
    var Token =reqParamter.token; 
    var userId=jwtToken.verifyToken(Token);  // 用户id
    var goodsId=reqParamter.goodsId;    // 商品id
    let responseJSon={
        status:'',   // 状态码
        message:'',  // 提示信息
        result:{      // 结果
            hasCollect:0
        } 
    }
    Mysql.isCollect([userId,goodsId]).then((result)=>{
         responseJSon.status='0';
         responseJSon.message='获取所有收藏成功';
         responseJSon.result.hasCollect=result.length==0?0:1;
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((error)=>{
      responseJSon.status='1';
      responseJSon.message='获取失败,请稍后重试';
      responseJSon.result.collectList=[];
      response.end(JSON.stringify(responseJSon));
    });
  
  }


  
/****************判断用户是否已经收藏****************/
let  searchGoods=(reqParamter,response)=>{
   
    var keyword=reqParamter.keyword;    // 商品id
    var page=reqParamter.page;    // 商品id
    let responseJSon={
        status:'',   // 状态码
        message:'',  // 提示信息
        result:{      // 结果
           goodslist:[] 
        } 
    }


    if(!keyword&&page){
        responseJSon.status='1';
        responseJSon.message='请输入关键词';
        responseJSon.result={}
        response.end(JSON.stringify(responseJSon));
        return;
    }
    Mysql.searchGoods(keyword,page).then((result)=>{
         responseJSon.status='0';
         responseJSon.message='获取所有收藏成功';
         responseJSon.result.goodslist=result;
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((error)=>{
        console.log(error)
      responseJSon.status='1';
      responseJSon.message='获取失败,请稍后重试';
      responseJSon.result.goodslist=[];
      response.end(JSON.stringify(responseJSon));
    });
  
  }


    
/****************添加精选商品****************/
let  addChosen=(reqParamter,response)=>{
  
    var goodsId=reqParamter.goodsId;    // 商品id
    let responseJSon={
        status:'',   // 状态码
        message:'',  // 提示信息
        result:{      // 结果
           goodslist:[] 
        } 
    }
   
    if(!goodsId){
        responseJSon.status='1';
        responseJSon.message='缺少必要的参数';
        responseJSon.result={}
        response.end(JSON.stringify(responseJSon));
        return;
    }
    
    Mysql.addChosen([goodsId]).then((result)=>{
         responseJSon.status='0';
         responseJSon.message='添加成功';
         responseJSon.result.goodslist=result;
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((error)=>{
       console.log(error);
      responseJSon.status='1';
      responseJSon.message='获取失败,请稍后重试';
      responseJSon.result.goodslist=[];
      response.end(JSON.stringify(responseJSon));
    });
  
  }


  /*获取系统所有优惠券*/

let getChosen=(reqParamter,response)=>{
    // 返回参数格式
      let responseJSon={
          status:'',
          message:'',
          result:{
            chosenList:[] 
          }
      }
  
      Mysql.chosenList([]).then((result)=>{
             responseJSon.status='0';
             responseJSon.message='获取成功';
             responseJSon.result.chosenList=result;
             response.end(JSON.stringify(responseJSon));
      }).catch((error)=>{
          console.log(error)
          responseJSon.status='1';
          responseJSon.message='操作失败，请稍后重试!';
          responseJSon.result={};
          response.end(JSON.stringify(responseJSon));
      });
  }
  
  
 




module.exports = {
  register, // 注册
  login,    // 登录
  wxlogin, // 微信授权登录
  loginOut, // 退出登录
  addAddress,  // 地址
  category,// 获取所有的分类
  categoryList,   // 商品列表
  addressList,  // 地址列表
  delAddress,  // 删除列表
  editAddress, // 修改地址
  defaultAddress,
  addCart, // 加入购物车
  goodsDetail, // 商品详情
  delCart,   // 购物车删除商品
  getCart , // 获取购物车商品
  addCoupon, // 添加优惠券
  drawCoupon,// 用户领取优惠券
  getCoupon, // 获取用户已经领取的优惠券
  couponList,// 获取所有优惠券
  submitOrder, // 提交订单
  getOrder ,// 获取订单
  cancelOrder, // 取消订单
  collect, // 商品收藏
  cancelCollect, // 取消收藏
  getCollect ,// 获取所有收藏
  isCollect , // 判断用户是否已经收藏
  searchGoods, // 搜索商品
  addChosen ,// 添加精选商品
  getChosen // 获取所有的精选商品
  

}