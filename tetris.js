var Tetris = {
    initialize: function (runner) {
        this.runner = runner;
        this.nextTetromino;
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.maxLevel = 18;
        this.levels = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2]
        this.maxRows = 20;
        this.maxColumns = 10;
        this.maxNextColumns = 5;
        this.maxNextRows = 5;
        this.blockWidth = 50;
        this.blockHeight = 50;
        this.invalidate;
        this.tetrominoes = {
            I: { blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: 'cyan' },
            J: { blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue' },
            L: { blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' },
            O: { blocks: [0x0660, 0x0660, 0x0660, 0x0660], color: 'yellow' },
            S: { blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: 'green' },
            Z: { blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: 'red' },
            T: { blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' },
        };
        this.court = Object.construct(this.Count, this);
        this.tetromino = Object.construct(this.Tetromino, this);
        this.nextTetromino = Object.construct(this.NextTetromino, this);
        this.reset();
        this.runner.start();

    },
    update: function (time) {
        this.tetromino.update(time);
    },
    draw: function (ctx) {
        this.tetromino.draw(ctx);
    },
    onkeydown: function (event) {
        this.tetromino.onkeydown(event);
    },
    reset: function () {
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.court.blocks = [];
        this.getNextTetromino();
    },
    forEachBlock: function (tetromino, x, y, fn) {

        var row = 0;
        var column = 0
        var blocks = tetromino.blocks[tetromino.direction];
        for (var bit = 0x8000; bit > 0; bit = bit >> 1) {
            if (blocks & bit) {
                fn.call(this, x + column, y + row);
            }
            if (++column === 4) {
                column = 0;
                ++row;
            }

        }
    },
    getNextTetromino: function () {
        this.tetromino.tetromino = this.nextTetromino.nextTetromino || this.getRandomTetromino();
        nextTetromino = this.getRandomTetromino();
    },
    getRandomTetromino: function () {

        var random = Math.floor(Math.random() * 7);
        var allTetrominoes = [this.tetrominoes.I, this.tetrominoes.J, this.tetrominoes.L, this.tetrominoes.O, this.tetrominoes.S, this.tetrominoes.Z, this.tetrominoes.T];
        var tetromino = allTetrominoes[random];

        var result = {
            blocks: tetromino.blocks,
            color: tetromino.color,
            x: 4,
            y: -3,
            direction: 0,
        };

        return result;

    },
    drawBlock: function (ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.blockWidth, y * this.blockWidth, this.blockWidth, this.blockHeight);
        ctx.fill();
    },
    Tetromino: {
        initialize: function (tetris) {
            this.tetris = tetris;
            this.tetromino;
            this.inputs = new Array();
            this.dropTime = 0;
            this.invalidate = true;
        },
        update: function (time) {

            this.moveTetromino();

            this.dropTime += time;

            if (this.dropTime > this.tetris.levels[level] / 60) {
                this.dropTime = 0;
                this.drop()
            }

        },
        moveTetromino: function () {

            if (this.inputs.length == 0) {
                return;
            }

            var input = this.inputs.pop();

            switch (input) {
                case KEY.LEFT:
                    this.move(KEY.LEFT);
                    break;
                case KEY.RIGHT:
                    this.move(KEY.RIGHT);
                    break;
                case KEY.DOWN:
                    this.drop();
                    break;
                case KEY.SPACE:
                    this.rotate();
                default:
            }

            inputs.length = 0;
        },
        move: function (input) {

            var x = this.tetromino.x;
            var y = this.tetromino.y;

            switch (input) {
                case Game.KEY.LEFT:
                    x--;
                    break;
                case Game.KEY.RIGHT:
                    x++;
                    break;
                case Game.KEY.DOWN:
                    y++;
                    break;
                default:
            }

            if (!this.collision(this.tetromino, x, y)) {
                this.tetromino.x = x;
                this.tetromino.y = y;
                this.invalidate = true;
                return true;
            } else {
                return false;
            }

        },
        drop: function () {

            var isMoved = this.move(Game.KEY.DOWN);

            if (!isMoved) {

                this.tetris.forEachBlock.call(this, this.tetromino, this.tetromino.x, this.tetromino.y, function (x, y) {
                    this.tetris.court.setBlocks.call(this.tetris.court, x, y, this.tetromino);
                })

                this.tetris.getNextTetromino();

                this.clearLines();

                if (this.gameOver()) {
                    this.tetris.reset();
                }

                invalidate();

            }

        },
        rotate: function () {

            var previousDirection = this.tetromino.direction;

            if (this.tetromino.direction == 3) {
                this.tetromino.direction = 0;
            } else {
                this.tetromino.direction++;
            }

            if (this.collision(this.tetromino, this.tetromino.x, this.tetromino.y)) {
                this.tetromino.direction = previousDirection;
            }

            this.invalidate = true;

        },
        collision: function (tetromino, x, y) {

            var result = false;

            this.tetris.forEachBlock(this.tetromino, x, y, function (x, y) {

                if (x < 0 || x >= this.maxColumns || y >= this.maxRows || this.court.getBlocks(x, y)) {
                    result = true;
                }

            })

            return result;
        },
        clearLines: function () {

            var numberOfLinesCleared = 0;

            for (var y = 0; y < this.tetris.maxRows; y++) {

                var clearLine = true;

                for (var x = 0; x < this.tetris.maxColumns; x++) {

                    if (!this.tetris.court.getBlocks(x, y)) {
                        clearLine = false;
                        break;
                    }

                }

                if (clearLine) {
                    numberOfLinesCleared++;
                    lines++;

                    for (var y2 = y; y2 > 0; y2--) {
                        for (var x2 = 0; x2 < this.tetris.maxColumns; x2++) {
                            this.tetris.court.blocks[x2][y2] = this.tetris.court.blocks[x2][y2 - 1];
                        }
                    }

                    this.invalidate = true;

                }

            }

            this.tetris.score += numberOfLinesCleared > 0 ? 100 * Math.pow(2, numberOfLinesCleared - 1) : 0;

            if (this.tetris.lines / 10 >= this.tetris.level + 1) {
                this.tetris.level++;
            }

        },
        draw: function (ctx) {

            if (!this.invalidate) {
                return;
            }

            this.tetris.forEachBlock.call(this, this.tetromino, this.tetromino.x, this.tetromino.y, function (x, y) {
                this.tetris.drawBlock.call(this, ctx, x, y, this.tetromino.color);
            });

            this.invalidate = false;
        },
        onkeydown: function (event) {
            var handled = false;

            if (event.keyCode == Game.KEY.LEFT) {
                this.inputs.push(KEY.LEFT);
                handled = true;
            } else if (event.keyCode == Game.KEY.UP) {
                this.inputs.push(KEY.UP);
                handled = true;
            } else if (event.keyCode == Game.KEY.RIGHT) {
                this.inputs.push(KEY.RIGHT);
                handled = true;
            } else if (event.keyCode == Game.KEY.DOWN) {
                this.inputs.push(KEY.DOWN);
                handled = true;
            } else if (event.keyCode == Game.KEY.SPACE) {
                this.inputs.push(KEY.SPACE);
                handled = true;
            }

            if (handled) {
                event.preventDefault();
            }
        },
    },
    NextTetromino: {

    },
    Count: {
        initialize: function (tetris) {
            //this.tetris = tetris;
            this.canvas = tetris.runner.canvas;
            this.blocks = [];

            this.canvas.height = tetris.blockHeight * tetris.maxRows;
            this.canvas.width = tetris.blockWidth * tetris.maxColumns;
            //tetrisContext.translate(0.5, 0.5);

        },
        getBlocks: function (x, y) {
            return this.blocks && this.blocks[x] ? this.blocks[x][y] : null;
        },
        setBlocks: function (x, y, type) {
            this.blocks[x] = this.blocks[x] || [];
            this.blocks[x][y] = type;
            //invalidate();
        }
    },
    Stats: {

    }
}