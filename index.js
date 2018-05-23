var server = require("./server/server");
var router = require("./route/route");

var requestHandlers =require("./requestHandler/requestHandlers");




var handle = {}
handle["/"] = requestHandlers.hello;
handle["/register"] = requestHandlers.register; // 用户注册
handle["/login"] = requestHandlers.login;       // 用户登录
handle["/wxlogin"]=requestHandlers.wxlogin; // 微信用户授权登录
handle["/loginOut"]=requestHandlers.loginOut;   // 退出登录
handle["/addAddress"]=requestHandlers.addAddress; // 添加地址
handle["/getAddress"]=requestHandlers.addressList; // 获取地址列表
handle["/delAddress"]=requestHandlers.delAddress; // 删除地址
handle["/editAddress"]=requestHandlers.editAddress; // 修改地址
handle["/categoryList"]=requestHandlers.categoryList ;// 商品列表查询
handle["/category"]=requestHandlers.category;// 获取所有的商品分类
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
handle["/addCoupon"]=requestHandlers.addCoupon;  // 添加优惠券
handle["/drawCoupon"]=requestHandlers.drawCoupon;  // 用户领取优惠券
handle["/getCoupon"]=requestHandlers.getCoupon;  // 获取用户已经领取优惠券
handle["/couponList"]=requestHandlers.couponList;  //获取系统所有优惠券
handle["/submitOrder"]=requestHandlers.submitOrder; // 提交订单
handle["/cancelOrder"]=requestHandlers.cancelOrder; // 取消订单
handle["/collect"]=requestHandlers.collect; //收藏商品
handle["/cancelCollect"]=requestHandlers.cancelCollect; // 取消收藏
handle["/getCollect"]=requestHandlers.getCollect; // 获取所有收藏
handle["/isCollect"]=requestHandlers.isCollect; // 判断用户是否已经收藏

server.start(router.route, handle);











