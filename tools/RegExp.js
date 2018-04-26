
 const ExpUser=new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");//是数字和字母和中文
 const ExpPwd=new RegExp("^(?=.*\\d)(?=.*[a-z])[a-z\\d]{6,16}$|^(?=.*\\d)(?=.*[A-Z])[A-Z\\d]{6,16}$|^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z]{6,16}$");//密码的数字字母特殊字符

module.exports={
	ExpUser,
	ExpPwd
}