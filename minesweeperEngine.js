var gameOptionsBTNstatus = "closed";
var gameSettings = [{gtype:"Beginner", r:9, c:9, m:10},{gtype:"Intermediate", r:16, c:16, m:40},{gtype:"Expert", r:16, c:30, m:99}];
var currentType;
var currentSettings;
var mines = [];
var gameState = "waiting";
var startTime;
var gameTimer;

function openCloseGameOptions(){
	if(gameOptionsBTNstatus === "closed"){
		gameOptionsBTNstatus = "open";
		var gameOptionsDiv = document.getElementById("gameOptions");
		gameOptionsDiv.style.top = (document.getElementById("btnOptions").getBoundingClientRect().top + document.getElementById("btnOptions").clientHeight + 1) + "px";
		gameOptionsDiv.style.left = (document.getElementById("btnOptions").getBoundingClientRect().left + 2) + "px";
		gameOptionsDiv.style.display = "block";
		
	}else{
		gameOptionsBTNstatus = "closed";
		document.getElementById("gameOptions").style.display = "none";
	}
}

function startNewGame(type){
	document.getElementById("gameBoard").style.display = "block";
	openCloseGameOptions();
	if(document.getElementById("gameTable").children.length > 0){
		clearGameBoard();
	}
	gameState = "Playing";
	document.getElementById("txt_time").value = 0;
	currentType = type;
	getCurrentSettings();
	document.getElementById("txt_mineCount").value = currentSettings.m;
	buildGameBoard();
	startTimer();
}

function getCurrentSettings(){
	for (var i = 0; i < gameSettings.length; i++){
		if (gameSettings[i].gtype === currentType) {
			currentSettings = gameSettings[i];
			return;
		}
	}
}

function buildGameBoard(){
	var boardTable = document.getElementById("gameTable");	
	var idx = 1;
	for (var i = 0; i < currentSettings.r; i++){
		var newRow = document.createElement("TR");
		for (var j = 0; j < currentSettings.c; j++){
			var newCell = document.createElement("TD");
			newCell.setAttribute("index", idx);
			newCell.cm = 0;			
			setStateFaceDown(newCell);
			newCell.addEventListener("click", function(e){
				onLeftClick(this);
			});
			newCell.addEventListener("contextmenu", function(e){
				onRightClick(this);
				e.preventDefault();
			});
			
			newRow.append(newCell);
			idx++;
		}
		boardTable.append(newRow);
	}
	createMines();
	updateCells();
}

function createMines(){
	mines = [];	
	for (var i = 0; i < currentSettings.m;){
		var n = Math.floor((Math.random() * (currentSettings.r * currentSettings.c)) + 1);
		if(!mines.includes(n)){
			mines.push(n);
			i++;
		}
	}	
}

function updateCells(){
	var boardTable = document.getElementById("gameTable");
	var r = boardTable.children;
	for (var i = 0; i < r.length; i++){
		var c = r[i].children;
		for (var j = 0; j < c.length; j++){
			if(mines.includes(parseInt(c[j].getAttribute("index")))){
				var NearbyCells = getNearbyCells(parseInt(c[j].getAttribute("index")));
				updateCellMineProximity(NearbyCells);
			}
			
		}
	}
}

function updateCellMineProximity(cellsToUpdate){
	for (var i = 0; i < cellsToUpdate.length; i++){
		cellsToUpdate[i].cm++;
	}
}

function onLeftClick(cell){
	if(gameState == "waiting" || cell.getAttribute("status") === "fl")
		return;

	validateCellToExpand(cell, "leftClick");
	validateWinCondition(true);
}

function onRightClick(cell){
	if(gameState == "waiting")
		return;

	if(cell.getAttribute("status") === "fl"){
		setStateFaceDown(cell);
		document.getElementById("txt_mineCount").value = parseInt(document.getElementById("txt_mineCount").value)+1;
	}
	else if(parseInt(document.getElementById("txt_mineCount").value) != 0){
		setStateFlagged(cell);
		document.getElementById("txt_mineCount").value = parseInt(document.getElementById("txt_mineCount").value)-1;
	}
	if(parseInt(document.getElementById("txt_mineCount").value) === 0){
		validateWinCondition(false);
	}
}

function gameOver(mine){
	stopTimer();
	gameState = "waiting";
	showBombs(mine);
	alert("GAME OVER :(" + getTimePlayedString());
	getPlayerInfo();
}

function expandEmptyCell(cellIndex){
	var boardTable = document.getElementById("gameTable");
	var r = boardTable.children;
	for (var i = 0; i < r.length; i++){
		var c = r[i].children;
		for (var j = 0; j < c.length; j++){
			if(cellIndex === parseInt(c[j].getAttribute("index"))){
				setStateFaceUp(c[j]);
				var NearbyCells = getNearbyCells(parseInt(c[j].getAttribute("index")));
				for(var k=0;k<NearbyCells.length;k++){
					validateCellToExpand(NearbyCells[k]);
				}
				return;
			}
			
		}
	}
}

function validateCellToExpand(cell, mode){
	if(mines.includes(parseInt(cell.getAttribute("index"))) && mode === "leftClick"){
		gameOver(parseInt(cell.getAttribute("index")));
	}else if(cell.cm > 0){
		setStateFaceUp(cell);
	}else if(cell.getAttribute("status") === "fd"){
        expandEmptyCell(parseInt(cell.getAttribute("index")));
	}
}

function getNearbyCells(cellIndex){
	var NearbyCells = [];
	var boardTable = document.getElementById("gameTable");
	var r = boardTable.children;
	for (var i = 0; i < r.length; i++){
		var c = r[i].children;
		for (var j = 0; j < c.length; j++){
			if(cellIndex === parseInt(c[j].getAttribute("index"))){
				if(r[i-1] && r[i-1].children[j-1] && !(r[i-1].children[j-1] === undefined)){
					NearbyCells.push(r[i-1].children[j-1]);
				}
				if(r[i-1] && r[i-1].children[j] && !(r[i-1].children[j] === undefined)){
					NearbyCells.push(r[i-1].children[j]);
				}
				if(r[i-1] && r[i-1].children[j+1] && !(r[i-1].children[j+1] === undefined)){
					NearbyCells.push(r[i-1].children[j+1]);
				}
				if(r[i].children[j-1] && !(r[i].children[j-1] === undefined)){
					NearbyCells.push(r[i].children[j-1]);
				}
				if(r[i].children[j+1] && !(r[i].children[j+1] === undefined)){
					NearbyCells.push(r[i].children[j+1]);
				}
				if(r[i+1] && r[i+1].children[j-1] && !(r[i+1].children[j-1] === undefined)){
					NearbyCells.push(r[i+1].children[j-1]);
				}
				if(r[i+1] && r[i+1].children[j] && !(r[i+1].children[j] === undefined)){
					NearbyCells.push(r[i+1].children[j]);
				}
				if(r[i+1] && r[i+1].children[j+1] && !(r[i+1].children[j+1] === undefined)){
					NearbyCells.push(r[i+1].children[j+1]);
				}
				return NearbyCells;
			}
		}
	}
}

function validateWinCondition(normalWin){
	var c = document.querySelectorAll("td[status='fu']");
	var normalWin = c.length === ((currentSettings.r*currentSettings.c)-currentSettings.m);
	var flagsWin = false;
	if(!normalWin){
		var f = document.querySelectorAll("td[status='fl']");
		if (f.length == mines.length) {
            for (var i = 0; i < f.length; i++) {
                if (mines.includes(parseInt(f[i].getAttribute("index")))) {
                    flagsWin = true;
                } else {
                    flagsWin = false;
                    break;
                }
            }
        }
	}
	if(normalWin || flagsWin){
		stopTimer();
		showBombs(null);
		gameState = "waiting";
		
		setTimeout(function(){ 
			alert("YOU WIN!!!!!! :)" + getTimePlayedString());
			getPlayerInfo();
		}, 500);
		
	}

}

function getPlayerInfo(){
	var pname = prompt("Please enter your name:");
}

function showBombs(mine){
	for (var i = 0; i < mines.length; i++){
		var c = document.querySelector("td[index='"+mines[i]+"']");
		if(mines[i] === mine){
			setStateBomb(c, "red");
		}else if(c.getAttribute("status") === "fl"){
			setStateBomb(c, "green");
		}else{
			setStateBomb(c, "yellow");
		}
	}
}

function clearGameBoard(){
	var boardTable = document.getElementById("gameTable");
	var r = boardTable.childNodes;
	var rCount = r.length
	for (var i = 0; i < rCount; i++){
		boardTable.removeChild(r[0]);
	}
}

function setStateFaceDown(cell){
	cell.setAttribute("status", "fd");
	cell.style.backgroundImage = "url(images/facingDown.png)";
}

function setStateFaceUp(cell){
	cell.setAttribute("status","fu");
	cell.style.backgroundImage = "url(images/"+ cell.cm +".png)";
}

function setStateFlagged(cell){
	cell.setAttribute("status","fl");
	cell.style.backgroundImage = "url(images/flagged.png)";
}

function setStateBomb(cell, bgColor){
	cell.setAttribute("status","fud");
		cell.style.backgroundColor = bgColor;
		cell.style.backgroundImage = "url(images/bomb.png)";
}

function startTimer(){
	startTime = new Date;
	gameTimer = setInterval(function(){
		var currentTime = new Date;
		document.getElementById("txt_time").value = Math.round((currentTime.getTime() - startTime.getTime())/1000);
  	}, 1000);
}

function stopTimer(){
	clearInterval(gameTimer);
}

function getTimePlayedString(){
	var time = parseInt(document.getElementById("txt_time").value);
	var timeString = ""
	if(time<60){
		timeString = time +" seconds";
	}else{
		timeString = (time/60) +" minutes";
	}
	return "\nTime: " + timeString;
}
