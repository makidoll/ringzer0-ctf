var punchcard = require("../libs/punchcard");

punchcard.readImage(__dirname+"/172.png").then(text=>{console.log(text)});