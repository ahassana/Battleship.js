const Ship = require('./Ship');

class Gameboard {

    constructor() {

        this.board = [["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]];
        this.ships = [];
        this.hp = -1;

    }


    generateShips() {
        this.hp = 0;
        for (let i = 1; i < 5; i++) {
            for (let x = 0; x < 5 - i; x++) {
                let ship = new Ship(0, 0, i, true);
                this.hp += ship.hp;
                this.ships.push(ship);
            }
        }
    }


    randomPlace() {
        for (let i = 0; i < this.ships.length; i++) {
            const hor = Math.floor(Math.random() * 2);
            const hor2 = 1 - hor;
            this.ships[i].horizontal = (hor === 0);
            this.ships[i].x = Gameboard.randInt(0, 10 - (this.ships[i].size - 1) * hor);
            this.ships[i].y = Gameboard.randInt(0, 10 - (this.ships[i].size - 1) * hor2);
            if (this.goodPos(this.ships[i])) {
                this.toSave(this.ships[i]);
            }
            else {
                i--;
            }
        }
        this.clean()
    }

    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    goodPos(ship) {
        let state = "";
        for (let i = 0; i < ship.size; i++) {
            if (ship.horizontal) {
                state = this.board[ship.x][ship.y + i];
            }
            else {
                state = this.board[ship.x + i][ship.y];
            }
            if (state !== "") return false;
        }
        return true;
    }


    toSave(ship) {


        for (let i = 0; i < ship.size; i++) {
            if (ship.horizontal) {
                if (ship.horizontal) this.board[ship.x][ship.y + i] = "🛥";
                ship.body.push([ship.x, ship.y + i]);
            }
            else {
                this.board[ship.x + i][ship.y] = "🛥";
                ship.body.push([ship.x + i, ship.y]);
            }
        }

        this.board = Gameboard.cover(this, ship).board;
    }


    static cover(gb, ship) {
        if (!ship.horizontal) {
            for (let i = 0; i < ship.size + 2; i++) {
                const pos0 = ship.x - 1 + i;
                let pos1 = ship.y - 1;
                if (pos0 <= 9 && pos0 >= 0 && pos1 >= 0) {
                    gb.board[pos0][pos1] = "💦";
                }

                pos1 = ship.y + 1;
                if (pos0 <= 9 && pos0 >= 0 && pos1 < 10)
                    gb.board[pos0][pos1] = "💦";
            }

            if (ship.x - 1 >= 0) gb.board[ship.x - 1][ship.y] = "💦";
            if (ship.x + ship.size < 10)
                gb.board[ship.x + ship.size][ship.y] = "💦";
        }
        else {
            for (let i = 0; i < ship.size + 2; i++) {
                let pos0 = ship.x - 1;
                const pos1 = ship.y - 1 + i;
                if (pos0 >= 0 && pos1 >= 0 && pos1 <= 9) {
                    gb.board[pos0][pos1] = "💦";
                }

                pos0 = ship.x + 1;
                if (pos0 <= 9 && pos1 >= 0 && pos1 < 10)
                    gb.board[pos0][pos1] = "💦";
            }

            if (ship.y - 1 >= 0) gb.board[ship.x][ship.y - 1] = "💦";
            if (ship.y + ship.size < 10)
                gb.board[ship.x][ship.y + +ship.size] = "💦";
        }
        return gb;
    }

    clean() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.board[x][y] === "💦") this.board[x][y] = "";
            }
        }

    }

    static kill(board, ship) {

        ship.body.forEach(function (cell) {
            board.board[cell[0]][cell[1]] = "🔥";
        });
        return board;
    }


}

module.exports = Gameboard;
