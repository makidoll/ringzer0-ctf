const Jimp = require("jimp");
const fs = require("fs");
const punchcard = require("../../libs/punchcard");

const writeTestImages = false;

const newImage = (w,h,color)=>new Promise((resolve,reject)=>{
	new Jimp(w, h, color, (err, card)=>{
		if (err) return reject(err);
		return resolve(card);
	});
});

(async ()=>{
	let dir = fs.readdirSync(__dirname+"/original");
	for (let i in dir) {
		let filename = dir[i];
		let image = await Jimp.read(__dirname+"/original/"+filename);

		let charArray = [];

		for (let x=0; x<80; x++) {
			let punchStr = "";

			for (let y=0; y<12; y++) {
				let i = image.getPixelIndex(
					155 + (x * (image.bitmap.width/80)*0.94), 
					165 + (y * (image.bitmap.height/12)*0.93)
				);

				if (
					image.bitmap.data[i+0] < 32 &&
					image.bitmap.data[i+1] < 32 &&
					image.bitmap.data[i+2] < 32
				) {
					punchStr += "#";
				} else {
					punchStr += " ";
				}

				if (writeTestImages) {
					image.bitmap.data[i+0] = 255;
					image.bitmap.data[i+1] = 0;
					image.bitmap.data[i+2] = 0;
				}
			}

			charArray.push(punchStr);
		}

		if (writeTestImages)
			await image.write(__dirname+"/test/"+filename);

		let out = await punchcard.readArray(charArray);
		console.log(out);
	}
})();