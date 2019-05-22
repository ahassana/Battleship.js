const express = require('express');
//const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const GameBoard = require('./GameBoard');


//Server part
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static('public'));
var roomNum = 0;
//включается при подключении нового пользователя
io.on('connection', function (socket) {
    //комнаты по 2 юзера
    if (io.nsps['/'].adapter.rooms["room-" + roomNum] && io.nsps['/'].adapter.rooms["room-" + roomNum].length > 1) roomNum++;
    socket.join("room-" + roomNum);
    console.log('a user connected to room ' + roomNum);

    //Send this event to everyone in the room.
    var peopleNum = io.nsps['/'].adapter.rooms["room-" + roomNum].length;
    if (peopleNum === 1) {
        io.sockets.in("room-" + roomNum).emit('connectToRoom', roomNum);
    } else {
        // если 2 человека, то создаются дроски. расположение короблей рандомно
        let gbShown1 = new GameBoard();
        gbShown1.generateShips();
        gbShown1.randomPlace();
        const gbHidden1 = new GameBoard();

        let gbShown2 = new GameBoard();
        gbShown2.generateShips();
        gbShown2.randomPlace();
        const gbHidden2 = new GameBoard();
        console.log("created boards");
        io.sockets.in("room-" + roomNum).emit('connectToRoom', roomNum,
            peopleNum, gbShown1, gbHidden1, gbShown2, gbHidden2);


    }

    socket.on('disconnect', function () {
        // включается если кто-то отключился.
        // тут есть баг. можно убрать если созддать лист комнат. пройтись циклом и узнать в какой комноте 1 чел

        io.sockets.in("room-" + roomNum).emit('disconnected');
        console.log('user disconnected from ' + roomNum);
    });

    socket.on('chat message', function(msg){
        if (msg !== "1: " && msg !== "2: "){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
        }
    });

    socket.on('turn', function (ID, Num) {
        //эта херня делает доску одного чувака некликабельной
        console.log("Turn of " + ID + " player in " + Num + " room");
        io.sockets.in("room-" + Num).emit('setUnclickable', ID);
    });
    socket.on('random', function (ID, Num, gbShown1, gbHidden1, gbShown2, gbHidden2) {
        //эта херня делает доску одного чувака рандомной
        console.log("id " + ID + " randomize " + Num + " room");
        if (ID === 1){
            gbShown1 = new GameBoard();
            gbShown1.generateShips();
            gbShown1.randomPlace();
            ID = 2;
        } else {
            gbShown2 = new GameBoard();
            gbShown2.generateShips();
            gbShown2.randomPlace();
            ID = 1;
        }
        io.sockets.in("room-" + Num).emit('update', ID, gbShown1, gbHidden1, gbShown2, gbHidden2);
    });

    socket.on('ready', function (ID, Num, gbShown1, gbHidden1, gbShown2, gbHidden2){
        io.sockets.in("room-" + Num).emit('update', ID, gbShown1, gbHidden1, gbShown2, gbHidden2);
    });

    socket.on('clicked', function (Num, ID, pos, gbShown1, gbHidden1, gbShown2, gbHidden2) {
        //все сократить. и не писать условия обработки
        //аргументы - номер комнаты, ид чувака который кликнул, позиция куда кликнул и доски
        var chords = pos.split(":");
        console.log(chords);
        var mainBoardHidden = gbHidden1;
        var otherBoardShown = gbShown2;

        if (ID === 2) {
            mainBoardHidden = gbHidden2;
            otherBoardShown = gbShown1;
        }

        if (otherBoardShown.board[chords[0]][chords[1]] === "🛥") {
            mainBoardHidden.board[chords[0]][chords[1]] = "💥";
            otherBoardShown.board[chords[0]][chords[1]] = "💥";
            otherBoardShown.ships.forEach(function (ship) {
                ship.body.forEach(function (cell) {

                    if (cell[0] === parseInt(chords[0]) && cell[1] === parseInt(chords[1])) {
                        ship.hp--;
                        otherBoardShown.hp--;

                        if (ship.hp === 0) {
                            // эта дич статична, что бы не создавать новые доски на основе старых.
                            // класс теряется и тут доски это object
                            GameBoard.kill(mainBoardHidden, ship);
                            GameBoard.cover(mainBoardHidden, ship);
                            GameBoard.kill(otherBoardShown, ship);
                            console.log("room:" + Num + "player: " + ID + "killed ship " + ship);
                        }

                    }
                });
            });


            if (ID === 1) ID = 2;
            else ID = 1;

        } else {
            mainBoardHidden.board[chords[0]][chords[1]] = "💦";
            otherBoardShown.board[chords[0]][chords[1]] = "💦";
        }
        if (otherBoardShown.hp === 0) {
            console.log("Game ended");
            io.sockets.in("room-" + Num).emit('end', ID, gbShown1, gbHidden1, gbShown2, gbHidden2);
        } else {

            io.sockets.in("room-" + Num).emit('update', ID, gbShown1, gbHidden1, gbShown2, gbHidden2);
        }
    });


});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
