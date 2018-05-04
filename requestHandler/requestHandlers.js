var querystring = require("querystring");
var fs = require("fs");
var data= require('../tools/data')
var Mysql=require('../lib/mysql');
var Redis=require('../lib/redis');
var jwtToken =require('../tools/jwtToken');
var moment = require('moment');
var NewRegExp=require('../tools/RegExp');
var getUUID=require('../tools/randomString');


//服务端返回参数结构
var responseJSon={
   status:'',   // 状态
   msg:'',      // 信息
   result:{}    //结果
}



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
    let ContactPerson = reqParamter.ContactPerson;   // 
    let ContactNumber=  reqParamter.ContactNumber;
    let ContactAddress = reqParamter.ContactAddress;
    let ContactDetailAddress = reqParamter.ContactDetailAddress;
    let isDefault=reqParamter.isDefault?1:0;
    let Token=reqParamter.token; 
    if((!ContactPerson) && (!ContactNumber) && (!ContactAddress) && (!ContactDetailAddress)  ){
         responseJSon.status='1';
         responseJSon.msg='缺少必要的业务参数';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
         return;
    }


     
     // 验证token 是否有效
     let   userId = jwtToken.verifyToken(Token);
     let   createTime= moment().format('YYYY-MM-DD HH:mm:ss');

     if(!userId){
           responseJSon.status='9999';
           responseJSon.msg='身份验证失效,请重新登录';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
     }

    Mysql.addAddress([userId,ContactPerson,ContactNumber,ContactAddress,ContactDetailAddress,getUUID.generateUUID(),isDefault,createTime]).then((result)=>{
         responseJSon.status='0';
         responseJSon.msg='添加新地址成功';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
         return;
    }).catch((err)=>{
       
    });
  
}



/*获取地址列表*/
let addressList=(reqParamter,response)=>{
    let    Token=reqParamter.token;
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
 

    if((!ContactPerson) && (!ContactNumber) && (!ContactAddress) && (!ContactDetailAddress)  && (!AddressId) ){
         responseJSon.status='1';
         responseJSon.msg='缺少必要的业务参数';
         responseJSon.result={};
         response.end(JSON.stringify(responseJSon));
         return;
    }
     

    Mysql.editAddress([ContactPerson,ContactNumber,ContactAddress,ContactDetailAddress,AddressId]).then((result)=>{
           responseJSon.status='0';
           responseJSon.msg='地址修改成功';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;    
    }).catch((error)=>{
        console.log(error);
    })


}


/*删除地址*/
let delAddress=(reqParamter,response)=>{
   /*验证token 是否有效*/
   let Token =reqParamter.token;
   let addressId=reqParamter.AddressId;
   if(!addressId){
      responseJSon.status='1';
      responseJSon.msg='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   }
  
   let userId=jwtToken.verifyToken(Token);
 

    Mysql.delAddress([addressId]).then((result)=>{
       responseJSon.status='0';
       responseJSon.msg='删除地址成功';
       responseJSon.result={};
       response.end(JSON.stringify(responseJSon));
    }).catch((err)=>{
       responseJSon.status='2';
       responseJSon.msg='删除地址失败，请稍后重试';
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
      responseJSon.msg='缺少必要的业务参数';
      responseJSon.result={};
      response.end(JSON.stringify(responseJSon));
      return;
   }
  
   let userId=jwtToken.verifyToken(Token);


   Mysql.defaultAddress([0]).then((result)=>{
          Mysql.setDefaultAddress([addressId]).then((result)=>{
                 responseJSon.status='0';
                 responseJSon.msg='设置默认地址成功！';
                 responseJSon.result={};
                 response.end(JSON.stringify(responseJSon));
           }).catch((err)=>{
              console.log(err);
           });
   }).catch((err)=>{
      console.log(err);
   });

}



/*获取商品列表*/
let goodsList=(reqParamter, response)=>{
    let page=reqParamter.page;
    let pageSize=reqParamter.pageSize || 10;
    let sort=reqParamter.sort || 1;
     if(!pageSize){
        responseJSon.status='9999';
        responseJSon.msg='缺少业务参数';
        responseJSon.result=[];
        response.end(JSON.stringify(responseJSon));  

        return ;
     }
    Mysql.goodsList(page,pageSize,sort).then((result)=>{
        responseJSon.status='0';
        responseJSon.msg="数据获取成功";
        responseJSon.result=result;
        response.end(JSON.stringify(responseJSon));
    }).catch((err)=>{
          console.log(err);
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
       responseJSon.msg='商品详情获取成功';
       responseJSon.result.goodsDetail=result[0];
       response.end(JSON.stringify(responseJSon));  

    }).catch((error)=>{

    });
}



/****************获取购物车商品****************/

let  getCart=(reqParamter,response)=>{
  var Token =reqParamter.token; 
  var userId=jwtToken.verifyToken(Token);  // 用户id
  let responseJSon={
      status:'',   // 状态码
      message:'',  // 提示信息
      result:{      // 结果
         cartList:[]
      } 
  }
  Mysql.getCart([userId]).then((result)=>{
       responseJSon.status='0';
       responseJSon.msg='获取购物车商品成功';
       responseJSon.result.cartList=result;
       response.end(JSON.stringify(responseJSon));
       return;
  }).catch((error)=>{
    responseJSon.status='1';
    responseJSon.msg='获取购物车商品失败,请稍后重试';
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
   var goodsColor=reqParamter.goodsColor;    // 商品颜色
   var goodsPrice,goodsImgArr,goodsName,categoryId;
   var userId=jwtToken.verifyToken(Token);  // 用户id

   //返回参数格式
    let     responseJSon={
                status:'',   // 查询状态
                message:'',  // 提示信息
                result:{     //返回结果
             
                } 
            }
 

   if(!(goodsId && goodsSize && goodsColor )){
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
          goodsImgArr =result[0].goodsImgArr;  
          Mysql.addCart([userId,goodsName,goodsPrice,goodsImgArr,goodsId,goodsNumber,goodsSize,goodsColor]).then((result)=>{
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
           responseJSon.msg='已成功从购物车删除';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
    }).catch((error)=>{
       
        responseJSon.status='1';
        responseJSon.msg='操作失败，请稍后重试!';
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
     responseJSon.msg='已成功退出';
     responseJSon.result={};
     response.end(JSON.stringify(responseJSon));
}); 
     
   
}




/*添加优惠券*/

let addCoupon=(reqParamter,response)=>{
    /*验证token 是否有效*/
   var title =reqParamter.title; 
   var money=reqParamter.money;
   var limt=reqParamter.limt;
   var endTime=reqParamter.endTime;   

     
   // 返回参数格式
   let responseJSon={
        status:'',
        message:'',
        result:{}
   }


   if(!(title&&money&&limt&&endTime)){
            responseJSon.status='1';
            responseJSon.msg='缺少业务参数';
            responseJSon.result={};
            response.end(JSON.stringify(responseJSon));
            return;  
   }

    Mysql.addCoupon([title,money,limt,endTime]).then((result)=>{
           responseJSon.status='0';
           responseJSon.msg='添加成功';
           responseJSon.result={};
           response.end(JSON.stringify(responseJSon));
           return;
    }).catch((error)=>{
        console.log(error)
        responseJSon.status='1';
        responseJSon.msg='操作失败，请稍后重试!';
        responseJSon.result={};
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
           responseJSon.msg='获取成功';
           responseJSon.result.couponList=result;
           response.end(JSON.stringify(responseJSon));
    }).catch((error)=>{
        console.log(error)
        responseJSon.status='1';
        responseJSon.msg='操作失败，请稍后重试!';
        responseJSon.result={};
        response.end(JSON.stringify(responseJSon));
    });
}




module.exports = {
  register, // 注册
  login,    // 登录
  loginOut, // 退出登录
  addAddress,  // 地址
  goodsList,   // 商品列表
  addressList,  // 地址列表
  delAddress,  // 删除列表
  editAddress, // 修改地址
  defaultAddress,
  addCart, // 加入购物车
  goodsDetail, // 商品详情
  delCart,   // 购物车删除商品
  getCart , // 获取购物车商品
  addCoupon, // 添加优惠券
  couponList,// 获取所有优惠券

}