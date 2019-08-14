const request = require("request-promise-native");
const crypto = require("crypto");
const dcipher = require("dcipher");
const config = require("../config.js");
 
(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/56";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");

	let hash = (/----- BEGIN HASH -----([\s\S]*?)----- END HASH -----/m).exec(html);
	hash = hash[1].trim();
	console.log(hash);
	
	dcipher(hash).then(async text=>{
		console.log(text);
		
		html = await request({
			url: url+"/"+text,
			headers: {
				Cookie: config.cookies
			}
		});
		html = html.replace(/<br\/>/gi, "");
		html = html.replace(/<br \/>/gi, "");
		
		let flag = (/<div class=['"]alert(?:[\s\S]*?)>([\s\S]*?)<\/div>/).exec(html);
		flag = flag[1].trim();
		console.log(flag);
	});
})();