const request = require("request-promise-native");
const crypto = require("crypto");
const config = require("../config.js");

function parseBitsToBuffer(bitsString) {
	let buffer = Buffer.alloc(Math.ceil(bitsString.length/8));

	let byte = "";
	let byteIndex = 0;
	bitsString.split("").forEach((bit,i)=>{
		byte += bit;

		if (i%8==7) {
			buffer[byteIndex] = parseInt(byte, "2");
			byte = "";
			byteIndex++;
		}
	});

	return buffer;
}

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/14";

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
	
	let buffer = parseBitsToBuffer(message);

	let hash = crypto.createHash("sha512");
	hash.update(buffer);
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