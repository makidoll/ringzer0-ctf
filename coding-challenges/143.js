function parseRaw(rawSudoku) {
	let sudoku = [];
	for (let y=0; y<9; y++) {
		sudoku[y] = []
		for (let x=0; x<9; x++) {
			sudoku[y][x] = "";
		}
	}

	let y = 0;
	rawSudoku.split("\n").forEach((line,i)=>{
		if (line.substring(0,1) == "+") return;

		line = line.split("|").slice(1,-1);
		line.forEach((n,x)=>{
			n = n.trim();
			sudoku[y][x] = (n=="")?-1:parseInt(n);
		});

		y++;
	});

	return sudoku;
}

function print(sudoku) {
	for (let y=0; y<9; y++) {
		console.log("+---+---+---+---+---+---+---+---+---+")
		let out = "|";
		for (let x=0; x<9; x++) {
			if (sudoku[y][x]==-1) {
				out += "   |";
			} else {
				out += " "+sudoku[y][x]+" |";
			}
		}
		console.log(out);
	}
	console.log("+---+---+---+---+---+---+---+---+---+");
}

function findPossibleNumbers(sudoku, x, y) {
	if (x<0 && x>8 && y<0 && y>8) return [];
	let possible = [1,2,3,4,5,6,7,8,9];

	// horizontal
	for (let tempX=0; tempX<9; tempX++) {
		let n = sudoku[y][tempX];
		//console.log(n);
		if (possible.includes(n)) 
			possible.splice(possible.indexOf(n), 1);
	}

	// vertical
	for (let tempY=0; tempY<9; tempY++) {
		let n = sudoku[tempY][x];
		//console.log(n);
		if (possible.includes(n)) 
			possible.splice(possible.indexOf(n), 1);
	}

	// 3x3 square
	let squareX = Math.floor(x/3)*3;
	let squareY = Math.floor(y/3)*3;
	for (let tempY=0; tempY<3; tempY++) {
		for (let tempX=0; tempX<3; tempX++) {
			let n = sudoku[squareY+tempY][squareX+tempX];
			//console.log(n);
			if (possible.includes(n)) 
				possible.splice(possible.indexOf(n), 1);
		}
	}

	return possible;
}

function itteratePossibleAndUpdate(sudoku) {
	let updated = false;
	for (let y=0; y<9; y++) {
		for (let x=0; x<9; x++) {
			if (sudoku[y][x]!=-1) continue;

			let possible = findPossibleNumbers(sudoku, x, y);
			if (possible.length>0) {
				let n = possible[0];
				sudoku[y][x] = n;
				updated = true;
				//console.log(x+","+y+": "+n);
			}
		}
	}
	return updated;
}

function isSolved(sudoku) {
	for (let y=0; y<9; y++) {
		for (let x=0; x<9; x++) {
			if (sudoku[y][x]==-1) return false;
		}
	}
	return true;
}

function solve(sudoku) {



}

var sudoku = parseRaw(
`+---+---+---+---+---+---+---+---+---+
|   | 4 |   |   |   |   |   |   |   |
+---+---+---+---+---+---+---+---+---+
|   |   |   |   |   |   |   | 2 |   |
+---+---+---+---+---+---+---+---+---+
|   |   |   |   |   |   |   |   |   |
+---+---+---+---+---+---+---+---+---+
|   | 3 | 9 | 2 |   | 4 |   |   | 8 |
+---+---+---+---+---+---+---+---+---+
|   |   | 5 |   |   | 6 |   |   |   |
+---+---+---+---+---+---+---+---+---+
|   |   | 4 |   |   | 5 | 6 |   | 2 |
+---+---+---+---+---+---+---+---+---+
|   |   |   |   |   | 8 |   |   | 5 |
+---+---+---+---+---+---+---+---+---+
|   |   |   |   | 2 |   |   |   | 1 |
+---+---+---+---+---+---+---+---+---+
| 4 |   | 6 | 5 |   |   | 2 |   |   |
+---+---+---+---+---+---+---+---+---+`
);

// fuck im using a library

const solve2 = require("@mattflow/sudoku-solver");
const Client = require("ssh2").Client;

function parseAsStr(sudoku) {
	let sudokuStr = "";

	for (let y=0; y<9; y++) {
		for (let x=0; x<9; x++) {
			let n = sudoku[y][x];
			sudokuStr += (n==-1)?0:n;
		}
	}

	return sudokuStr;
}

var conn = new Client();

conn.on("ready", ()=>{
	conn.shell((err,stream)=>{
		if (err) {
			console.log(err);
			process.exit();		
		}

		let rawSudoku = "";
		let takeInput = true;

		stream.on("data", data=>{
			data = data.toString();
			console.log(data);

			if (takeInput) {
				rawSudoku += data;
			}
		});

		setTimeout(()=>{
			takeInput = false;

			rawSudoku = (/The sudoku challenge([\s\S]*?)Solve this/).exec(rawSudoku);
			rawSudoku = rawSudoku[1].trim();
			rawSudoku = rawSudoku.replace(/\r/g, "");

			let sudokuStr = parseAsStr(parseRaw(rawSudoku));
			console.log(sudokuStr);
			let solved = solve2(sudokuStr);
			console.log(solved);

			solved = solved.split("").join(",");
			stream.write(solved+"\n");
		}, 100);
	});
});

conn.connect({
	host: "challenges.ringzer0team.com",
	port: 10143,
	username: "sudoku",
	password: "dg43zz6R0E",
});