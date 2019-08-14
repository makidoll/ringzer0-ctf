const request = require("request-promise-native");
const crypto = require("crypto");
const config = require("../config.js");

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/32";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");

	let message = (/----- BEGIN MESSAGE -----([\s\S]*?)----- END MESSAGE -----/m).exec(html);
	message = message[1].trim();

	let n = (/([\s\S]*?) \+ ([\s\S]*?) \- ([\s\S]*?) =/).exec(message);
	n = [
		parseInt(n[1], 10),
		parseInt(n[2], 16),
		parseInt(n[3], 2),
	];
	n = n[0]+n[1]-n[2];
	console.log(n);

	html = await request({
		url: url+"/"+n,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");
	
	let flag = (/<div class=['"]alert(?:[\s\S]*?)>([\s\S]*?)<\/div>/).exec(html);
	flag = flag[1].trim();
	console.log(flag);
})();