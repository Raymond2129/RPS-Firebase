  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAuGsdzLqesOMWyhefOlZFIsab3pDDt6u0",
    authDomain: "rps-firebase-homework.firebaseapp.com",
    databaseURL: "https://rps-firebase-homework.firebaseio.com",
    projectId: "rps-firebase-homework",
    storageBucket: "",
    messagingSenderId: "536382476737"
  };
  firebase.initializeApp(config);
 //database reference
 var database = firebase.database();
 var PlayerName = '';
 var user1Name = "";
 var user2Name = "";
 var user1Choice = "";
 var user2Choice = "";
 var newMessage = "";
 var p1Win = 0;
 var p1Lose = 0;
 var p2Win = 0;
 var p2Lose = 0;
 var turns = 1;
 var delayTimer;
 var delayTimer2;
 var IsGameResetting = false;


$(document).ready(function(){

   //this object handles the score check
   var CheckWinners={
           //restart the game to turn 1
           resetGame : function(){
               IsGameResetting = false;
               turns = 1;
                   //update the turn in the firebase to 1
                   database.ref().update({
                               turn: turns
                   });
           },
           //clear the 5 seconds timeout and call the reset
           clearDelay : function(){
               clearTimeout(delayTimer);
               CheckWinners.resetGame();
           },
           //update winner message to winner 1 
           updateWinner1 : function (){
               $("#winner").html( user1Name + " wins!!");
           },
           //update winner message to winner 1 
           updateWinner2 : function (){
               $("#winner").html( user2Name + " wins!!");
           },
           //update the database to match the player score after the increases
           updateScore: function(){
               database.ref("players/1").update({		
                       win: p1Win,
                       lose: p1Lose,	
               });//database update
               database.ref("players/2").update({
                       win: p2Win,
                       lose: p2Lose,
               });//database update
           },
           //update the local vairable of player scores then call the winner message update and call the score update in the database
           playerSocre : function (){
               // If user picked rock and computer picked scissors then user wins.
               if(user1Choice == "rock" && user2Choice == "scissors") {	
                   p1Win++;
                   p2Lose++;
                   CheckWinners.updateWinner1();
                   CheckWinners.updateScore();
               }
               // if user picked rock and computer picked paper then user loses
               if(user1Choice == "rock" && user2Choice == "paper") {
                   p1Lose++;
                   p2Win++;
                   CheckWinners.updateWinner2();
                   CheckWinners.updateScore();					
               }
               // if user picked scissor and computer picked rock then user loses
               if(user1Choice == "scissors" && user2Choice == "rock") {					
                   p1Lose++;
                   p2Win++;
                   CheckWinners.updateWinner2();
                   CheckWinners.updateScore();		
               }
               // if user picked scissor and computer picked paper then user wins
               if(user1Choice == "scissors" && user2Choice == "paper") {					
                   p1Win++;
                   p2Lose++;
                   CheckWinners.updateWinner1();
                   CheckWinners.updateScore();
               }
               // if user picked paper and computer picked rock then user wins
               if(user1Choice == "paper" && user2Choice == "rock") {					
                   p1Win++;
                   p2Lose++;
                   CheckWinners.updateWinner1();
                   CheckWinners.updateScore();				
               }
               // if user picked paper and computer picked scissor then user loses				
               if(user1Choice == "paper" && user2Choice == "scissors") {
                   p1Lose++;
                   p2Win++;
                   CheckWinners.updateWinner2();
                   CheckWinners.updateScore();
               }
               // if user and computer picks the same
               if(user1Choice == user2Choice) {
                   $("#winner").html("It's a tie!");
               }

           }//playerScore
   }//checkWinners

   
   /*DOM IDs Munipulation
       #greetings - receive input of player's name or show greeting message to player after enter
       #whose-turn - inform each player of each other turn
       #player1-name, #player2-name - displayer each player name at the top of their own div
       #waiting1, #waiting2 - in case there is no player, it will show "waiting for player 1 or 2"
       #player1choices, #player2choices - will show choices to each player in their on div
       #group1message, #group2message- display the choice that each user chose right after the click
       #win1, #lose1, #win2, #lose2 - chow each player score at the bottom of htier own div
       #player-1, #player-2 - munipulate teh color of the border at different players' turn*/


   //DOM at the innitail Loads
   $("#greetings").html("<h2>Enter Your Name to Play</h2>"
                       +"</br><input type='text' id='name-input'>" +
                       "</br></br><input type='submit' id='submit-name'>");
   $("#waiting1").html("Waiting for player 1");
   $("#waiting2").html("Waiting for player 2");
   
   //Hide these when both players dont exists
   function hidden() {
           $("#player1choices").attr("style", "visibility:hidden");
           $("#player2choices").attr("style", "visibility:hidden");
           $("#group2message").attr("style", "visibility:hidden");
           $("#group1message").attr("style", "visibility:hidden");
   }
   hidden();

   //this will run after every database change
   database.ref().on("value", function(snapshot){

       function playerDisconnect(){
           if(PlayerName != ""){
               //if this is Player 1's browser
               if ((snapshot.child("players").child(1).exists()) && (PlayerName == snapshot.child("players").child(1).val().name)){					
                       //update the message to the database
                       database.ref("/chat").onDisconnect().update({							
                           message: ((snapshot.child("players").child(1).val().name) + " has been DISCONNECTED!!"),
                           dateAdded: firebase.database.ServerValue.TIMESTAMP												
                       });
                       //delete the player 1 database
                       database.ref("players/1").onDisconnect().remove();
               //if this is Player 2's browser
               }else if ((snapshot.child("players").child(2).exists()) && (PlayerName == snapshot.child("players").child(2).val().name)){	
                       //update the message to the database	
                       database.ref("/chat").onDisconnect().update({						
                           message: ((snapshot.child("players").child(2).val().name) + " has been DISCONNECTED!!"),
                           dateAdded: firebase.database.ServerValue.TIMESTAMP													
                       });//database	
                       //delete the player 1 database
                       database.ref("players/2").onDisconnect().remove();
                       //delete the turn database				
                       database.ref("/turn").onDisconnect().remove();	
               }// else if
           }//if
       }//playerDisConnect
       
       //if player 1 dont exists, empty all that related to player 1 and unhilighted both user div
       if(((snapshot.child("players").child(1).exists()) == false)){
               $("#waiting1").html("Waiting for player 1");
               $("#winner").empty();
               $("#win1").empty();
               $("#lose1").empty();
               $("#player1-name").empty();
               $("#whose-turn").empty();
               $("#player-1").attr("style", "border: 5px solid black");
               $("#player-2").attr("style", "border: 5px solid black");

       };
       //if player 2 dont exists, empty all that related to player 2 and unhilighted both user div
       if(((snapshot.child("players").child(2).exists()) == false)){
               $("#waiting2").html("Waiting for player 2");
               $("#winner").empty();
               $("#win2").empty();
               $("#lose2").empty();
               $("#player2-name").empty();
               $("#whose-turn").empty();
               $("#player-1").attr("style", "border: 5px solid black");
               $("#player-2").attr("style", "border: 5px solid black");
       };
       //if player 2 exists but not 1,, show player 2 name in his div and unhilighted both user div
       if((snapshot.child("players").child(2).exists()) && ((snapshot.child("players").child(1).exists()) === false)){
               $("#player2-name").html(snapshot.child("players").child(2).val().name);
               $("#waiting2").empty();
               $("#player-1").attr("style", "border: 5px solid black");
               $("#player-2").attr("style", "border: 5px solid black");
               hidden();
               //when any player disconnect from the game
               playerDisconnect();
       };
       //if player 1 exists but not 2,,show player 1 name in his div and unhilighted both user div
       if((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()) === false)){
               $("#waiting1").empty(); 
               $("#player1-name").html(snapshot.child("players").child(1).val().name);
               hidden();
               //when any player disconnect from the game
               playerDisconnect();
                   //at the player1's  browser
                   if(PlayerName == snapshot.child("players").child(1).val().name){
                           $("#greetings").html("<h2>Hello " + snapshot.child("players").child(1).val().name +  ".  You are player 1!</h2>");					
                           $("#win1").html("WIN: " + p1Win);
                           $("#lose1").html("LOSE: " + p1Lose);
                   }
       //If both players exists == we are READY to play!
       }else if((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()))){
               //Keeping track of turn for the database
               var databaseTurn = snapshot.child("turn").val();
               user1Name = snapshot.child("players").child(1).val().name;
                 user2Name = snapshot.child("players").child(2).val().name;
                   //Both browers will show...
                   $("#waiting2").empty();
                   $("#waiting1").empty();
                   $("#player2-name").html(snapshot.child("players").child(2).val().name);
                   $("#player1-name").html(snapshot.child("players").child(1).val().name);
                   $("#win2").html("WIN: " + snapshot.child("players").child(2).val().win);
                   $("#lose2").html("LOSE: " + snapshot.child("players").child(2).val().lose);
                   $("#win1").html("WIN: " + snapshot.child("players").child(1).val().win);
                   $("#lose1").html("LOSE: " + snapshot.child("players").child(1).val().lose);
                   //when any player disconnect from the game
                   playerDisconnect();
                   
               //player 1's browser at player 1's turn
               if((PlayerName == snapshot.child("players").child(1).val().name) && (databaseTurn == 1)){
                       $("#greetings").html("<h2>Hello " + snapshot.child("players").child(1).val().name +  ".  You are player 1!</h2>");
                       $("#player-1").attr("style", "border: 5px solid yellow");
                       $("#player-2").attr("style", "border: 5px solid black");
                       hidden();
                       $("#player1choices").attr("style", "visibility:visible");
                           $("#rock1").html("ROCK");
                           $("#paper1").html("PAPER");
                           $("#scissors1").html("SCISSORS");
                       $("#winner").empty();
                       $("#whose-turn").html("It's your turn!");
               }
               //player 1's browser at player 2's turn
               if((PlayerName == snapshot.child("players").child(1).val().name) && (databaseTurn == 2)){//after player 1 picks
                       $("#player-1").attr("style", "border: 5px solid black");
                       $("#player-2").attr("style", "border: 5px solid yellow");
                       hidden();
                       $("#group1message").attr("style", "visibility:visible");
                           $("#group1message").html("Chose: " + "<h2>" + user1Choice + "</h2>");
                       $("#whose-turn").html("Waiting for " + user2Name + " to choose...");
               }
               
               //player2's browser  at player 1's turn
               if((PlayerName == snapshot.child("players").child(2).val().name) && (databaseTurn == 1 )){
                       $("#greetings").html("<h2>Hello " + snapshot.child("players").child(2).val().name +  ".  You are player 2!</h2>");
                       $("#player-1").attr("style", "border: 5px solid yellow");
                       $("#player-2").attr("style", "border: 5px solid black");
                       $("#whose-turn").html("Wating for " + user1Name + " to choose!!");
                       hidden();	
                       $("#winner").empty();
               }
               //player2's browser  at player 2's turn
               if((PlayerName == snapshot.child("players").child(2).val().name) && (databaseTurn == 2 )){
                       $("#player-1").attr("style", "border: 5px solid black");
                       $("#player-2").attr("style", "border: 2px solid yellow");
                       $("#whose-turn").html("It is your turn!"); 
                       hidden();							
                       $("#player2choices").attr("style", "visibility:visible");
                           $("#rock2").html("ROCK");
                           $("#paper2").html("PAPER");
                           $("#scissors2").html("SCISSORS");				
               }
               //both player's browser at turn 3 (after player 2 made a choice) and the increase score function hasn't been called
               if(databaseTurn == 3 && IsGameResetting == false){
                       IsGameResetting = true;
                       //Restating variables to match the database
                       user1Choice = snapshot.child("players").child(1).val().choice;
                       user2Choice = snapshot.child("players").child(2).val().choice;
                       p1Win = snapshot.child("players").child(1).val().win;
                       p1Lose = snapshot.child("players").child(1).val().lose;
                       p2Win = snapshot.child("players").child(2).val().win;
                       p2Lose = snapshot.child("players").child(2).val().lose;
                           
                           $("#player-1").attr("style", "border: 5px solid black");
                           $("#player-2").attr("style", "border: 5px solid black");
                           $("#player2choices").attr("style", "visibility:hidden");
                           $("#player1choices").attr("style", "visibility:hidden");
                           $("#group2message").attr("style", "visibility:visible");
                           $("#group1message").attr("style", "visibility:visible");		
                                $("#group1message").html("Chose: " + "<h2>" + user1Choice + "</h2>");
                                $("#group2message").html("Chose: " + "<h2>" + user2Choice + "</h2>");
                           $("#whose-turn").empty();	
                       //call the function to check for winnner
                       CheckWinners.playerSocre();
                       // Display this page for 5 seconds and call clearDelay function to reset the game
                       delayTimer = setTimeout(CheckWinners.clearDelay, 5 * 1000);				
               }	
       }// else if
   }); //database
   //as each user enters the game
   $("#submit-name").on("click", function(){
       //graping the value of the user's name 
       var username = $("#name-input").val().trim();
       //set the screen name to user's name
       PlayerName = username;
       console.log(username);

           // Read snapshot when user adds name as player,, this is where we set
           database.ref().once('value').then(function(snapshot) {
                    //if player1 doesn't exists
                    if((snapshot.child("players").child(1).exists()) === false){
                           database.ref("players/1").set({
                                   name : username,
                                   win: p1Win,
                                   lose: p1Lose
                           }); //database set
                   //if player 1 exist but not 2
                   }else if((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()) === false)){
                           database.ref("players/2").set({
                               name : username,
                               win: p2Win,
                               lose: p2Lose
                       }); //database set
                           database.ref().update({
                               turn: turns,
                       });
                   //if both player exists
                   }else if ((snapshot.child("players").child(1).exists()) && (snapshot.child("players").child(2).exists())){
                   alert("There are two players playing! Try again later!");
                   }//else if
           }); //database
   }); //on click

   //if user 1 made a choice 
   $(".choice1").on("click", function(){
           //grap the value of what choice the user made
           user1Choice = $(this).val();
           console.log(user1Choice);

               database.ref().once('value').then(function(snapshot) {
                    //match the value of the turn to the database and //increment the turn == it will now be user 2's turn	
                    turns = (snapshot.child("turn").exists() ? snapshot.child("turn").val() : turns);
                   turns++; //2

                   //at player 1's brower , well will update the user choice in the database of the choice the user 1 just picked
                    if((PlayerName == snapshot.child("players").child(1).val().name)){
                       database.ref("players/1").update({		
                           choice : user1Choice,						
                       });//database set
                       //then update turn to 2
                       database.ref().update({		
                           turn: turns		
                       });
                   }//if
               });//database
   }); //on click

   //if user 2 made a choice
   $(".choice2").on("click", function(){
           //grap the value of what choice the user made
           user2Choice = $(this).val();
           console.log(user2Choice);

               database.ref().once('value').then(function(snapshot) {
                    //match the value of the turn to the database and //increment the turn == it will now be turn 3		
                    turns = (snapshot.child("turn").exists() ? snapshot.child("turn").val() : turns);
                   turns++; //3
                   
                   //at player 2's brower , well will update the user choice in the database of the choice the user 2 just picked
                    if((PlayerName == snapshot.child("players").child(2).val().name)){
                       database.ref("players/2").update({									
                           choice : user2Choice,														
                       });//database set
                       //then update turn to 3
                       database.ref().update({
                           turn: turns,									
                       });
                   }//if
               });//database
   }); //on click
    
    //if the any user send a message
    $("#submit-chat").on("click", function(event){
        //prevent refresh
        event.preventDefault();
        console.log(this);
           //grab the value of what the user type  and then empty it;
           var messages = $("#chat-input").val().trim();
           $("#chat-input").val("");
           
           //restate the newMessage to give it's a value
           newMessage = PlayerName + " : " + messages;
                   
                   //update each chat messages into teh database along with the time it was added
                   database.ref("/chat").update({		
                       message: newMessage,
                       dateAdded: firebase.database.ServerValue.TIMESTAMP								
                   });//database push
   }); //on click

   //updating the chat messages in the browser's chat window by using the last one added into the database (time added)
   database.ref("/chat").orderByChild("dateAdded").limitToLast(1).on("value", function(snapshot) {
                $("#chat-window").append("</br>" + snapshot.val().message + "</br>");
   });//database

}); // .ready