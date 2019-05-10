import {Scene} from 'phaser';
class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }
  create() {
    // Add, scale, and make up a speed for our creature
    //this.cat = this.physics.add.sprite(10, 10, 'cat-like');
    //this.cat.body.setAllowGravity(false);
    //this.cat.setScale(0.5);
    //this.catSpeed = 300;
    // Create a helper object for our arrow keys
    //this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    console.log('playing da gaem!');
  }
}

export default GameScene;
