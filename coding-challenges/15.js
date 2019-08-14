const request = require("request-promise-native");
const { exec } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const config = require("../config.js");
 
function md5(data) {
	let hash = crypto.createHash("md5");
	hash.update(data);
	hash = hash.digest("hex");
	return hash;
}

function execCmd(cmd) {
	return new Promise((resolve,reject)=>{
		exec(cmd, (err, stdout, stderr) => {
			if (err) return reject(err);
			if (stderr) return reject(stderr);
			return resolve(stdout)
		});
	});
}

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/15";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");

	let elf = (/----- BEGIN Elf Message -----([\s\S]*?)----- End Elf Message -----/).exec(html);
	elf = elf[1].trim();
	elf = Buffer.from(elf, "base64").reverse();

	let checksum = (/----- BEGIN Checksum -----([\s\S]*?)----- END Checksum -----/).exec(html);
	checksum = checksum[1].trim();

	if (md5(elf)!=checksum) return console.log("Checksum fail. Try again");

	await fs.writeFileSync("test.elf", elf);
	let output = await execCmd('r2 -Qc "pd @main" test.elf'); 

	let words = output.match(/; '([\s\S]*?)'/g);
	let word = (
		(/'([\s\S]*?)'/).exec(words[1])[1]+
		(/'([\s\S]*?)'/).exec(words[2])[1]
	);

	html = await request({
		url: url+"/"+word,
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