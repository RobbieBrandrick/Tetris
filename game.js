if(!Object.construct){
    Object.construct = function(base){
        var instance = Object.create(base);
        if(instance.initialize){
            instance.initialize.apply(instance, [].slice.call(arguments, 1));
        }

        return instance;
    }
}
var Game = {

    run: function (id, game) {

        return Object.construct(this.Runner, id, game).game;

    },
    timestamp: function () {
        return performance.now();
    },
    get: function (id) {
        return document.getElementById(id);
    },
    html: function (id, html) {
        getById(id).innerHTML = html;
    },
    nextFrame: function (frame) {
        requestAnimationFrame(frame);
    },
    addEvent: function (obj, type, fn) { 
        obj.addEventListener(type, fn, false); 
    },
    removeEvent: function (obj, type, fn) { 
        obj.removeEventListener(type, fn, false); 
    },
    KEY:
        {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            ESC: 27,
            SPACE: 32
        },
    Runner: {
        initialize: function (id, game) {
            this.canvas = Game.get(id);
            this.canvasContext = this.canvas.getContext('2d');
            this.addEvents();
            this.game = Object.construct(game, this);
        },
        start: function () {
            this.lastFrame = Game.timestamp();
            this.running = true;
            //Game.nextFrame(this.gameloop);
            requestAnimationFrame(this.gameloop.bind(this));
        },
        stop: function () {
            this.running = false;
        },
        gameloop: function () {

            if (this.running) {
                requestAnimationFrame(this.gameloop.bind(this));
            }

            var now = Game.timestamp();

            this.update((now - this.lastFrame) / 1000);

            this.draw();

            this.lastFrame = now;
        },
        update: function (time) {
            this.game.update(time);
        },
        draw: function () {
            this.game.draw(this.canvasContext);
        },
        addEvents: function(){
            Game.addEvent(document, 'keydown', this.onkeydown.bind(this))
        },
        onkeydown: function(event){
            if(this.game.onkeydown){
                this.game.onkeydown(event);
            }
        }

    }

};