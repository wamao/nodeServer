var mysql = require('mysql');
var config = require('../config/mysql.js')

var data=require('../tools/data');



/*创建连接池*/

var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
});



/*query 方法*/
let query=(sql,values)=>{
	return new Promise((resolve,reject)=>{
		pool.getConnection((err,connection)=>{
            if(err){
                  reject(err);
              }else{
              
                  connection.query(sql,values,(err,rows)=>{
                       //释放连接  
                    connection.release();  
                  	 if(err){
                  	 	reject(err);
                  	 }else{
                  	 	resolve(rows);
                  	 }


                  });
             };
		});
	});
}



// 创建用户表
 let user =
    `create table if not exists user(
     id INT NOT NULL AUTO_INCREMENT,
     userName VARCHAR(255) NOT NULL,
     userPwd  VARCHAR(255) NOT NULL,
     userId   VARCHAR(255) NOT NULL,
     createTime VARCHAR(255) NOT NULL, 
     PRIMARY KEY ( id )
    )ENGINE=MyISAM DEFAULT CHARSET=utf8;`

// 创建用户地址表
  let address =
    `create table if not exists address(
     id INT NOT NULL AUTO_INCREMENT,
     userId  VARCHAR(255) NOT NULL,
     ContactPerson  VARCHAR(255) NOT NULL,
     ContactNumber   VARCHAR(255) NOT NULL,
     ContactAddress   VARCHAR(255) NOT NULL,
     ContactDetailAddress   VARCHAR(255) NOT NULL,
     AddressId  VARCHAR(255) NOT NULL,
     isDefault    VARCHAR(255) NOT NULL,
     createTime VARCHAR(255) NOT NULL,
     PRIMARY KEY ( id )
    )ENGINE=MyISAM DEFAULT CHARSET=utf8;`

// 创建商品列表
  let goods=
    `create table if not exists goods(
     id INT NOT NULL AUTO_INCREMENT,
     goodsId    VARCHAR(255) NOT NULL,   
     goodsName   VARCHAR(255) NOT NULL,  
     goodsImgArr text NOT NULL,  
     goodsPrice  VARCHAR(255) NOT NULL,   
     TopCategoryId  VARCHAR(255) NOT NULL,
     SecondaryCategoryId  VARCHAR(255) NOT NULL,
     ThirdCategoryId  VARCHAR(255) NOT NULL,
     goodsSize   VARCHAR(255) ,
     PRIMARY KEY ( id )
    )ENGINE=MyISAM DEFAULT CHARSET=utf8;`

// 创建购物车表
  let cartlist =
    `create table if not exists cartlist(
     id INT NOT NULL AUTO_INCREMENT,
     userId   VARCHAR(255) NOT NULL,
     goodsName   VARCHAR(255) NOT NULL,
     goodsPrice   VARCHAR(255) NOT NULL,
     goodsImgUrl     VARCHAR(255) NOT NULL,
     goodsId    VARCHAR(255) NOT NULL,
     goodsNumber  VARCHAR(255) NOT NULL,
     goodsSize  VARCHAR(255) NOT NULL,
     goodsStyle  VARCHAR(255) NOT NULL,
     PRIMARY KEY ( id )
    )ENGINE=MyISAM DEFAULT CHARSET=utf8;`


// 创建订单表
  let orderlist =
    `create table if not exists orderlist(
     id INT NOT NULL AUTO_INCREMENT,
     userId   VARCHAR(255) NOT NULL,
     orderId    VARCHAR(255) NOT NULL,
     goodsName   VARCHAR(255) NOT NULL,
     goodsPrice   VARCHAR(255) NOT NULL,
     goodsNumber  VARCHAR(255) NOT NULL,
     goodsImgUrl      VARCHAR(255) NOT NULL,
     orderType VARCHAR(255) NOT NULL,
     remark  VARCHAR(255) NOT NULL,
     PRIMARY KEY ( id )
    )ENGINE=MyISAM DEFAULT CHARSET=utf8;`


  // 系统优惠券表
  let couponlist =
  `create table if not exists coupon(
  id INT NOT NULL AUTO_INCREMENT,\
  couponId VARCHAR(255) NOT NULL,
  money   VARCHAR(255) NOT NULL,
  limt   VARCHAR(255) NOT NULL,
  startTime  VARCHAR(255) NOT NULL,
  endTime      VARCHAR(255) NOT NULL,
  PRIMARY KEY ( id )
  )ENGINE=MyISAM DEFAULT CHARSET=utf8;`

  // 用户优惠券表
  let usercoupon =
  `create table if not exists usercoupon(
  id INT NOT NULL AUTO_INCREMENT,\
  userId   VARCHAR(255) NOT NULL,
  couponId VARCHAR(255) NOT NULL,
  money   VARCHAR(255) NOT NULL,
  limt   VARCHAR(255) NOT NULL,
  startTime  VARCHAR(255) NOT NULL,
  endTime      VARCHAR(255) NOT NULL,
  PRIMARY KEY ( id )
  )ENGINE=MyISAM DEFAULT CHARSET=utf8;`



let createTable = ( sql ) => {
  return query( sql, [] )
}

// 建表
createTable(user);   // 用户表

createTable(address);  // 地址表

createTable(goods);  // 商品列表

createTable(cartlist)// 购物车列表

createTable(orderlist)// 订单列表

createTable(couponlist)// 优惠券的表

createTable(usercoupon) // 用户优惠券列表

/*用户查询*/

let searchUser=( value ) =>{
    let _sql = `select * from user where userName="${value}";`
    return query( _sql )
}

// 注册用户
let insertUser =  ( value ) => {
  let _sql = "insert into user set userName=?,userPwd=?,userId=?,createTime=?;"
  return query( _sql, value )
}

// 添加收货地址

let addAddress=(value)=>{
    let _sql = "insert into address set userId=?, ContactPerson=?,ContactNumber=?,ContactAddress=?,ContactDetailAddress=?,AddressId=?,isDefault=?,createTime=?;"
    return query( _sql, value );	
}


//获取收货地址
let addressList=(value)=>{
   let _sql=`select * from address where userId="${value}";`
    return query(_sql,value);
}


//修改收货地址
let editAddress=(value)=>{
   let _sql="update address set ContactPerson=?, ContactNumber=?, ContactAddress=?, ContactDetailAddress=? where AddressId=?;"
    return query(_sql,value);
}

//删除收货地址
let delAddress=(value)=>{
   let  _sql=`delete from address where addressId="${value}";`
   return query(_sql,value);
}


// 设置默认地址
let defaultAddress=(value)=>{
   let  _sql="update  address set isDefault=0 ;"
   return query(_sql,value);
}

let setDefaultAddress=(value)=>{
   let  _sql="update  address set isDefault=1 where addressId=? ;"
   return query(_sql,value);
}

// 提交订单
let  addOrder=(value)=>{
  let _sql="insert into orderlist  set userId=?,orderId=? goodsName=?,goodsPrice=?,goodsNumber=?,goodsImgUrl=?,orderType=?,remark=?;"
    return query(_sql,value);
}

// 订单列表
let getOrder=(value)=>{
  let _sql="select * from orderlist where userId=?;"
  return query(_sql,value);
}


// 订单详情
let orderDetail=(value)=>{
  let _sql="select * from orderlist where goodsId=?;"
  return query(_sql,value);
}


// 添加商品
let addGoods=(value)=>{
    let _sql = "insert into goodslist set goodsName=?,salePrice=?,imgUrl=?,categoryId=?,goodsId=?,goodsNumber=?;"
    return query( _sql, value );  
}

// 商品查询()
let categoryList=(TopCategoryId,SecondaryCategoryId,ThirdCategoryId,page,pageSize)=>{
let _sql= `select * from goods where (TopCategoryId is null or TopCategoryId="${TopCategoryId}" ) or  (SecondaryCategoryId is null or SecondaryCategoryId="${SecondaryCategoryId}" )    or (ThirdCategoryId is null or ThirdCategoryId="${ThirdCategoryId}" ) limit ${(page-1)*pageSize,pageSize} `;

   return query(_sql,[]); 
}


// 加入购物车
let  addCart=(value)=>{
  let _sql="insert into cartlist  set userId=?, goodsName=?,goodsPrice=?,goodsImgUrl=?,goodsId=?,goodsNumber=?,goodsSize=?,goodsStyle=?; "
    return query(_sql,value);
}



//删除购物车商品
let delCart=(value)=>{
   let  _sql=`delete from cartlist where goodsId="${value}";`
   return query(_sql,value);
}

//获取购物车商品
let getCart=(value)=>{
   let  _sql=`select * from cartlist where userId="${value}";`
   return query(_sql,value);
} 



// 商品详情
let goodsDetail=(value)=>{
  let _sql = "select * from goods where goodsId=?"
  return query(_sql,value);
}






/*查询系统所有优惠券*/
let  couponList=()=>{
  let _sql="select * from coupon"
  return query( _sql);  
}

let  searchCoupon=(value)=>{
  let _sql="select * from coupon where couponId=?;"
  return query( _sql,value);  
}


/*添加系统优惠券*/
let addCoupon=(value)=>{
  let _sql = "insert into coupon set couponId=?,money=?,limt=?,startTime=?,endTime=?;"
  return query( _sql, value );  
}


// 用户领取优惠券

let drawCoupon=(value)=>{

  let _sql = "insert into usercoupon set userId=?,couponId=?,money=?,limt=?,startTime=?,endTime=?;"
  return query( _sql, value ); 
}


// 获取用户领取的优惠券
let getCoupon=(value)=>{
  let  _sql=`select * from usercoupon where userId="${value}";`
  return query(_sql,[]);
} 








// 导出
module.exports = {
	query,   // 查询语句
	createTable,  // 创建表
	insertUser,   // 用户注册
	addAddress,   // 添加地址
  addressList,  // 地址列表
  delAddress,   // 删除地址
  editAddress,  // 修改地址
  defaultAddress, // 设置默人地址
  setDefaultAddress,
  searchUser,   // 用户查询
  categoryList ,    // 商品列表查询
  addCart,     // 加入购物车
  goodsDetail,  // 查看商品详情
  delCart ,   // 从购物车删除
  getCart,    // 获取购物车
  getOrder,   // 获取订单列表平
  addOrder, // 提交订单
  orderDetail,  // 订单详情
  addCoupon , // 添加优惠券
  couponList, // 获取系统所有优惠券
  searchCoupon, // 查询优惠券信息
  drawCoupon, // 用户领取优惠券
  getCoupon // 获取用户领取的优惠券


}


