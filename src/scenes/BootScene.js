import {Scene} from 'phaser';
class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }

  preload() {
    // Load any assets here from your assets directory
    this.load.spritesheet('hero-guy', 'assets/tj19-hero-sm.png', {
      frameWidth: 333.33,
      frameHeight: 533
    });
    this.load.image('tile', 'assets/tj19-tile-sm.png');
    this.load.image('axe', 'assets/axe-sm.png');
  }
  create() {
    this.anims.create({
      key: 'guy-run',
      frames: this.anims.generateFrameNames('hero-guy', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'guy-idle',
      frames: this.anims.generateFrameNames('hero-guy', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1
    });

    this.scene.start('scene-game');
  }
}
export default BootScene;
