import Phaser from 'phaser';
import SoundFX from '../systems/SoundFX.js';

/**
 * Fruit that falls from the sky along a gentle arc.
 * Shoot it mid-air for bonus HP/Stamina/Lives.
 *
 * Collision category 32 — only collides with player arrows (8).
 */

const TYPES = {
  red:    { key: 'apple_red',    reward: 'hp',      amount: 25, color: '#ff4444' },
  green:  { key: 'apple_green',  reward: 'stamina', amount: 35, color: '#44ff44' },
  orange: { key: 'apple_orange', reward: 'extra',   amount: 1,  color: '#ffcc00' },
  bomb:   { key: 'bomb',         reward: 'bomb',    amount: 1,  color: '#ff8800' },
};

export default class Fruit {
  constructor(scene) {
    this.scene = scene;
    this.dead  = false;

    // Random type weighted
    const roll = Math.random();
    const typeKey = roll < 0.4 ? 'red' : roll < 0.7 ? 'green' : roll < 0.85 ? 'orange' : 'bomb';
    this.typeData = TYPES[typeKey];

    // Spawn from top, random X
    const W = scene.scale.width;
    const H = scene.scale.height;
    const sx = Phaser.Math.Between(W * 0.2, W * 0.8);
    const sy = -30;

    this.image = scene.matter.add.image(sx, sy, this.typeData.key);
    this.image.setScale(1.5);
    this.image.setCircle(16);
    this.image.setFrictionAir(0.06); // Slower falling speed
    this.image.setBounce(0.3);
    this.image.setMass(0.3);
    this.image.setCollisionCategory(32);
    this.image.setCollidesWith([8, 16]); // both player and enemy arrows can hit it
    this.image.setDepth(5);

    this.image.setData('isFruit', true);
    this.image.setData('fruitRef', this);

    // Gentle slow drift velocity
    const vx = (Math.random() - 0.5) * 1.5;
    const vy = Phaser.Math.Between(0, 1);
    this.image.setVelocity(vx, vy);
    this.image.setAngularVelocity((Math.random() - 0.5) * 0.03);
  }

  update() {
    if (this.dead) return;
    // Destroy if it falls off-screen
    if (this.image.y > this.scene.scale.height + 60) {
      this.dead = true;
      try { this.image.destroy(); } catch (_) {}
    }
  }

  /**
   * Called when a player arrow hits this fruit.
   * @returns {{ reward: string, amount: number }}
   */
  collect() {
    if (this.dead) return null;
    this.dead = true;

    SoundFX.play('apple');

    const x = this.image.x, y = this.image.y;

    // Slice flash
    const slash = this.scene.add.line(0, 0, x - 20, y - 10, x + 20, y + 10, 0xffffff)
      .setLineWidth(3).setDepth(30);
    this.scene.tweens.add({
      targets: slash, alpha: 0, duration: 200,
      onComplete: () => slash.destroy(),
    });

    // Floating reward text
    const label = this.typeData.reward === 'extra'
      ? '+1 LIFE!'
      : this.typeData.reward === 'bomb' ? 'BOMB ARROW!' 
      : `+${this.typeData.amount} ${this.typeData.reward.toUpperCase()}`;
    const txt = this.scene.add.text(x, y, label, {
      fontSize: '16px', fontStyle: 'bold',
      color: this.typeData.color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30);
    this.scene.tweens.add({
      targets: txt, y: y - 50, alpha: 0, duration: 1200,
      onComplete: () => txt.destroy(),
    });

    try { this.image.destroy(); } catch (_) {}
    return this.typeData;
  }
}
