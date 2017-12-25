const WIDTH = 500;
const HEIGHT = 800;

const game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO);

var score = 0;

var playBall = null;
var targetBall1 = null;
var targetBall2 = null;
var obstacleBall = null;

var info = null;
var resetButton = null;

var turnStarted = false;
var inputEnabled = true;
var targetBall1HitThisTurn = false;
var targetBall2HitThisTurn = false;
var roundHasGivenScore = false;

var balls = [];

var GameState = {
    preload: function () {
        //this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        //this.scale.forceOrientation(false, true);
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        //this.stage.backgroundColor = '#eee';

        this.load.image('wood', 'assets/images/wood2.jpg');
        this.load.image('pool1', 'assets/images/pool1.png');
        this.load.image('pool2', 'assets/images/pool2.png');
        this.load.image('pool8', 'assets/images/pool8.png');
        this.load.image('poolwhite', 'assets/images/poolwhite.png');
        this.load.image('resetButtonImage', 'assets/images/reset.png');
    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'wood', 92);

        this.scoreText = game.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000000',
            strokeThickness: 6
        });

        this.infoText = game.add.text(50, 200, 'You can move the white ball.\nHit the yellow ball and the blue ball within\nthe same turn to score a point.\nDo not let the white ball touch the black ball!', {
            fontSize: '19px',
            fill: '#fff',
            stroke: '#000000',
            strokeThickness: 5
        });

        this.button = game.add.button(WIDTH-96, HEIGHT - 96, 'resetButtonImage', resetState, this, 2, 1, 0);

        resetButton = this.button;
        info = this.infoText;


        targetBall1 = game.add.sprite(WIDTH / 3, 400, "pool1");
        targetBall2 = game.add.sprite(WIDTH / 3 * 2, 400, "pool2");
        playBall = game.add.sprite(WIDTH / 2, HEIGHT - 48, "poolwhite");
        obstacleBall = game.add.sprite(WIDTH / 2, 48, "pool8");

        addBody(targetBall1);
        addBody(targetBall2);
        addBody(playBall);
        addBody(obstacleBall);

        playBall.inputEnabled = true;
        playBall.events.onInputDown.add(function () {
            if (!turnStarted) {
                inputEnabled = true;
                playBall.body.stop();
                playBall.tint = 0xff0000;
            }
        }, this);
        //Launching the white ball.
        playBall.events.onInputUp.add(function () {
            if (inputEnabled) {
                playBall.body.velocity.x = game.input.x - playBall.body.x - 32;
                playBall.body.velocity.y = game.input.y - playBall.body.y - 32;
                playBall.tint = 0xffffff;
                startTurn()
            }
        }, this);
        this.scoreText.bringToTop();
        this.infoText.bringToTop();

    },

    update: function () {
        // Collision Detection
        for (var i = 0; i < balls.length; i++) {
            for (var j = i; j < balls.length; j++) {
                if (i !== j) {
                    if (this.physics.arcade.collide(balls[i], balls[j])) {
                        // If one of the checked balls is the playBall
                        if (balls[i] === playBall || balls[j] === playBall) {
                            // If the other ball is the obstacleBall
                            if (balls[i] === obstacleBall || balls[j] === obstacleBall) {
                                score--;
                                resetState();
                            } else if (balls[i] === targetBall1 || balls[j] === targetBall1) {
                                targetBall1HitThisTurn = true;
                                if (targetBall1HitThisTurn && targetBall2HitThisTurn && !roundHasGivenScore) {
                                    roundHasGivenScore = true;
                                    score++;
                                    resetState()
                                }
                            } else if (balls[i] === targetBall2 || balls[j] === targetBall2) {
                                targetBall2HitThisTurn = true;
                                if (targetBall1HitThisTurn && targetBall2HitThisTurn && !roundHasGivenScore) {
                                    roundHasGivenScore = true;
                                    score++;
                                    resetState();
                                }
                            }

                        }
                    }
                }
            }
            // Setting visual rotation
            balls[i].angle += balls[i].body.velocity.x / 30;
        }

        this.scoreText.text = "Score: " + score;

        if (turnStarted && Phaser.Point.equals(playBall.body.velocity, new Phaser.Point(0, 0))
            && Phaser.Point.equals(obstacleBall.body.velocity, new Phaser.Point(0, 0))
            && Phaser.Point.equals(targetBall2.body.velocity, new Phaser.Point(0, 0))
            && Phaser.Point.equals(targetBall1.body.velocity, new Phaser.Point(0, 0))) { // When all balls rest after starting turn

            resetState();
        }
    }
};

function addBody(sprite) {
    game.physics.arcade.enable(sprite);
    sprite.anchor.setTo(0.5, 0.5);
    // Setting physical parameters
    sprite.body.setCircle(32);
    sprite.body.collideWorldBounds = true;
    sprite.body.bounce.set(0.9);
    sprite.body.drag.set(10, 10);
    balls.push(sprite);
}

function startTurn() {
    inputEnabled = false;
    turnStarted = true;
    info.visible = false;
}

function resetState() {
    targetBall1.body.stop();
    targetBall1.x = WIDTH / 3;
    targetBall1.y = 400;
    targetBall2.body.stop();
    targetBall2.x = WIDTH / 3 * 2;
    targetBall2.y = 400;
    playBall.body.stop();
    playBall.x = WIDTH / 2;
    playBall.y = HEIGHT - 48;
    obstacleBall.body.stop();
    obstacleBall.x = WIDTH / 2;
    obstacleBall.y = 48;

    targetBall2HitThisTurn = false;
    targetBall1HitThisTurn = false;
    turnStarted = false;
    roundHasGivenScore = false;
    inputEnabled = true;
    info.visible = true;

}


game.state.add('GameState', GameState);
game.state.start('GameState');