const request = require("request-promise-native");
const fs = require("fs");
const config = require("../config.js");

var charMap = {
	"0": [
		" xxx  ",
		"x   x ",
		"x   x ",
		"x   x ",
		" xxx  ",
	],
	"1": [
		" xx   ",
		"x x   ",
		"  x   ",
		"  x   ",
		"xxxxx ",
	],
	"2": [
		" xxx  ",
		"x   x ",
		"  xx  ",
		" x    ",
		"xxxxx ",
	],
	"3": [
		" xxx  ",
		"x   x ",
		"  xx  ",
		"x   x ",
		" xxx  ",
	],
	"4": [
		" x   x",
		"x    x",
		" xxxxx",
		"     x",
		"    x ",
	],
	"5": [
		"xxxxx ",
		"x     ",
		" xxxx ",
		"    x ",
		"xxxxx ",
	],
};

// reverse charMap so its charStr to char
let tempCharMap = {};
Object.keys(charMap).forEach(char=>{
	tempCharMap[charMap[char].join("")] = char;
});
charMap = tempCharMap;

function sixChars(msg) {
	return (msg+"      ").substring(0,6);
}

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/119";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "\n");
	html = html.replace(/<br \/>/gi, "\n");

	let msg = (/----- BEGIN MESSAGE -----([\s\S]*?)----- END MESSAGE -----/).exec(html);
	msg = msg[1].trim();
	msg = msg.replace(/&nbsp;/gi, " ");
	msg = msg.split("\n");

	let out = "";

	let lineIndex = 0;
	let charStr = "";
	msg.forEach(line=>{
		if (lineIndex == 0 && line == "") {
			return;
		}

		//console.log(line);
		charStr += sixChars(line);
		lineIndex++;

		if (lineIndex == 5) {
			out += charMap[charStr];
			charStr = ""
			lineIndex = 0;
			return;
		}
	});

	out = out.trim();
	console.log(out)

	html = await request({
		url: url+"/"+out,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");
	
	let flag = html.match(/FLAG-.{26}/g)[0];
	console.log(flag);
})();