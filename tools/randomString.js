
let generateUUID = ()=>{
	var d = new Date().getTime();
	var uuid = 'xxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = (d + Math.random()*16)%16 | 0;
	  d = Math.floor(d/16);
	  return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};

let randomNum=()=>{
	var str = '';
	for(var i = 0; i <10; i += 1){
			str+= Math.floor(Math.random() * 10);
	}
  return str;
		
};


module.exports={
	generateUUID,
	randomNum
}