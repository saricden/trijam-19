import {Scene} from 'phaser';
import {configIRC} from '../irc.config';
import tmi from 'tmi.js';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }
  create() {
    // Add, scale, and make up a speed for our creature
    this.guy = this.physics.add.sprite(0, -(250 * 0.5 * 4), 'hero-guy');
    // this.guy.body.setAllowGravity(false);
    this.guy.setScale(0.25);
    this.guy.setBounce(0);
    this.guy.setFriction(0);
    this.guySpeed = 300;
    // Create a helper object for our arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Generate finite level
    const mapGroup = this.physics.add.staticGroup();
    const tileTexture = 'tile';
    let finalTileX = 0;

    for (let x = 0; x <= 100; x++) {
      const y = 300;
      const tileX = (x * 250 * 0.5);
      finalTileX = tileX;
      const rando = Math.random();

      mapGroup.create(tileX, y, tileTexture).setScale(0.5).refreshBody();
      if (rando > 0.25) {
        mapGroup.create(tileX, (y - (250 * 1 * 0.5)), tileTexture).setScale(0.5).refreshBody();
      }
      else if (rando > 0.5) {
        mapGroup.create(tileX, (y - (250 * 2 * 0.5)), tileTexture).setScale(0.5).refreshBody();
      }
      else if (rando > 0.75) {
        mapGroup.create(tileX, (y - (250 * 3 * 0.5)), tileTexture).setScale(0.5).refreshBody();
      }
    }

    this.mapEndX = (finalTileX - (250 * 5 * 0.5)); // 5 tiles from the end of the map is the end of the level

    this.physics.add.collider(this.guy, mapGroup);

    this.cameras.main.setBackgroundColor('#8F7');
    this.cameras.main.startFollow(this.guy, 1, 1, 1, ((window.innerHeight * 0.5) - this.guy.body.height / 2));

    this.statusText = this.add.text(window.innerWidth - 10, 10, "0%", {
      fontFamily: "Sans Serif",
      color: 'rgba(0, 0, 0, 0)',
      align: "right",
      stroke: '#000',
      strokeThickness: 1,
      fontSize: 42
    });
    this.statusText.setOrigin(1, 0);
    this.statusText.setScrollFactor(0);

    // Setup listener for IRC chat generating axes
    // Parse axe message
    const options = {
      ...configIRC
    };

    const client = new tmi.client(options);
    client.on('message', this.messageHandler.bind(this));
    client.connect();

    // Baddy collision
    this.axes = this.physics.add.group([], {});
    this.physics.add.overlap(this.guy, this.axes, this.handleAxeHit.bind(this));
    this.maxHP = 100;
    this.hp = this.maxHP;
    this.hpText = this.add.text(10, 10, "100 / 100", {
      fontFamily: "Sans Serif",
      color: 'rgba(0, 0, 0, 0)',
      align: "left",
      stroke: '#000',
      strokeThickness: 1,
      fontSize: 42,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      padding: 5
    });
    this.hpText.setOrigin(0, 0);
    this.hpText.setScrollFactor(0);
  }

  handleAxeHit(guy, axe) {
    this.hp -= axe.damage;
    axe.destroy();
  }

  messageHandler(target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    const message = msg.trim();
    const isCommand = message.startsWith('!');
    const {username} = context;

    if (isCommand) {
      const newAxe = this.physics.add.sprite(this.guy.x, (this.guy.y - 300), 'axe');
      switch (message) {
        case '!axe':
          newAxe.setScale(0.25);
          newAxe.setRotation(Math.PI / 2);
          newAxe.damage = 10;

          this.axes.add(newAxe);
        break;

        case '!bigaxe':
          newAxe.setScale(0.5);
          newAxe.setRotation(Math.PI / 2.5);
          newAxe.damage = 25;

          this.axes.add(newAxe);
        break;

        case '!axxe':
          newAxe.setScale(0.05);
          newAxe.setRotation(Math.PI / 1.5);
          newAxe.damage = 30;

          this.axes.add(newAxe);
        break;

        case '!mastaaxa':
          newAxe.setScale(0.3);
          newAxe.setAlpha(0.5);
          newAxe.setRotation(Math.PI / 1.5);
          newAxe.damage = 15;

          this.axes.add(newAxe);
        break;

        default:
        break;
      }
    }
  }

  update() {
    const {guy, guySpeed, mapEndX} = this;
    const {up, left, down, right} = this.cursors;
    const isTouchingGround = (guy.body.blocked.down);
    const percentageComplete = (guy.x / mapEndX * 100).toFixed(0);

    if (guy.x < mapEndX) {
      this.statusText.setText(percentageComplete+'%');
      this.hpText.setText(this.hp+' / '+this.maxHP);

      if (left.isDown) {
        guy.body.setVelocityX(-guySpeed);
        guy.setFlipX(true);
      }
      else if (right.isDown) {
        guy.body.setVelocityX(guySpeed);
        guy.setFlipX(false);
      }
      else {
        guy.body.setVelocityX(0);
      }

      if (up.isDown && isTouchingGround) {
        guy.setVelocityY(-(guySpeed*2));
      }
    }
    else {
      this.statusText.setText('Ayyy you are the weiner!');
      this.hpText.setAlpha(0);
      guy.body.setVelocityX((guySpeed * 0.5));
      guy.setFlipX(true);

      if (isTouchingGround) {
        guy.setVelocityY(-(guySpeed*2));
      }
    }

    if (guy.body.velocity.y < 0) {
      // jump animation
      guy.setRotation(guy.rotation + 0.50);
    }
    else if (guy.body.velocity.y > 0) {
      guy.setRotation(guy.rotation + 0.25);
    }
    else if (guy.body.velocity.x !== 0) {
      // run
      guy.setRotation(0);
      guy.anims.play('guy-run', true);
    }
    else {
      guy.anims.play('guy-idle', true);
    }

    // Check if fallen off edge, reset level
    const isDed = (
      (guy.y > 1000)
      ||
      (this.hp <= 0)
    );

    if (isDed) {
      this.scene.restart();
    }
  }
}

export default GameScene;
