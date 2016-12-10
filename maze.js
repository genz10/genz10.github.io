//START Variable//
var idInterval = null;
var tileNow = [-1,-1];
var counter = 0;
var state = [];
var dx = [1,0,-1,0];
var dy = [0,-1,0,1];
var interval = 10;
var numberAttempt = 0;
var dir = ['up','down','left','right'];
var learnRate = 0.5 

//END Variable//


//Value of Gamma or Discount Rate
var gamma = 1
//Epsilon for greedy probability
var epsilon = 0.05;
//Obstacle Array
var obstacle = [];
//DEFINE Pit Coordinate
var pit = [0,5];
//Define Tile Start
var tileStart 	= [0,0];
//Define Tile Goal
var tileEnd 	= [4,6];

//MAP SIZE
var MAP_X = 7;
var MAP_Y = 7;

//set debugMode to True for displaying Q Value[might reduce performance]
var debugMode = false;


function defineState(){
	//Define initial state
	for(var x=0;x<MAP_X;x++){
 		for(var y=0;y<MAP_Y;y++){
			var innerState = {"x":x,"y":y};
			for(var k=0;k<4;k++){
				innerState[dir[k]] = 0;
			}
			state.push(innerState);
		}
	}
}
function initiate(){
	tileNow[0] = tileStart[0];
	tileNow[1] = tileStart[1];
	move(tileStart,true);
	move(tileEnd,true);
	$("[x="+pit[0]+"][y="+pit[1]+"]").css({"backgroundColor":"red"});
}

function move(mov,isFoward){
	//Coloring tiles isFoward (move to the next tile)
	$("[x="+mov[0]+"][y="+mov[1]+"]").css({"backgroundColor":(isFoward)?"green":"white"});
}

function isInArray(move){
	//Check if "MOVE" is in obstacle array
	var ok = false;
	for(var i = 0;i<obstacle.length;i++){
		if( (obstacle[i][0] == move[0]) && (obstacle[i][1] == move[1]) ){
			ok = true;
			break;
		}
	}
	return ok;
}


function getQ(tileNow){
	//Get current state
	for(var i =0;i<state.length;i++){
		if( (state[i].x == tileNow[0]) && (state[i].y == tileNow[1]) ){
			return state[i];
		}
	}
}

function randomMove(e){
	var highestQValue = -123123;
	var moveX,moveY;
	var nowQ = getQ(tileNow);
	counter++;
	var goalState = getQ(tileEnd);
	var pitState = getQ(pit);
	counter++;
	for(var i =0;i<4;i++){
		var Qnow = nowQ[dir[i]];
		if(highestQValue < Qnow){
			highestQValue = Qnow;
			dr = dir[i];
		}
	}
	if(e){
		dr = e;		
	}
	if(dr == 'up'){
		moveX = tileNow[0] + 0;
		moveY = tileNow[1] - 1;
	}
	else if(dr == 'down'){
		moveX = tileNow[0] + 0;
		moveY = tileNow[1] + 1;
	}
	else if(dr == 'left'){
		moveX = tileNow[0] - 1;
		moveY = tileNow[1];
	}
	else
	{
		moveX = tileNow[0] + 1;
		moveY = tileNow[1];
	}
	var nextQ = -123123;
	if(moveX >= 0 && moveX < MAP_X && moveY >= 0 && moveY < MAP_Y){
		if(!isInArray([moveX,moveY])){
			var nextState = getQ([moveX,moveY]);
			for(var i =0;i<4;i++){
				var Q = nextState[dir[i]];
				nextQ = Math.max(nextQ,Q);
			}
			var reward = -0.04;
			nowQ[dr] = nowQ[dr] + ( 0.5 * ( reward + gamma * nextQ - nowQ[dr]) );
			move(tileNow,false);
			tileNow[0] = moveX;
			tileNow[1] = moveY;
			move(tileNow,true);
			if(moveX == tileEnd[0] && moveY == tileEnd[1]){
				for(var i=0;i<4;i++){
					goalState[dir[i]] = goalState[dir[i]] + ( learnRate * ( 1 - goalState[dir[i]]) );
				}
				move(tileNow,false);
				start();
			}
			else if(moveX == pit[0] && moveY == pit[1]){
				for(var i=0;i<4;i++){
					pitState[dir[i]] = pitState[dir[i]] + ( learnRate * ( -1 - pitState[dir[i]]) );
				}
				move(tileNow,false);
				start();
			}
		}
		else
		{
			var reward = -0.04;
			nowQ[dr] = nowQ[dr] + reward;
		}
	}
	else
	{
		var reward = -0.04;
		nowQ[dr] = nowQ[dr] + reward;
	}
	if(debugMode) debugQ();
}


function debugQ(){
	$('#q').html('');
	for(var y=0;y<MAP_Y;y++){
		for(var x=0;x<MAP_X;x++){
			$("[x="+x+"][y="+y+"]").html('');
			var state = getQ([x,y]);
			var dir = ['up','down','left','right'];
			for(var k=0;k<4;k++){
				$("[x="+x+"][y="+y+"]").append(dir[k] + ':' + Math.round(state[dir[k]] * 100) / 100 + '<br/>'); 
			}
		}
	}
}

var ok = false;

function stop(){
	clearInterval(idInterval);
}
function start(){
	initiate();
	idInterval = setInterval(randomMove,interval);
}
function createTable(){
	for(var i=0;i<MAP_Y;i++){
		var html = '<tr>';
		for(var j=0;j<MAP_X;j++){
			html += '<td x="'+j+'" y="'+i+'"></td>';
		}
		html += '</tr>';
		$('#table').append(html);
	}
}
$(document).ready(function(){
	createTable();
	defineState();
	initiate();
	$('td').click(function(){
		var x = $(this).attr("x");
		var y = $(this).attr("y");
		obstacle.push([x,y]);
		$(this).css({"backgroundColor":"black"});
	});

	$("body").keydown(function(e) {
	  if(e.keyCode == 37) { // left
		   randomMove("left");
	  }
	  else if(e.keyCode == 39) { // right
	  		randomMove("right");
	  }
	  else if(e.keyCode == 38){ // UP
	  		randomMove("up");
	  }
	  else if(e.keyCode == 40){//DOWN
	  	randomMove("down");
	  }
	});

});