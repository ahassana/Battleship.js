class Ship {

    constructor(x, y, size, horizontal) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.horizontal = horizontal;
        this.hp = size;
        this.body = [];
    }


}

module.exports = Ship;