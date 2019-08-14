const request = require("request-promise-native");
const Bruteforcer = require("bruteforcer");
const crypto = require("crypto");
const config = require("../config.js");

function decrypt(hash, salt) {
	return new Promise((resolve,reject)=>{
		let maxPossible = Math.pow(52, 6);
		let currentPercent = -1;

		let bf = new Bruteforcer({
			chars: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
			min: 6,
			max: 6,
			cbk: (value,caseIdx,caseNum)=>{
				let percent = Math.floor(caseIdx/maxPossible*100);
				if (percent>currentPercent) {
					currentPercent = percent;
					console.log(percent+"%");
				}

				let testHash = crypto.createHash("sha1");
				testHash.update(value+salt);
				testHash = testHash.digest("hex");

				if (testHash == hash) {
					resolve(value);
					return true;
				}

				return false;
			}
		});

		bf.start();
	});
}

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/57";

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

	let salt = (/----- BEGIN SALT -----([\s\S]*?)----- END SALT -----/m).exec(html);
	salt = salt[1].trim();

	let value = await decrypt(hash, salt);

	console.log(value);







		
	// html = await request({
	// 	url: url+"/"+text,
	// 	headers: {
	// 		Cookie: config.cookies
	// 	}
	// });
	// html = html.replace(/<br\/>/gi, "");
	// html = html.replace(/<br \/>/gi, "");
	
	// let flag = (/<div class=['"]alert(?:[\s\S]*?)>([\s\S]*?)<\/div>/).exec(html);
	// flag = flag[1].trim();
	// console.log(flag);
})();