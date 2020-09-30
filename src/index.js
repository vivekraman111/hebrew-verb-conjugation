
function sayHello(str){
	return "hello" + (str ? " " + str : "") + "!"
}

module.exports = {sayHello};