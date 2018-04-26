var mysql = require('mysql');
var config = require('../config/mysql.js')

var data=require('../tools/data');


// /*批量插入数据*/
var connection = mysql.createConnection({
 host  : 'localhost',
 user  : 'root',
 password : 'root',
 database : 'other'
});

//   var arrlist=[] 
//   var k=36;

//     for(var i=k*1000;i<1000*(k+1);i++){
//       let arr=[];
     
//       let price=data[i].goodsPrice;
//       var newPrice;
//       if(price){
//         newPrice=price.replace('￥','');
//       }
       
//        arr.push(data[i].goodsId);
//        arr.push(data[i].goodsName);
//        arr.push(data[i].goodsImgArr.toString());  
//        arr.push(newPrice);
//        arr.push(data[i].goodsDescription);
//        arr.push("暂无相关评价");
//        arr.push(data[i].categoryId);
//        arr.push('1');

//        arrlist.push(arr);
//     }




// var sql = "INSERT INTO goodslist( `goodsId`,`goodsName`,`goodsImgArr`,`goodsPrice`,`goodsDescription`,`goodsComment`,`categoryId`,`goodsNumber`) VALUES ?";
// connection.query(sql, [arrlist], function (err, rows, fields) {
//  if(err){
//     console.log('INSERT ERROR - ', err.message);
//     return;
//    }
//    console.log(rows);
// });





//  return ;


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
     userName VARCHAR(100) NOT NULL,
     userPwd  VARCHAR(100) NOT NULL,
     userId   VARCHAR(100) NOT NULL,
     createTime VARCHAR(100) NOT NULL, 
     PRIMARY KEY ( id )
    );`

// 创建用户地址表
  let address =
    `create table if not exists address(
     id INT NOT NULL AUTO_INCREMENT,
     userId  VARCHAR(100) NOT NULL,
     ContactPerson  VARCHAR(100) NOT NULL,
     ContactNumber   VARCHAR(100) NOT NULL,
     ContactAddress   VARCHAR(100) NOT NULL,
     ContactDetailAddress   VARCHAR(100) NOT NULL,
     AddressId  VARCHAR(100) NOT NULL,
     isDefault    VARCHAR(100) NOT NULL,
     createTime VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`

// 创建商品列表
  let goodslist =
    `create table if not exists goodslist(
     id INT NOT NULL AUTO_INCREMENT,
     goodsId    VARCHAR(100) NOT NULL,   
     goodsName   VARCHAR(100) NOT NULL,  
     goodsImgArr VARCHAR(100) NOT NULL,  
     goodsPrice  VARCHAR(100) NOT NULL,   
     goodsDescription   VARCHAR(100) NOT NULL, 
     goodsComment   VARCHAR(100), 
     categoryId    VARCHAR(100) NOT NULL, 
     goodsNumber  VARCHAR(100) NOT NULL,  
     PRIMARY KEY ( id )
    );`

// 创建购物车表
  let cartlist =
    `create table if not exists cartlist(
     id INT NOT NULL AUTO_INCREMENT,
     userId   VARCHAR(100) NOT NULL,
     goodsName   VARCHAR(100) NOT NULL,
     goodsPrice   VARCHAR(100) NOT NULL,
     goodsImgArr     VARCHAR(100) NOT NULL,
     goodsId    VARCHAR(100) NOT NULL,
     goodsNumber  VARCHAR(100) NOT NULL,
     goodsSize  VARCHAR(100) NOT NULL,
     goodsColor  VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`


// 创建订单表
  let orderlist =
    `create table if not exists cartlist(
     id INT NOT NULL AUTO_INCREMENT,
     userId   VARCHAR(100) NOT NULL,
     goodsName   VARCHAR(100) NOT NULL,
     goodsPrice   VARCHAR(100) NOT NULL,
     goodsImgArr      VARCHAR(100) NOT NULL,
     categoryId    VARCHAR(100) NOT NULL,
     goodsId    VARCHAR(100) NOT NULL,
     goodsNumber  VARCHAR(100) NOT NULL,
     orderType VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`


let createTable = ( sql ) => {
  return query( sql, [] )
}

// 建表
createTable(user);   // 用户表

createTable(address);  // 地址表

createTable(goodslist);  // 商品列表

createTable(cartlist)// 购物车列表

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
  let _sql="insert into orderlist  set userId=?, goodsName=?,salePrice=?,imgUrl=?,categoryId=?,goodsId=?,goodsNumber=?,orderType=?;"
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

// 商品查询
let goodsList=(page,pageSize,sort)=>{
  // let _sql = ` select * FROM posts limit ${(page-1)*10},10;`
  
   let _sql= ` select * from goodslist order by id desc limit ${(page-1)*pageSize,pageSize} `;
   return query(_sql,[]); 
}


// 加入购物车
let  addCart=(value)=>{
  let _sql="insert into cartlist  set userId=?, goodsName=?,goodsPrice=?,goodsImgArr=?,goodsId=?,goodsNumber=?,goodsSize=?,goodsColor=?; "
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
  let _sql = "select * from goodslist where goodsId=?"
  return query(_sql,value);
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
  goodsList ,    // 商品列表查询
  addCart,     // 加入购物车
  goodsDetail,  // 查看商品详情
  delCart ,   // 从购物车删除
  getCart,    // 获取购物车
  getOrder,   // 获取订单列表平
  addOrder, // 提交订单
  orderDetail  // 订单详情


}


