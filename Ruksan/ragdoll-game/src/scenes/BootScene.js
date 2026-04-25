import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = this.scale.width, H = this.scale.height;

    // Loading bar
    const barBg = this.add.rectangle(W/2, H/2, 300, 20, 0x333333);
    const barFill = this.add.rectangle(W/2 - 148, H/2, 4, 16, 0xffffff).setOrigin(0, 0.5);
    this.load.on('progress', v => { barFill.width = 296 * v; });
    this.load.on('complete', () => { barBg.destroy(); barFill.destroy(); });

    this._generate(W, H);
  }

  _generate(W, H) {
    this._bg(W, H);
    this._platform();
    this._stickman();
    this._weapons();
    this._helmets();
    this._ui();
    this._fruits();
  }

  /* ───────── Background ───────── */
  _bg(W, H) {
    const g = this.make.graphics({ add: false });
    // gradient-ish sky
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.floor(42 + t * 10);
      const gb = Math.floor(42 + t * 8);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gb, gb + 4));
      g.fillRect(0, y, W, 1);
    }
    // stars
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 80; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, H * 0.7);
      g.fillCircle(sx, sy, Math.random() * 1.2 + 0.4);
    }
    g.generateTexture('bg', W, H);
    g.destroy();
  }

  /* ───────── Platforms ───────── */
  _platform() {
    // Player tower  (wide, textured)
    let g = this.make.graphics({ add: false });
    const tw = 140, th = 320;
    g.fillStyle(0x5a5a5a); g.fillRect(0, 0, tw, th);
    // brick lines
    g.lineStyle(1, 0x4a4a4a, 0.6);
    for (let r = 0; r < th; r += 40) {
      g.strokeLineShape(new Phaser.Geom.Line(0, r, tw, r));
      const off = (r / 40) % 2 === 0 ? 0 : tw / 2;
      g.strokeLineShape(new Phaser.Geom.Line(off + tw / 2, r, off + tw / 2, r + 40));
    }
    // top edge highlight
    g.fillStyle(0x6a6a6a); g.fillRect(0, 0, tw, 6);
    g.generateTexture('tower', tw, th);
    g.destroy();

    // Enemy block (single square)
    g = this.make.graphics({ add: false });
    g.fillStyle(0x666666); g.fillRect(0, 0, 44, 44);
    g.lineStyle(2, 0x555555); g.strokeRect(1, 1, 42, 42);
    g.fillStyle(0x6e6e6e); g.fillRect(0, 0, 44, 4);
    g.generateTexture('block', 44, 44);
    g.destroy();
  }

  /* ───────── Stickman body parts ───────── */
  _stickman() {
    let g;

    // Head (circle, bright white)
    g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff); g.fillCircle(16, 16, 16);
    g.generateTexture('head', 32, 32);
    g.destroy();

    // Torso (rectangular with subtle muscle lines)
    g = this.make.graphics({ add: false });
    const tw = 22, th = 40;
    g.fillStyle(0xf0f0f0); g.fillRoundedRect(0, 0, tw, th, 5);
    // pec shadow
    g.fillStyle(0xd8d8d8); g.fillRoundedRect(2, 3, tw - 4, 8, 3);
    // ab lines
    g.lineStyle(1, 0xc0c0c0, 0.5);
    g.strokeLineShape(new Phaser.Geom.Line(tw/2, 13, tw/2, 36));
    for (let ay = 14; ay < 36; ay += 7) {
      g.strokeLineShape(new Phaser.Geom.Line(4, ay, tw - 4, ay));
    }
    g.generateTexture('torso', tw, th);
    g.destroy();

    // Upper arm
    g = this.make.graphics({ add: false });
    g.fillStyle(0xe8e8e8); g.fillRoundedRect(0, 0, 8, 24, 4);
    g.generateTexture('upperArm', 8, 24);
    g.destroy();

    // Forearm (slightly thinner)
    g = this.make.graphics({ add: false });
    g.fillStyle(0xe0e0e0); g.fillRoundedRect(0, 0, 7, 22, 3);
    // hand blob
    g.fillStyle(0xf0f0f0); g.fillCircle(3.5, 20, 4);
    g.generateTexture('forearm', 7, 22);
    g.destroy();

    // Thigh
    g = this.make.graphics({ add: false });
    g.fillStyle(0xe4e4e4); g.fillRoundedRect(0, 0, 9, 26, 4);
    g.generateTexture('thigh', 9, 26);
    g.destroy();

    // Shin
    g = this.make.graphics({ add: false });
    g.fillStyle(0xdcdcdc); g.fillRoundedRect(0, 0, 8, 24, 4);
    // foot
    g.fillStyle(0xc8c8c8); g.fillRoundedRect(0, 20, 10, 6, 3);
    g.generateTexture('shin', 10, 26);
    g.destroy();
  }

  /* ───────── Bow & Arrow ───────── */
  _weapons() {
    let g;

    // Bow — detailed recurve shape
    g = this.make.graphics({ add: false });
    const bw = 20, bh = 64;
    // Outer glow/shadow
    g.lineStyle(6, 0x8B4513, 0.5);
    g.beginPath(); g.arc(bw + 6, bh / 2, 28, -1.2, 1.2, false); g.strokePath();
    // Main wood
    g.lineStyle(4, 0xDAA520); // Golden rod
    g.beginPath(); g.arc(bw + 6, bh / 2, 28, -1.2, 1.2, false); g.strokePath();
    // recurve tips
    g.lineStyle(3, 0xFFD700);
    g.beginPath(); g.arc(bw, 4, 10, -1.8, -0.4, false); g.strokePath();
    g.beginPath(); g.arc(bw, bh - 4, 10, 0.4, 1.8, false); g.strokePath();
    // grip wrap
    g.fillStyle(0x8B0000); g.fillRect(bw + 5, bh / 2 - 8, 8, 16);
    g.lineStyle(1, 0xFFD700); g.strokeRect(bw + 5, bh / 2 - 8, 8, 16);
    g.generateTexture('bow', bw + 40, bh + 8);
    g.destroy();

    // Arrow — shaft + arrowhead + fletchings
    g = this.make.graphics({ add: false });
    const aw = 54, ah = 10;
    // shaft
    g.fillStyle(0xcccccc); g.fillRect(8, ah/2 - 1, 38, 2);
    // arrowhead (sharp metal tip pointing RIGHT)
    g.fillStyle(0xffffff);
    g.beginPath();
    g.moveTo(54, ah / 2); // very tip
    g.lineTo(44, ah / 2 - 4); // top back
    g.lineTo(46, ah / 2); // center indent
    g.lineTo(44, ah / 2 + 4); // bottom back
    g.fillPath();
    // fletchings (white feathers)
    g.fillStyle(0xffffff);
    g.beginPath(); g.moveTo(8, ah/2); g.lineTo(2, 0); g.lineTo(12, ah/2-1); g.fillPath();
    g.beginPath(); g.moveTo(8, ah/2); g.lineTo(2, ah); g.lineTo(12, ah/2+1); g.fillPath();
    g.generateTexture('arrow', aw, ah);
    g.destroy();

    // Bomb arrow
    g = this.make.graphics({ add: false });
    g.fillStyle(0x888888); g.fillRect(6, 5, 30, 2);
    g.fillStyle(0x444444); g.fillCircle(14, 6, 6);
    g.fillStyle(0xff4400); g.fillCircle(14, 6, 2.5);
    g.fillStyle(0xc0c0c0); g.fillTriangle(36, 6, 44, 2, 44, 10);
    g.generateTexture('arrow_bomb', 44, 12);
    g.destroy();

    // Trajectory dot — tiny white dot
    g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff, 0.9); g.fillCircle(2, 2, 2);
    g.generateTexture('traj_dot', 4, 4);
    g.destroy();
  }

  /* ───────── Helmets (6 tiers) ───────── */
  _helmets() {
    const defs = [
      { fill: 0x888888, type: 'iron' },
      { fill: 0x777777, type: 'bucket' },
      { fill: 0x666666, type: 'viking' },
      { fill: 0xb87333, type: 'spartan' },
      { fill: 0x4a4a5a, type: 'knight' },
      { fill: 0xffd700, type: 'crown' },
    ];

    defs.forEach((d, i) => {
      const g = this.make.graphics({ add: false });
      const s = 28;

      if (d.type === 'iron') {
        g.fillStyle(d.fill); g.fillCircle(s/2, s/2 + 2, 14);
        g.fillStyle(0xaaaaaa); g.fillCircle(s/2 - 4, s/2 - 2, 4); // shine
        g.fillStyle(0x333333); g.fillRect(s/2, s/2 - 2, 12, 6); // visor
      }
      else if (d.type === 'bucket') {
        g.fillStyle(d.fill); g.fillRect(2, 2, s - 4, s - 4);
        g.fillStyle(0xaaaaaa); g.fillRect(4, 4, 4, s - 8); // shine
        g.fillStyle(0x444444); g.fillRect(s/2 + 2, 8, 8, 5); // eye slit
      }
      else if (d.type === 'viking') {
        g.fillStyle(d.fill); g.fillCircle(s/2, s/2 + 2, 13);
        g.fillStyle(0xaaaaaa); g.fillCircle(s/2 - 3, s/2 - 1, 3); // shine
        g.fillStyle(0xeeeeee);
        g.fillTriangle(2, s/2, -4, -2, 8, s/2 - 5); // left horn
        g.fillTriangle(s - 2, s/2, s + 4, -2, s - 8, s/2 - 5); // right horn
      }
      else if (d.type === 'spartan') {
        g.fillStyle(d.fill); g.fillCircle(s/2, s/2 + 2, 13);
        g.fillStyle(0xcc2222); g.fillRoundedRect(s/2 - 5, -4, 10, 14, 4); // plume
        g.fillStyle(0xff5555); g.fillRoundedRect(s/2 - 3, -2, 4, 10, 2); // plume highlight
        g.fillStyle(0x333333); g.fillRect(s/2 + 2, s/2, 8, 10); // face guard
      }
      else if (d.type === 'knight') {
        g.fillStyle(d.fill); g.fillRoundedRect(1, 1, s - 2, s - 2, 4);
        g.fillStyle(0x8888aa); g.fillRect(3, 3, 4, s - 6); // shine
        g.fillStyle(0x2a2a3a); g.fillRect(s/2, s/2 - 2, 12, 4); // visor slit
        g.fillRect(s/2 + 4, s/2 - 6, 3, 14);
      }
      else if (d.type === 'crown') {
        g.fillStyle(0xFFD700);
        g.fillRect(2, s/2, s - 4, s/2 - 2);
        g.fillTriangle(2, s/2, 2, 0, 10, s/2);
        g.fillTriangle(10, s/2, s/2, -4, s - 10, s/2);
        g.fillTriangle(s - 10, s/2, s - 2, 0, s - 2, s/2);
        g.fillStyle(0xFFFFFF); g.fillRect(4, s/2 + 2, s - 8, 2); // highlight
        // gems
        g.fillStyle(0xFF0000); g.fillCircle(s/2, s/2 + 6, 3);
        g.fillStyle(0x0000FF); g.fillCircle(6, s/2 + 6, 2); g.fillCircle(s-6, s/2 + 6, 2);
      }

      g.generateTexture(`helmet${i + 1}`, s, s);
      g.destroy();
    });
  }

  /* ───────── UI icons ───────── */
  _ui() {
    // Skull icon
    let g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff); g.fillCircle(12, 10, 10);
    g.fillStyle(0x2a2a2a);
    g.fillCircle(8, 8, 2.5); g.fillCircle(16, 8, 2.5); // eye sockets
    g.fillStyle(0xffffff);
    g.fillRect(7, 16, 10, 6);
    g.fillStyle(0x2a2a2a);
    g.fillRect(9, 16, 1.5, 6); g.fillRect(12, 16, 1.5, 6); g.fillRect(15, 16, 1.5, 6);
    g.generateTexture('skull', 24, 24);
    g.destroy();

    // Spark particle
    g = this.make.graphics({ add: false });
    g.fillStyle(0xffdd44); g.fillCircle(4, 4, 4);
    g.generateTexture('spark', 8, 8);
    g.destroy();
  }

  /* ───────── Fruits ───────── */
  _fruits() {
    let g;
    // Red apple
    g = this.make.graphics({ add: false });
    g.fillStyle(0xdd2222); g.fillCircle(12, 14, 11);
    g.fillStyle(0x5a3010); g.fillRect(11, 1, 2, 5);
    g.fillStyle(0x33aa22); g.fillEllipse(16, 4, 7, 4);
    g.generateTexture('apple_red', 24, 28);
    g.destroy();

    // Green apple
    g = this.make.graphics({ add: false });
    g.fillStyle(0x55cc33); g.fillCircle(12, 14, 11);
    g.fillStyle(0x5a3010); g.fillRect(11, 1, 2, 5);
    g.fillStyle(0x228811); g.fillEllipse(16, 4, 7, 4);
    g.generateTexture('apple_green', 24, 28);
    g.destroy();

    // Bomb fruit
    g = this.make.graphics({ add: false });
    g.fillStyle(0x222222); g.fillCircle(12, 16, 10);
    g.fillStyle(0x111111); g.fillCircle(10, 14, 8); // highlight
    g.lineStyle(2, 0xffaa00); g.beginPath(); g.moveTo(12, 6); g.lineTo(16, 2); g.strokePath(); // fuse
    g.fillStyle(0xff4400); g.fillCircle(17, 1, 3); // spark
    g.generateTexture('bomb', 24, 28);
    g.destroy();
  }

  create() {
    this.scene.start('GameScene');
  }
}
