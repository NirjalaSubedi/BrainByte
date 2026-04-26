import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import GameSceneReact from '../components/GameSceneReact.js';

/**
 * Creates a Phaser.Game instance mounted inside the given DOM container.
 * Passes an eventBus object so Phaser can communicate with React.
 */
export function createGame(container, eventBus) {
  // Store the event bus globally so scenes can access it
  window.__REACT_EVENT_BUS__ = eventBus;

  const config = {
    type: Phaser.AUTO,
    backgroundColor: '#0d0d12',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
      parent: container,
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
    resolution: Math.max(2, window.devicePixelRatio || 2),
    scene: [BootScene, GameSceneReact],
  };

  return new Phaser.Game(config);
}

/**
 * Cleanly destroy a Phaser.Game instance.
 */
export function destroyGame(game) {
  if (game) {
    window.__REACT_EVENT_BUS__ = null;
    game.destroy(true);
  }
}
