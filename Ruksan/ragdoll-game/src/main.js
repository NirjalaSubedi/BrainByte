import Phaser from 'phaser';
import BootScene  from './scenes/BootScene.js';
import GameScene  from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#2a2a2a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
    parent: 'game-container',
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1.8 },
      debug: false,
    },
  },
  input: { activePointers: 3 },
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: true,
  },
  resolution: Math.max(2, window.devicePixelRatio || 2), // High-DPI "4K" mode
  scene: [BootScene, GameScene],
};

new Phaser.Game(config);
