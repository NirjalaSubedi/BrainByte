import Phaser from 'phaser';
import SoundFX from '../systems/SoundFX.js';

/*
 * Collision categories:
 *   1  = ground/platforms     8  = player arrows
 *   2  = player body         16  = enemy arrows
 *   4  = enemy body          32  = fruits
 */

export default class Arrow {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x, y      – spawn position
   * @param {number} vx, vy    – initial velocity
   * @param {'player'|'enemy'} owner
   * @param {boolean} isBomb
   */
  constructor(scene, x, y, vx, vy, owner, isBomb = false) {
    this.scene  = scene;
    this.owner  = owner;
    this.isBomb = isBomb;
    this.dead   = false;
    this.stuck  = false;
    this.age    = 0;

    const tex = isBomb ? 'arrow_bomb' : 'arrow';
    const myCat  = owner === 'player' ? 8 : 16;
    // Player arrows hit: ground(1), enemy bodies(4), enemy arrows(16), fruits(32)
    // Enemy arrows hit:  ground(1), player bodies(2), player arrows(8)
    const mask = owner === 'player' ? [1, 4, 16, 32] : [1, 2, 8];

    this.image = scene.matter.add.image(x, y, tex);
    this.image.setScale(1.5);
    this.image.setRectangle(66, 9);
    this.image.setFriction(0.01);
    this.image.setFrictionAir(0.0005);
    this.image.setBounce(0);
    this.image.setMass(0.8);
    this.image.setCollisionCategory(myCat);
    this.image.setCollidesWith(mask);
    this.image.setDepth(6);

    this.image.setData('isArrow', true);
    this.image.setData('arrowRef', this);

    this.image.setVelocity(vx, vy);
    SoundFX.play('shoot');
  }

  update(dt) {
    if (this.dead || this.stuck) return;

    this.age += dt;

    // Out of bounds → destroy
    const s = this.scene.scale;
    if (this.image.y > s.height + 200 ||
        this.image.x < -300 || this.image.x > s.width + 300) {
      this.destroy();
      return;
    }

    // Rotate sprite to match velocity vector
    const v = this.image.body.velocity;
    if (Math.abs(v.x) > 0.1 || Math.abs(v.y) > 0.1) {
      this.image.setRotation(Math.atan2(v.y, v.x));
    }
  }

  /**
   * Called when arrow collides with something.
   * @param {Phaser.GameObjects.Image|null} target – the body it hit
   */
  stick(target) {
    if (this.stuck || this.dead) return;
    this.stuck = true;

    if (this.isBomb) {
      this._explode();
      return;
    }

    // Disable further collisions
    this.image.setCollisionCategory(0);
    this.image.setCollidesWith([]);

    if (target && target.body && !target.body.isStatic) {
      // Pin arrow to the dynamic body it hit
      try {
        this._stickConstraint = this.scene.matter.add.constraint(
          this.image.body, target.body, 0, 1, {
            pointA: { x: 18, y: 0 },
            pointB: {
              x: this.image.x - target.x,
              y: this.image.y - target.y,
            },
          }
        );
      } catch (_) {
        this.image.setStatic(true);
      }
    } else {
      this.image.setStatic(true);
    }

    // Auto-destroy after a while
    this.scene.time.delayedCall(8000, () => this.destroy());
  }

  /**
   * Arrow-to-arrow mid-air deflection.
   * Both arrows bounce apart with sparks.
   */
  deflect(otherArrow) {
    if (this.stuck || this.dead) return;
    if (otherArrow.stuck || otherArrow.dead) return;

    // Spark effect
    this._spawnSparks(this.image.x, this.image.y);

    // Reverse velocities with some randomness
    const v = this.image.body.velocity;
    this.image.setVelocity(-v.x * 0.5 + (Math.random() - 0.5) * 4,
                           -v.y * 0.5 - 3);
    SoundFX.play('clank');
  }

  _spawnSparks(sx, sy) {
    for (let i = 0; i < 6; i++) {
      const spark = this.scene.add.image(sx, sy, 'spark')
        .setScale(0.5 + Math.random() * 0.5)
        .setAlpha(1)
        .setDepth(20);
      this.scene.tweens.add({
        targets: spark,
        x: sx + (Math.random() - 0.5) * 40,
        y: sy + (Math.random() - 0.5) * 40,
        alpha: 0,
        scale: 0,
        duration: 250 + Math.random() * 150,
        onComplete: () => spark.destroy(),
      });
    }
  }

  _explode() {
    SoundFX.play('explosion');
    const cx = this.image.x, cy = this.image.y;

    // Visual blast ring
    const ring = this.scene.add.circle(cx, cy, 10, 0xffaa00, 0.9).setDepth(20);
    this.scene.tweens.add({
      targets: ring, scale: 6, alpha: 0, duration: 350,
      onComplete: () => ring.destroy(),
    });
    this._spawnSparks(cx, cy);

    // Physics blast — push nearby dynamic bodies
    const bodies = this.scene.matter.world.getAllBodies();
    bodies.forEach(b => {
      if (b.isStatic) return;
      const dx = b.position.x - cx, dy = b.position.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const strength = (120 - dist) * 0.0006;
        const angle = Math.atan2(dy, dx);
        this.scene.matter.applyForce(b, b.position, {
          x: Math.cos(angle) * strength,
          y: Math.sin(angle) * strength,
        });
      }
    });

    this.destroy();
  }

  destroy() {
    if (this.dead) return;
    this.dead = true;
    try {
      if (this._stickConstraint) {
        this.scene.matter.world.removeConstraint(this._stickConstraint);
      }
      this.image.destroy();
    } catch (_) {}
  }
}
