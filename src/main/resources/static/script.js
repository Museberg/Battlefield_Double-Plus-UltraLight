var socket = null;
var stompClient = null;
var from = "anon";
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

/*function subscribe(){
    from = $("#from").val();
    stompClient.subscribe('/user/' + from + '/msg', function (greeting) {
        console.log("subscribed " + JSON.parse(greeting.body).content)
        showGreeting(JSON.parse(greeting.body).content);
    });
}*/

function receivePlayers(){
    from = $("#from").val();
    stompClient.subscribe('/user/' + from + '/receivePlayers', function (battlefield) {
        console.log("subscribed " + JSON.parse(battlefield.body).content)
        console.log(JSON.parse(battlefield.body).prevCoordinates)
        updatePlayerPos(JSON.parse(battlefield.body).prevCoordinates, JSON.parse(battlefield.body).newCoordinates)
    });
}

async function receiveBullets(){
    from = $("#from").val();
    stompClient.subscribe('/user/' + from + '/receiveBullets', function (bullet) {
        console.log("subscribed " + JSON.parse(bullet.body).content)
        let newBulletPos = JSON.parse(bullet.body).newCoordinates;
        updateBulletPos(newBulletPos);
        // The client itself checks if a bullet hits them and then kills themselves
        kill(newBulletPos)
        // If a client spawns more than one player, the rest have no ID attached. This removes dead players/clients
        if(willCollide(newBulletPos)){
            removeDeadClient(newBulletPos)
        }
    });
}

async function updateBulletPos(newCoordinates){
    $('#' + pad(newCoordinates, 2)).append('<span class="dot"></span>');
    await new Promise(r => setTimeout(r, 200)); // Det her har jeg selv skrevet
    $('#' + pad(newCoordinates, 2)).find('span').remove()
}

function updatePlayerPos(prevCoordinates, newCoordinates){
    $("#" + pad(prevCoordinates, 2)).removeClass("player-present");
    $("#" + pad(newCoordinates, 2)).addClass("player-present");
    console.log("Prev:" + prevCoordinates + " New: " + newCoordinates);
}

function register(){
    console.log("register() kaldet fra: " + $("#from").val())
    stompClient.send('/app/register',{} ,$("#from").val()) // her bruger vi ikke resultatet
}

function joinBattlefield(){
    console.log($("#from").val() + " is joining the battlefield!")
    stompClient.send('/app/joinBattlefield',{} ,$("#from").val())
}


/*function sendMessage() {
    stompClient.send("/app/hello", {},JSON.stringify({
        toWhom: 'Alle', // kan sættes til en privat person
        fromWho: from,
        message: $("#text").val()
    }));
}

function showGreeting(message) {
    $("#greetings").append("<p>" + message + "</p>");
}*/

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#register" ).click(function() { register(); });
    $( "#register" ).click(function() { joinBattlefield(); });
    //$( "#subscribe" ).click(function() { subscribe(); });
    $( "#subscribe" ).click(function() { receivePlayers(); });
    $( "#subscribe" ).click(function() { receiveBullets(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    //$( "#sendMessage" ).click(function() { sendMessage(); });
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
        setPlayerId(parseInt(spawnPoint));
        stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
            prevCoordinates: spawnPoint,
            newCoordinates: spawnPoint,
            playerName: from
        }));
    }
}

async function shoot(direction){
    if(playerId == -1){
        return;
    }
    let bulletCoor = playerId;
    switch (direction){
        case "left":
            while(bulletCoor % 10 != 0){
                bulletCoor--;
                stompClient.send("/app/updateBullets", {}, JSON.stringify({
                    prevCoordinates: bulletCoor + 1,
                    newCoordinates: bulletCoor
                }));
                if(willCollide(pad(bulletCoor, 2))){
                    //kill(bulletCoor);
                    return;
                }
                await new Promise(r => setTimeout(r, 200)); // Det her har jeg selv skrevet
            }
        break;
        case "right":
            while(bulletCoor % 10 != 9){
                bulletCoor++;
                stompClient.send("/app/updateBullets", {}, JSON.stringify({
                    prevCoordinates: bulletCoor - 1,
                    newCoordinates: bulletCoor
                }));
                if(willCollide(pad(bulletCoor, 2))){
                    //kill(bulletCoor);
                    return;
                }
                await new Promise(r => setTimeout(r, 200)); // Det her har jeg selv skrevet
            }
        break;
        case "up":
            while(bulletCoor > 9){
                bulletCoor = bulletCoor - 10;
                stompClient.send("/app/updateBullets", {}, JSON.stringify({
                    prevCoordinates: bulletCoor + 10,
                    newCoordinates: bulletCoor
                }));
                if(willCollide(pad(bulletCoor, 2))){
                    //kill(bulletCoor);
                    return;
                }
                await new Promise(r => setTimeout(r, 200)); // Det her har jeg selv skrevet
            }
        break;
        case "down":
            while(bulletCoor < 90){
                bulletCoor = bulletCoor + 10;
                stompClient.send("/app/updateBullets", {}, JSON.stringify({
                    prevCoordinates: bulletCoor - 10,
                    newCoordinates: bulletCoor
                }));
                if(willCollide(pad(bulletCoor, 2))){
                    //removeDeadClient(bulletCoor);
                    return;
                }
                await new Promise(r => setTimeout(r, 200)); // Det her har jeg selv skrevet
            }
            break;
    }
}

function removeDeadClient(bulletPos){
    $('#' + pad(bulletPos, 2)).removeClass('player-present');
}

function kill(bulletPos){
    console.log("Die called with bullet at " + bulletPos + " and player at: " + playerId)
    if(bulletPos === playerId){
        $('#' + pad(bulletPos, 2)).removeClass('player-present');
        prevCoor = playerId;
        playerId = -1
        stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
            prevCoordinates: prevCoor,
            newCoordinates: pad(playerId, 2),
            playerName: from
        }));
    }
}

function movePlayer(direction){
    if(playerId == -1){
        return;
    }
    prevCoor = -1;
    switch (direction){
        case "left":
            if(playerId != 0 && playerId % 10 !== 0 && !willCollide(playerId - 1)){
                prevCoor = pad(playerId, 2);
                playerId = playerId - 1;
                stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
                    prevCoordinates: prevCoor,
                    newCoordinates: pad(playerId, 2),
                    playerName: from
                }));
            }
        break;
        case "right":
            if(playerId != 99 && playerId % 10 !== 9 && !willCollide(playerId + 1)){
                prevCoor = pad(playerId, 2);
                playerId = playerId + 1;
                stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
                    prevCoordinates: prevCoor,
                    newCoordinates: pad(playerId, 2),
                    playerName: from
                }));
            }
        break;
        case "up":
            if(playerId > 9 && !willCollide(playerId - 10)){
                prevCoor = pad(playerId, 2);
                playerId = playerId - 10;
                stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
                    prevCoordinates: prevCoor,
                    newCoordinates: pad(playerId, 2),
                    playerName: from
                }));
            }
        break;
        case "down":
            if(playerId < 90 && !willCollide(playerId + 10)){
                prevCoor = pad(playerId, 2);
                playerId = playerId + 10;
                stompClient.send("/app/updateBattlefield", {}, JSON.stringify({
                    prevCoordinates: prevCoor,
                    newCoordinates: pad(playerId, 2),
                    playerName: from
                }));
            }
        break;
    }
}

function willCollide(newCoor){
    console.log("Collision at " + newCoor + "!")
    return $('#' + newCoor).hasClass('player-present');
}

function pad (str, max) { // Den har jeg selv skrevet
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}