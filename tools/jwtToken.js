
const jwt = require('jsonwebtoken');
const jwtTokenSecret=require('../config/jwtTokenSecret'); 



let setToken = (userId)=>{
//jwt生成token
  var token = jwt.sign({ userId:userId },jwtTokenSecret.Secret,{expiresIn: 60*60*24});
      return token;
};



let verifyToken=(token)=>{
  // 解析token
    var decoded = jwt.verify(token, jwtTokenSecret.Secret);   
        return decoded.userId;
}


module.exports={
  setToken,
  verifyToken,


}