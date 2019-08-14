const request = require("request-promise-native");
const crypto = require("crypto");
const config = require("../config.js");

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/13";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");

	let message = (/----- BEGIN MESSAGE -----([\s\S]*?)----- END MESSAGE -----/).exec(html);
	message = message[1].trim();

	let hash = crypto.createHash("sha512");
	hash.update(message, "utf8");
	hash = hash.digest("hex");
	console.log(hash)

	html = await request({
		url: url+"/"+hash,
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