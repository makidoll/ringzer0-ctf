const request = require("request-promise-native");
const { exec } = require("child_process");
const fs = require("fs");
const config = require("../config.js");

function execCmd(cmd) {
	return new Promise((resolve,reject)=>{
		exec(cmd, (err, stdout, stderr) => {
			if (err) return reject(err);
			if (stderr) return reject(stderr);
			return resolve(stdout)
		});
	});
}

function shellcodeInC(shellcode) {
	return (
`
#include <stdio.h>

unsigned char code[] = "${shellcode}";

int main(void) {
	int (*ret)() = (int(*)())code;
	ret();
}
`
	);
}

(async ()=>{
	const url = "https://ringzer0ctf.com/challenges/121";

	let html = await request({
		url: url,
		headers: {
			Cookie: config.cookies
		}
	});
	html = html.replace(/<br\/>/gi, "");
	html = html.replace(/<br \/>/gi, "");

	let shellcode = (/----- BEGIN SHELLCODE -----([\s\S]*?)----- END SHELLCODE -----/).exec(html);
	shellcode = shellcode[1].trim();
	let ccode = shellcodeInC(shellcode);

	await fs.writeFileSync("test.c", ccode);
	await execCmd("gcc -fno-stack-protector -z execstack test.c -o test.elf");
	let output = await execCmd("./test.elf 0>&1"); 
	console.log(output)

	html = await request({
		url: url+"/"+output,
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