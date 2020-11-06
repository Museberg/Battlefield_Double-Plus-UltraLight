var socket = null;
var stompClient = null;
var from = "anonymous user";
var playerId = -1;
function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    $("#register").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#greetings").html("");  // clears the greetings
}

function connect() {
    socket = new SockJS('/my-endpoint'); // was gs-guide-websocket
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        from = $("#from").val();
        console.log('Connected: ' + frame);
    });
}

function subscribe(){
    from = $("#from").val();
    stompClient.subscribe('/user/' + from + '/msg', function (greeting) {
        console.log("subscribed " + JSON.parse(greeting.body).content)
        showGreeting(JSON.parse(greeting.body).content);
    });
}

function register(){
    console.log("register() kaldet fra: " + $("#from").val())
    stompClient.send('/app/register',{} ,$("#from").val()) // her bruger vi ikke resultatet
}


function sendMessage() {
    stompClient.send("/app/hello", {},JSON.stringify({
        toWhom: 'Alle', // kan sættes til en privat person
        fromWho: from,
        message: $("#text").val()
    }));
}

function showGreeting(message) {
    $("#greetings").append("<p>" + message + "</p>");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#register" ).click(function() { register(); });
    $( "#subscribe" ).click(function() { subscribe(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#sendMessage" ).click(function() { sendMessage(); });
});


function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function setPlayerId(id){
    playerId = id;
}

function spawnPlayer() {
    let tries = 0;
    let spawnPoint = pad(Math.floor((Math.random() * 100)), 2); // Id from 0..9 has a 0 in front of them (e.g. 02)
    while($("#" + spawnPoint + "> p").text() !== '' && tries < 100){
        spawnPoint = pad(Math.floor((Math.random() * 100)), 2);
        console.log("Player is present at " + spawnPoint + ". Finding new spawn point...");
        tries++;
    }
    if(tries < 100){
        console.log("Spawning player at " + spawnPoint)
        $("#" + spawnPoint + "> p").text("Player 1");
        $("#" + spawnPoint).addClass("player-present");
        setPlayerId(spawnPoint);
    }
}

function movePlayer(direction){
    if(playerId => 0){
        if(direction === "left"){
            if(playerId != 0 && playerId % 10 !== 0){
                $("#" + pad(playerId, 2)).removeClass("player-present");
                playerId = playerId - 1;
                $("#" + pad(playerId, 2)).addClass("player-present");
            }
        }
        if(direction == "right"){
            if(playerId != 99 && playerId % 10 !== 9){
                $("#" + pad(playerId, 2)).removeClass("player-present");
                playerId = playerId + 1;
                $("#" + pad(playerId, 2)).addClass("player-present");
            }

        }
        if(direction == "up"){
            if(playerId > 9){
                $("#" + pad(playerId, 2)).removeClass("player-present");
                playerId = playerId - 10;
                $("#" + pad(playerId, 2)).addClass("player-present");
            }
        }
        if(direction == "down"){
            if(playerId < 90){
                $("#" + pad(playerId, 2)).removeClass("player-present");
                playerId = playerId + 10;
                $("#" + pad(playerId, 2)).addClass("player-present");
            }
        }
    }

}

function pad (str, max) { // Den har jeg selv skrevet
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}