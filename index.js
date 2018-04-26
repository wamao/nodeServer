var server = require("./server/server");
var router = require("./route/route");

var requestHandlers =require("./requestHandler/requestHandlers");




var handle = {}
handle["/"] = requestHandlers.hello;
handle["/register"] = requestHandlers.register; // 用户注册
handle["/login"] = requestHandlers.login;       // 用户登录
handle["/loginOut"]=requestHandlers.loginOut;   // 退出登录
handle["/addAddress"]=requestHandlers.addAddress; // 添加地址
handle["/getAddress"]=requestHandlers.addressList; // 获取地址列表
handle["/delAddress"]=requestHandlers.delAddress; // 删除地址
handle["/editAddress"]=requestHandlers.editAddress; // 修改地址
handle["/goodsList"]=requestHandlers.goodsList ;// 商品列表查询
handle["/addCart"]=requestHandlers.addCart;  //加入购物车
handle["/delCart"]=requestHandlers.delCart; // 购物车删除商品
handle["/getCart"]=requestHandlers.getCart  // 获取购物车商品
handle["/goodsDetail"]=requestHandlers.goodsDetail;  //获取商品详情
handle["/defaultAddress"]=requestHandlers.defaultAddress; // 设置默认地址
handle["/orderList"]=requestHandlers.orderList;   //  订单列表
handle["/orderDetail"]=requestHandlers.orderDetail;   // 订单相详情
handle["/addOrder"]=requestHandlers.addOrder; // 提交订单
handle["/getOrder"]=requestHandlers.getOrder;  // 订单查询
handle["/orderDetail"]=requestHandlers.orderDetail;  // 订单详情
server.start(router.route, handle);











