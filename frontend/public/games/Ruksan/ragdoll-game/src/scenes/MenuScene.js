import Phaser from 'phaser';
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.image(W / 2, H / 2, 'sky');

    // Animated floating arrows decoration
    for (let i = 0; i < 5; i++) {
      const ax = Phaser.Math.Between(100, 800);
      const ay = Phaser.Math.Between(80, 300);
      const decArrow = this.add.image(ax, ay, 'arrow').setAlpha(0.15).setScale(2);
      this.tweens.add({
        targets: decArrow,
        x: ax + Phaser.Math.Between(-30, 30),
        y: ay + Phaser.Math.Between(-20, 20),
        angle: Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Title glow effect
    const titleGlow = this.add.text(W / 2, 150, 'RAGDOLL\nARCHERS', {
      fontSize: '72px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      color: '#c8a96e',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titleGlow,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(W / 2, 255, '🏹 Stickman Physics Archery', {
      fontSize: '20px',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#8ecae6',
    }).setOrigin(0.5);

    // ── PLAY button ──
    this.createButton(W / 2, 330, '▶  PLAY', 0x2ecc71, 0x27ae60, () => {
      this.cameras.main.fade(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('GameScene'));
    });

    // ── HOW TO PLAY ──
    this.createButton(W / 2, 400, '?  HOW TO PLAY', 0x3498db, 0x2980b9, () => {
      this.showHelp();
    });

    // Version tag
    this.add.text(W - 10, H - 10, 'v1.0 — BrainByte', {
      fontSize: '12px', color: '#ffffff44', fontFamily: 'monospace',
    }).setOrigin(1, 1);

    // Controls hint
    this.add.text(W / 2, H - 30, 'Drag & release to shoot  •  Aim for the head!', {
      fontSize: '14px', color: '#ffffff66', fontFamily: 'Segoe UI',
    }).setOrigin(0.5);

    // Floating stickman silhouette
    const silhouette = this.add.graphics();
    silhouette.fillStyle(0x000000, 0.3);
    silhouette.fillCircle(80, 420, 14);
    silhouette.fillRect(73, 434, 14, 30);
    silhouette.fillRect(60, 438, 13, 6);
    silhouette.fillRect(81, 438, 13, 6);
    silhouette.fillRect(68, 464, 10, 26);
    silhouette.fillRect(82, 464, 10, 26);

    this.tweens.add({
      targets: silhouette,
      y: -8,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createButton(x, y, label, colorNormal, colorHover, callback) {
    const bg = this.add.graphics();
    const drawBtn = (color) => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x - 140, y - 24, 280, 48, 12);
      bg.lineStyle(2, 0xffffff, 0.3);
      bg.strokeRoundedRect(x - 140, y - 24, 280, 48, 12);
    };
    drawBtn(colorNormal);

    const txt = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 280, 48).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      drawBtn(colorHover);
      this.tweens.add({ targets: [bg, txt], scaleX: 1.04, scaleY: 1.04, duration: 100 });
    });
    zone.on('pointerout', () => {
      drawBtn(colorNormal);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    zone.on('pointerdown', callback);
    return { bg, txt, zone };
  }

  showHelp() {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRoundedRect(W / 2 - 280, H / 2 - 200, 560, 400, 16);

    const helpText = [
      '🏹 HOW TO PLAY',
      '',
      '• Drag backward from your archer to aim',
      '• Release to shoot — further drag = more power',
      '• HEAD SHOT = Instant Kill  💀',
      '• HELMET HIT = Helmet flies off (0 damage)',
      '• BODY HIT = 30 HP damage + knockback',
      '• ARM HIT = Enemy drops bow (disarmed!)',
      '',
      '🍎 Shoot apples for bonuses:',
      '   Red = +30 HP  |  Green = +30 Stamina',
      '   Gold = Full HP + Extra Life ✨',
      '',
      '⚡ Hold aim drains Stamina — watch the bar!',
    ].join('\n');

    const ht = this.add.text(W / 2, H / 2, helpText, {
      fontSize: '15px', color: '#ffffff', fontFamily: 'Segoe UI',
      lineSpacing: 6, align: 'left',
    }).setOrigin(0.5);

    const closeZone = this.add.zone(W / 2, H / 2, 560, 400).setInteractive();
    closeZone.once('pointerdown', () => {
      overlay.destroy();
      ht.destroy();
      closeZone.destroy();
    });
  }
}
