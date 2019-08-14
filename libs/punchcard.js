const Jimp = require("jimp");

const newImage = (w,h,color)=>new Promise((resolve,reject)=>{
	new Jimp(w, h, color, (err, card)=>{
		if (err) return reject(err);
		return resolve(card);
	});
});

// https://upload.wikimedia.org/wikipedia/commons/4/4c/Blue-punch-card-front-horiz.png
//  0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#,$.-@%*<-/+_)¢|&>:;¬'?"=!(,.
var punchMap = {
	// 0123456789
	"            ": ' ',
	"  #         ": '0',
	"   #        ": '1',
	"    #       ": '2',
	"     #      ": '3',
	"      #     ": '4',
	"       #    ": '5',
	"        #   ": '6',
	"         #  ": '7',
	"          # ": '8',
	"           #": '9',
	// 0123456789
	"#  #        ": 'A',
	"#   #       ": 'B',
	"#    #      ": 'C',
	"#     #     ": 'D',
	"#      #    ": 'E',
	"#       #   ": 'F',
	"#        #  ": 'G',
	"#         # ": 'H',
	"#          #": 'I',
	// 0123456789
	" # #        ": 'J',
	" #  #       ": 'K',
	" #   #      ": 'L',
	" #    #     ": 'M',
	" #     #    ": 'N',
	" #      #   ": 'O',
	" #       #  ": 'P',
	" #        # ": 'Q',
	" #         #": 'R',
	// 0123456789
	"  # #       ": 'S',
	"  #  #      ": 'T',
	"  #   #     ": 'U',
	"  #    #    ": 'V',
	"  #     #   ": 'W',
	"  #      #  ": 'X',
	"  #       # ": 'Y',
	"  #        #": 'Z',
	// fortran
	// 0123456789
	"  ##        ": '/',
	"  #  #    # ": ',',
	"#      #  # ": '(',
	" #     #  # ": ')',
	"        # # ": '=',
	"#       # # ": '+',
	" #          ": '-',
	
	"#    #    # ": '.',
	/*
	// 0123456789
	"     #    # ": '#',
	"  #  #    # ": ',',
	" #   #    # ": '$',
	"#    #    # ": '.',
	" #          ": '-',
	"      #   # ": '@',
	"  #   #   # ": '%',
	" #    #   # ": '*',
	"#     #   # ": '<',
	// 0123456789
	" #          ": '-', // double
	"  ##        ": '/',
	"#       # # ": '+',
	"  #    #  # ": '_',
	" #     #  # ": ')',
	"#   #     # ": '¢',
	"#        ## ": '|',
	"#           ": '&',
	"  #     # # ": '>',
	// 0123456789
	"    #     # ": ':',
	" #      # # ": ';',
	" #       ## ": '¬',
	"       #  # ": '\'',
	"  #      ## ": '?',
	"         ## ": '"',
	"        # # ": '=',
	" #  #     # ": '!',
	"  #  #    # ": ',', // double
	"#    #    # ": '.', // double
	*/
};

var punchMapChars = (obj=>{
	var out = {};
	for(var key in obj){
		out[obj[key]] = key;
	}
	return out;
})(punchMap);

// ["#  ", " # ", "  #"]
var readArray = charArray=>new Promise(async (resolve,reject)=>{
	let out = "";

	for (let i in charArray) {
		let punchStr = charArray[i];

		// convert punchstr to spaces and hashes
		punchStr = Array.from(punchStr).map(c=>(c==" "?" ":"#")).join("");

		// fill out out
		let char = punchMap[punchStr];
		if (char == undefined) {
			out += " ";
		} else {
			out += char;
		}

	}

	return resolve(out);
});

var readImageAsArray = file=>new Promise(async (resolve,reject)=>{
	let image = await Jimp.read(file);

	//if (image.bitmap.height != 12)
	//	return reject("Incorrect dimensions");

	function getPunched(x, y) {
		return (image.bitmap.data[
			(y*image.bitmap.width+x)*4
		]>128);
	}

	let charArray = [];
	for (let x=0; x<image.bitmap.width; x++) {
		let punchStr = "";
		for (let y=0; y<12; y++) {
			if (getPunched(x,y)) {
				punchStr += "#";
			} else {
				punchStr += " ";
			}
		}
		charArray.push(punchStr);
	}

	return resolve(charArray);
});

var readImage = file=>new Promise(async (resolve,reject)=>{
	let array = await readImageAsArray(file);
	let out = await readArray(array);
	return resolve(out);
});

var writeArray = text=>new Promise(async (resolve,reject)=>{
	var charArray = [];
	text = Array.from(text);

	for (let i in text) {
		let char = text[i];
		let punchStr = punchMapChars[char];
		if (punchStr == undefined) {
			charArray.push(punchMapChars[" "]);
		} else {
			charArray.push(punchStr);
		}
	}

	return resolve(charArray);
});

var writeImage = text=>new Promise(async (resolve,reject)=>{
	var image = await newImage(text.length, 12, "#000000");

	function putPunch(x, y) {
		let i = (y*image.bitmap.width+x)*4;
		image.bitmap.data[i  ] = 255;
		image.bitmap.data[i+1] = 255;
		image.bitmap.data[i+2] = 255;
		image.bitmap.data[i+3] = 255;
	}

	//text = text.toUpperCase().replace(/[^A-Z0-9#,$\.\-@%*</+_)¢|&>:;¬'?"=!( ]/gi, "");
	text = text.toUpperCase();

	Array.from(text).forEach((char,x)=>{
		char = punchMapChars[char];
		if (char == undefined) return;

		Array.from(char).forEach((punch,y)=>{
			if (punch!=" ") putPunch(x, y);
		});
	});

	return resolve(image);
});

module.exports = {
	readArray,
	readImage,
	readImageAsArray,
	writeArray,
	writeImage,
};

const test = false;
if (test) {
	(async ()=>{
		let testText = "1 2 3 4";
		let testCharArray = [
			"   #        ",
			"            ",
			"    #       ",
			"            ",
			"     #      ",
			"            ",
			"      #     ",
		];

		console.log('WRITING TEXT TO ARRAY');
		console.log(await writeArray(testText));
		console.log("");

		console.log('WRITING TEXT TO IMAGE');
		let image = await writeImage(testText)
		await image.write("punchcard-test.png");
		console.log("punchcard-test.png");
		console.log("");

		console.log("READING ARRAY TO TEXT");
		console.log(await readArray(testCharArray));
		console.log("");

		console.log("READING IMAGE TO TEXT");
		console.log(await readImage(__dirname+"/punchcard-test.png"));
		console.log("");

		console.log("READING IMAGE TO ARRAY");
		console.log(await readImageAsArray(__dirname+"/punchcard-test.png"));
	})();
}