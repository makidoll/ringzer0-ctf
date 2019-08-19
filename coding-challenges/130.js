const Client = require("ssh2").Client;
const mitt = require("mitt");

const testRandomNumber = Math.floor(Math.random()*10000);
const testIsCorrect = n=>new Promise((resolve,reject)=>{
	if (n<testRandomNumber) return resolve("too small");
	if (n>testRandomNumber) return resolve("too big");
	if (n==testRandomNumber) return resolve("you win");
});

const guessNumber = (isCorrect)=>new Promise(async (resolve,reject)=>{ // 1 to 10000
	let min = 0; // -1 (actually 1)
	let max = 10000;

	let found = false;

	while (!found) {
		let n = Math.round(min/2+max/2);

		let where = await isCorrect(n);
		if (where == "too small") {
			min = n;
		} else if (where == "too big") {
			max = n;
		} else if (where == "you win") {
			found = true;
			//console.log("Found: "+n);
			return resolve(n);
		}

		//console.log("n: "+n+", Min: "+min+", Max: "+max);
	}	
});

// guessNumber(testIsCorrect).then(console.log);

var conn = new Client();

conn.on("ready", ()=>{
	conn.shell((err,stream)=>{
		if (err) {
			console.log(err);
			process.exit();		
		}

		var events = mitt();
		stream.on("data", data=>{
			data = data.toString();
			console.log(data);
			events.emit("data", data.toString());
		});

		const isCorrect = n=>new Promise((resolve,reject)=>{
			const onData = data=>{
				if (data.includes("too small")) {
					events.off("data", onData);
					resolve("too small");
					return;
				}

				if (data.includes("too big")) {
					events.off("data", onData);
					resolve("too big");
					return;
				}

				if (data.includes("you win")) {
					events.off("data", onData);
					resolve("you win");
					return;
				}
			};

			events.on("data", onData);
			stream.write(n+"\n");
		});

		setTimeout(async ()=>{
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
			await guessNumber(isCorrect).then(console.log);
		}, 1000);
	});
});

conn.connect({
	host: "challenges.ringzer0team.com",
	port: 10130,
	username: "number",
	password: "Z7IwIMRC2dc764L",
});