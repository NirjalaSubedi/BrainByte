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

    // Load sounds
    this.load.audio('hit', 'assets/hit.mp3');
    this.load.audio('shoot', 'assets/shoot.mp3');
    this.load.audio('gameover', 'assets/gameover.mp3');
    this.load.audio('headshot', 'assets/headshot.mp3');
    this.load.audio('arrow_hurt', 'assets/arrow_hurt.mp3');
    this.load.audio('scream', 'assets/scream.mp3');
    this.load.audio('bgm', 'assets/bg_music.mp3');
    this.load.audio('victory', 'assets/victory.mp3');
    this.load.audio('defeat', 'assets/defeat.mp3');
    this.load.audio('draw', 'assets/draw.mp3');

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

    // Refined Recurve Bow — matching second image style
    g = this.make.graphics({ add: false });
    const bw = 60, bh = 140; 
    
    // Main Bow Body (Vibrant Orange)
    g.lineStyle(8, 0xffa500); 
    g.beginPath();
    // Use arc for the main curve
    g.arc(20, 70, 60, -1.2, 1.2, false);
    g.strokePath();

    // Add "bumps" / ornaments on limbs
    g.fillStyle(0xffa500);
    g.fillCircle(25, 45, 5);
    g.fillCircle(25, 95, 5);
    
    // Recurve tips using simple lines/arcs
    g.lineStyle(5, 0xffa500);
    // Upper tip
    g.beginPath();
    g.moveTo(42, 22);
    g.lineTo(55, 10);
    g.strokePath();
    // Lower tip
    g.beginPath();
    g.moveTo(42, 118);
    g.lineTo(55, 130);
    g.strokePath();

    g.generateTexture('bow', 80, 140);
    g.destroy();

    // Simple White Arrow — matching second image
    g = this.make.graphics({ add: false });
    const aw = 60, ah = 12;
    // Shaft
    g.lineStyle(2, 0xffffff);
    g.beginPath();
    g.moveTo(0, ah/2);
    g.lineTo(50, ah/2);
    g.strokePath();
    
    // Head (Simple white triangle)
    g.fillStyle(0xffffff);
    g.beginPath();
    g.moveTo(60, ah/2);
    g.lineTo(48, ah/2 - 6);
    g.lineTo(48, ah/2 + 6);
    g.closePath();
    g.fillPath();

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

  _helmets() {
    const defs = [
      { fill: 0x888888, type: 'iron' },
      { fill: 0xbdc3c7, type: 'bucket' },
      { fill: 0x7f8c8d, type: 'viking' },
      { fill: 0xd35400, type: 'spartan' },
      { fill: 0x2c3e50, type: 'knight' },
      { fill: 0xf1c40f, type: 'crown' },
    ];

    defs.forEach((d, i) => {
      const g = this.make.graphics({ add: false });
      const s = 40; 
      g.lineStyle(3, 0x111111);

      if (d.type === 'iron') {
        g.fillStyle(d.fill);
        g.fillCircle(s/2, s/2 + 2, 18);
        g.strokeCircle(s/2, s/2 + 2, 18);
        g.fillStyle(0xeeeeee); g.fillCircle(s/2 - 6, s/2 - 4, 6);
        g.fillStyle(0x333333); g.fillRect(s/2, s/2 - 4, 16, 8);
      }
      else if (d.type === 'bucket') {
        g.fillStyle(d.fill);
        g.fillRoundedRect(4, 4, s - 8, s - 8, 4);
        g.strokeRoundedRect(4, 4, s - 8, s - 8, 4);
        g.fillStyle(0xeeeeee); g.fillRect(6, 6, 6, s - 12);
        g.fillStyle(0x222222); g.fillRect(s/2 + 4, 10, 10, 6);
      }
      else if (d.type === 'viking') {
        g.fillStyle(d.fill);
        g.fillCircle(s/2, s/2 + 2, 17);
        g.strokeCircle(s/2, s/2 + 2, 17);
        g.fillStyle(0xecf0f1);
        g.beginPath(); g.moveTo(6, s/2); g.lineTo(-6, -4); g.lineTo(12, s/2 - 6); g.fillPath(); g.strokePath();
        g.beginPath(); g.moveTo(s - 6, s/2); g.lineTo(s + 6, -4); g.lineTo(s - 12, s/2 - 6); g.fillPath(); g.strokePath();
      }
      else if (d.type === 'spartan') {
        g.fillStyle(d.fill);
        g.fillCircle(s/2, s/2 + 2, 17);
        g.strokeCircle(s/2, s/2 + 2, 17);
        g.fillStyle(0xc0392b);
        g.fillRoundedRect(s/2 - 6, -6, 12, 18, 6);
        g.strokeRoundedRect(s/2 - 6, -6, 12, 18, 6);
        g.fillStyle(0x222222); g.fillRect(s/2 + 4, s/2, 10, 12);
      }
      else if (d.type === 'knight') {
        g.fillStyle(d.fill);
        g.fillRoundedRect(2, 2, s - 4, s - 4, 6);
        g.strokeRoundedRect(2, 2, s - 4, s - 4, 6);
        g.fillStyle(0x222222); g.fillRect(s/2 + 2, s/2 - 4, 14, 6);
      }
      else if (d.type === 'crown') {
        g.fillStyle(d.fill);
        g.beginPath();
        g.moveTo(4, s/2 + 10); g.lineTo(4, s/2 - 4); g.lineTo(12, s/2 + 2);
        g.lineTo(s/2, -4); g.lineTo(s - 12, s/2 + 2);
        g.lineTo(s - 4, s/2 - 4); g.lineTo(s - 4, s/2 + 10);
        g.closePath();
        g.fillPath(); g.strokePath();
        g.fillStyle(0xe74c3c); g.fillCircle(s/2, s/2 + 4, 4);
      }

      g.generateTexture(`helmet${i + 1}`, s, s);
      g.destroy();
    });
  }

  _ui() {
    let g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff); g.fillCircle(12, 10, 10);
    g.fillStyle(0x2a2a2a);
    g.fillCircle(8, 8, 2.5); g.fillCircle(16, 8, 2.5);
    g.fillStyle(0xffffff);
    g.fillRect(7, 16, 10, 6);
    g.generateTexture('skull', 24, 24);
    g.destroy();

    g = this.make.graphics({ add: false });
    g.fillStyle(0xffdd44); g.fillCircle(4, 4, 4);
    g.generateTexture('spark', 8, 8);
    g.destroy();
  }

  _fruits() {
    let g;
    g = this.make.graphics({ add: false });
    g.fillStyle(0xdd2222); g.fillCircle(12, 14, 11);
    g.generateTexture('apple_red', 24, 28);
    g.destroy();

    g = this.make.graphics({ add: false });
    g.fillStyle(0x55cc33); g.fillCircle(12, 14, 11);
    g.generateTexture('apple_green', 24, 28);
    g.destroy();

    g = this.make.graphics({ add: false });
    g.fillStyle(0xffaa00); g.fillCircle(12, 14, 11);
    g.generateTexture('apple_orange', 24, 28);
    g.destroy();

    g = this.make.graphics({ add: false });
    g.fillStyle(0x222222); g.fillCircle(12, 16, 10);
    g.generateTexture('bomb', 24, 28);
    g.destroy();
  }

  create() {
    this.scene.start('GameSceneReact');
  }
}
