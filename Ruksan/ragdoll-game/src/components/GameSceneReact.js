import Phaser from 'phaser';
import Arrow from '../entities/Arrow.js';
import Fruit from '../entities/Apple.js';
import RagdollBuilder from '../systems/RagdollBuilder.js';
import SoundFX from '../systems/SoundFX.js';

const MAX_HP = 100, MAX_ST = 100;
const ST_DRAIN = 12, ST_REGEN = 18;
const MAX_DRAG = 150, MIN_POW = 5, MAX_POW = 28;

export default class GameSceneReact extends Phaser.Scene {
  constructor() { super('GameSceneReact'); }

  create() {
    SoundFX.init();
    if (!this.sound.getAll('bgm').length) {
      this.sound.play('bgm', { volume: 0.15, loop: true });
    }
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.hp = MAX_HP; this.st = MAX_ST;
    this.playerScore = 0; this.enemyScore = 0;
    this.currentRound = 1; this.lives = 0;
    this.aiming = false; this.dragX = 0; this.dragY = 0;
    this.arrows = []; this.enemies = []; this.fruits = [];
    this.playerDead = false; this.gameOver = false;
    
    // Get React Event Bus
    this.eb = window.__REACT_EVENT_BUS__ || {};

    this.matter.world.setGravity(0, 1.8);
    this.isPaused = false;
    this._buildWorld();
    this._buildPlayer();
    this._spawnEnemy();
    this._setupInput();
    this._setupCollisions();
    this._startFruitTimer();
    this._startEnemyAI();

    // Initial state to React
    if (this.eb.onHpChange) this.eb.onHpChange(this.hp);
    if (this.eb.onStChange) this.eb.onStChange(this.st);
    if (this.eb.onPlayerScore) this.eb.onPlayerScore(this.playerScore);
    if (this.eb.onEnemyScore) this.eb.onEnemyScore(this.enemyScore);
    if (this.eb.onRoundChange) this.eb.onRoundChange(this.currentRound);

    this.isStarted = true;
    
    // Auto-pause when mouse leaves the entire browser window
    this._handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        if (this.isStarted && !this.gameOver && !this.isPaused) {
          this._pauseGame(true);
        }
      }
    };
    
    document.addEventListener('mouseleave', this._handleMouseLeave);
    document.addEventListener('mouseenter', () => {
      if (this.isStarted && !this.gameOver && this.isPaused) {
        this._pauseGame(false);
      }
    });
  }

  _pauseGame(paused) {
    this.isPaused = paused;
    if (this.eb.onPause) this.eb.onPause(paused);
    if (paused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }
  }

  // ═══════════ WORLD ═══════════
  _buildWorld() {
    this.add.image(this.W/2, this.H/2, 'bg').setDepth(-10).setScale(2.5);
    // floor
    this.matter.add.rectangle(this.W/2, this.H+40, this.W*3, 80, {isStatic:true});
    // player tower
    this.towerX = 258; this.towerY = this.H - 170;
    this.playerTower = this.matter.add.image(this.towerX, this.towerY, 'tower', null, {isStatic:true, friction:1});
    this.playerTower.setDepth(1).setCollisionCategory(1).setCollidesWith([2,4,8,16]);

    // Jump button (invisible physics area to handle clicks, since UI is React)
    // Actually we will just add a Phaser zone or simple rect
    const by = this.towerY - 20;
    this.jumpBtn = this.add.rectangle(this.towerX, by+52, 120, 80, 0x000000, 0).setDepth(10).setInteractive();
    
    // Draw a fake jump button in Phaser so user knows where to click, or rely on instruction
    this.add.rectangle(this.towerX, by+52, 80, 36, 0xdddddd).setDepth(10);
    this.add.text(this.towerX, by+45, 'JUMP', {fontSize:'12px',fontStyle:'bold',color:'#222',fontFamily:'Arial'}).setOrigin(0.5).setDepth(12);
    this.add.text(this.towerX, by+59, '5 STAMINA', {fontSize:'9px',fontStyle:'bold',color:'#3366cc',fontFamily:'Arial'}).setOrigin(0.5).setDepth(12);

    this.jumpBtn.on('pointerdown', () => {
      if (this.st >= 5 && !this.playerDead) {
        this.st -= 5;
        if (this.eb.onStChange) this.eb.onStChange(this.st);
        this.matter.applyForce(this.pRag.parts.torso.body, this.pRag.parts.torso.body.position, {x:0,y:-0.1});
      }
    });

    // Bow string graphics
    this.bowGfx = this.add.graphics().setDepth(7);
    this.trajDots = [];
    for (let i=0;i<20;i++) this.trajDots.push(this.add.circle(0,0,2.5,0xffffff,0.8).setAlpha(0).setDepth(20));
  }

  // ═══════════ PLAYER ═══════════
  _buildPlayer() {
    const px = this.towerX, py = this.towerY - 233;
    this.pRag = RagdollBuilder.build(this, px, py, {isPlayer:true});
    this.bow = this.add.image(px+20, py-10, 'bow').setDepth(5).setScale(1.2);
  }

  // ═══════════ ENEMY ═══════════
  _spawnEnemy() {
    const r = this.currentRound;
    const ex = Phaser.Math.Between(this.W*0.45, this.W*0.75);
    const ey = Phaser.Math.Between(this.H*0.3, this.H*0.65);
    const blocks = [];
    for (let i=-1;i<=1;i++) {
      const b = this.matter.add.image(ex+i*44, ey, 'block', null, {isStatic:true, friction:1});
      b.setDepth(1).setCollisionCategory(1).setCollidesWith([2,4,8,16]);
      blocks.push(b);
    }
    const idx = Math.min(r, 6);
    const rag = RagdollBuilder.build(this, ex, ey-105, {isPlayer:false, hasHelmet:true, helmetIdx:idx});
    const maxHp = 80 + (r-1)*25;
    const hpBg = this.add.rectangle(ex, ey-140, 50, 8, 0x440000).setDepth(10);
    const hpFill = this.add.rectangle(ex, ey-140, 50, 8, 0xcc0000).setDepth(11);
    const eBow = this.add.image(ex-20, ey-30, 'bow').setDepth(5).setScale(1.2).setFlipX(true);
    this.enemies.push({rag, hp:maxHp, maxHp, dead:false, hasHelmet:true, round:r, accMod:1, blocks, hpBg, hpFill, bow:eBow});
  }

  // ═══════════ INPUT ═══════════
  _setupInput() {
    this.input.on('pointerdown', p => {
      if (this.gameOver||this.playerDead) return;
      if (Math.abs(p.x-this.towerX)<50 && Math.abs(p.y-this.jumpBtn.y)<25) return;
      this.aiming = true;
      this.aimOrigin = {x:p.x, y:p.y};
    });
    this.input.on('pointermove', p => {
      if (!this.aiming || this.isPaused) return;
      this.dragX = Phaser.Math.Clamp(this.aimOrigin.x - p.x, 0, MAX_DRAG);
      this.dragY = Phaser.Math.Clamp(this.aimOrigin.y - p.y, -MAX_DRAG, MAX_DRAG);
    });
    this.input.on('pointerup', () => {
      if (!this.aiming) return;
      this.aiming = false;
      this._playerShoot();
    });
  }

  _playerShoot() {
    if (this.playerDead || !this.pRag) return;
    const mag = Math.sqrt(this.dragX**2 + this.dragY**2);
    const ratio = Math.min(1, mag/MAX_DRAG);
    if (ratio < 0.06) return;
    const power = MIN_POW + ratio*(MAX_POW-MIN_POW);
    const angle = Math.atan2(this.dragY, this.dragX);
    const t = this.pRag.parts.torso;
    const isBomb = this.nextArrowBomb;
    this.arrows.push(new Arrow(this, t.x+44, t.y-14, Math.cos(angle)*power, Math.sin(angle)*power, 'player', isBomb));
    this.nextArrowBomb = false;
    this.dragX = 0; this.dragY = 0;
  }

  // ═══════════ ENEMY AI ═══════════
  _startEnemyAI() {
    if (this._aiTimer) this._aiTimer.remove();
    // Moderate level: slower shots, easier start
    const delay = Math.max(2000, 3500 - (this.currentRound-1)*250);
    this._aiTimer = this.time.addEvent({delay, loop:true, callback:this._enemyShoot, callbackScope:this});
  }

  _enemyShoot() {
    if (this.gameOver||this.playerDead) return;
    const alive = this.enemies.filter(e=>!e.dead);
    if (!alive.length || !this.pRag) return;
    const e = Phaser.Utils.Array.GetRandom(alive);
    const ex = e.rag.parts.torso.x, ey = e.rag.parts.torso.y;
    // Pick a random body part to target instead of always the torso
    const targetParts = [
      this.pRag.parts.head, 
      this.pRag.parts.torso, 
      this.pRag.parts.thighL, 
      this.pRag.parts.thighR
    ];
    const targetPart = Phaser.Utils.Array.GetRandom(targetParts);
    const px = targetPart.x || this.pRag.parts.torso.x;
    const py = targetPart.y || this.pRag.parts.torso.y;
    
    if (Math.random() < 0.4) {
      this.matter.applyForce(e.rag.parts.torso.body, e.rag.parts.torso.body.position, {x: (Math.random()-0.5)*0.08, y: -0.2});
    }

    // Vary the speed slightly less for a more predictable (moderate) arc
    const speed = Phaser.Math.FloatBetween(13, 18) + e.round*0.5; 
    const dist = Phaser.Math.Distance.Between(ex,ey, px,py);
    const timeToHit = dist / speed;
    const drop = 0.5 * 1.8 * (timeToHit * timeToHit) * 0.55; 
    const angle = Math.atan2(py-ey-drop, px-ex);
    
    // Increased spread (less accuracy) for moderate difficulty
    const spread = (Math.random()-0.5) * Math.max(0.02, 0.12 - e.round*0.015) * e.accMod;
    
    const isBomb = e.round>=3 && Math.random()<0.15;
    // Multi-arrows start later (round 3) and max at 2 for moderate level
    const count = e.round>=3 ? (e.round>=5 ? 3 : 2) : 1;
    
    for (let i=0;i<count;i++) {
      const off = (i-Math.floor(count/2))*0.06;
      this.arrows.push(new Arrow(this, ex-32, ey-14, Math.cos(angle+spread+off)*speed, Math.sin(angle+spread+off)*speed, 'enemy', isBomb));
    }
    try { 
      e.rag.parts.uArmL.setRotation(angle + Math.PI/2); 
      e.rag.parts.fArmL.setRotation(angle + Math.PI/2); 
    } catch(_){}
  }

  // ═══════════ FRUITS ═══════════
  _startFruitTimer() {
    const spawn = () => {
      if (this.gameOver) return;
      const count = Phaser.Math.Between(1, 2);
      for (let i = 0; i < count; i++) {
        setTimeout(() => { if (!this.gameOver) this.fruits.push(new Fruit(this)); }, i * 600);
      }
      this.time.delayedCall(Phaser.Math.Between(15000, 25000), spawn);
    };
    this.time.delayedCall(8000, spawn);
  }

  // ═══════════ COLLISIONS ═══════════
  _setupCollisions() {
    this.matter.world.on('collisionstart', ev => {
      ev.pairs.forEach(pair => {
        const a = pair.bodyA.gameObject, b = pair.bodyB.gameObject;
        if (!a||!b) return;
        const arA = a.getData && a.getData('isArrow');
        const arB = b.getData && b.getData('isArrow');
        if (arA && arB) {
          const rA = a.getData('arrowRef'), rB = b.getData('arrowRef');
          if (rA && rB && rA.owner !== rB.owner) { rA.deflect(rB); rB.deflect(rA); }
          return;
        }
        if (arA) this._arrowHit(a.getData('arrowRef'), b);
        else if (arB) this._arrowHit(b.getData('arrowRef'), a);
      });
    });
  }

  _applyReward(d) {
    if (d.reward === 'hp') {
      this.hp = Math.min(100, (this.hp || 100) + d.amount);
      if (this.eb.onHpChange) this.eb.onHpChange(this.hp);
    } else if (d.reward === 'stamina') {
      this.st = Math.min(100, this.st + d.amount);
      if (this.eb.onStChange) this.eb.onStChange(this.st);
    } else if (d.reward === 'extra') {
      this.lives++;
    } else if (d.reward === 'bomb') {
      this.nextArrowBomb = true;
    }
  }

  _arrowHit(arrowRef, other) {
    if (!arrowRef || arrowRef.dead || arrowRef.stuck) return;
    if (other.getData && other.getData('isFruit')) {
      const fr = other.getData('fruitRef');
      if (fr && !fr.dead) {
        const reward = fr.collect();
        // Only give reward if the player hit the apple
        if (reward && arrowRef.owner === 'player') this._applyReward(reward);
      }
      arrowRef.stick(other);
      return;
    }
    const zone = other.getData && other.getData('zone');
    if (!zone) { arrowRef.stick(other); return; }
    if (arrowRef.owner === 'player') {
      const enemy = this.enemies.find(e => !e.dead && e.rag.allBodies.includes(other));
      if (enemy) this._hitEnemy(enemy, zone, arrowRef, other);
    } else {
      if (this.pRag && this.pRag.allBodies.includes(other)) this._hitPlayer(zone, arrowRef, other);
    }
    arrowRef.stick(other);
  }

  // ═══════════ HIT LOGIC ═══════════
  _hitEnemy(e, zone, arrow, part) {
    let dmg = 0, headshot = false;

    if (zone === 'helmet' || (zone === 'head' && e.hasHelmet)) {
      e.hasHelmet = false;
      this._popHelmet(e);
      SoundFX.play('clank');
      this._floatDmg(part.x, part.y - 15, 0, false, 'HELMET OFF!');
      this._knockback(part, arrow.image.body.velocity.x > 0 ? 1 : -1);
      return;
    }

    if (zone === 'head') {
      dmg = 9999; headshot = true;
      this.sound.play('headshot');
    }
    else if (zone === 'body') { dmg = 35; }
    else if (zone === 'arm') { dmg = 20; e.accMod = 3; }
    else if (zone === 'leg') {
      dmg = 25;
      e.rag.constraints.forEach(c => {
        try {
          const tL = e.rag.parts.thighL.body, tR = e.rag.parts.thighR.body;
          if (c.bodyA === tL || c.bodyB === tL || c.bodyA === tR || c.bodyB === tR) c.stiffness = 0.12;
        } catch(_){}
      });
    }

    if (arrow.type === 'bomb') dmg = 9999;

    if (dmg > 0 && !headshot) {
      this.sound.play('scream');
    }

    part.setTint(0xff4444);
    if (dmg > 0) this._floatDmg(part.x, part.y - 15, dmg, headshot);
    this._knockback(part, arrow.image.body.velocity.x > 0 ? 1 : -1);
    e.hp -= dmg;
    if (e.hp <= 0) this._killEnemy(e);
  }

  _popHelmet(e) {
    if (!e.rag.helmetPin) return;
    try { this.matter.world.removeConstraint(e.rag.helmetPin); e.rag.helmetPin = null; } catch(_){}
    if (e.rag.helmet) try { e.rag.helmet.setVelocity((Math.random()-0.5)*8, -7); } catch(_){}
  }

  _killEnemy(e) {
    if (e.dead) return; e.dead = true;
    this.playerScore++;
    if (this.eb.onPlayerScore) this.eb.onPlayerScore(this.playerScore);
    RagdollBuilder.flop(this, e.rag);
    
    if (e.hpBg) e.hpBg.destroy(); 
    if (e.hpFill) e.hpFill.destroy(); 
    if (e.bow) e.bow.destroy();
    if (e.bowGfx) { e.bowGfx.destroy(); e.bowGfx = null; }

    // Make the enemy's platform fall down dramatically
    e.blocks.forEach(b => { 
      try { b.setStatic(false); b.setCollisionCategory(1).setCollidesWith([1]); } catch(_) {} 
    });

    this.time.delayedCall(3500, () => {
      RagdollBuilder.destroy(this, e.rag);
      e.blocks.forEach(b => { try{b.destroy();}catch(_){} });
    });
    
    if (!this.enemies.some(en=>!en.dead)) {
      this.time.delayedCall(2000, () => this._checkRoundEnd());
    }
  }

  _hitPlayer(zone, arrow, part) {
    if (this.playerDead) return;
    const dmg = zone==='head'?70 : zone==='body'?25 : 12;
    if (zone === 'head') {
      this.sound.play('headshot');
    } else {
      this.sound.play('scream');
    }
    this.hp = Math.max(0, this.hp-dmg);
    if (this.eb.onHpChange) this.eb.onHpChange(this.hp);
    part.setTint(0xff4444);
    this._floatDmg(part.x, part.y-15, dmg, zone==='head');
    this._knockback(part, arrow.image.body.velocity.x>0?1:-1);
    if (this.hp<=0) this._playerDie();
  }

  _playerDie() {
    if (this.playerDead) return;
    this.playerDead = true; 
    this.enemyScore++;
    if (this.eb.onEnemyScore) this.eb.onEnemyScore(this.enemyScore);
    RagdollBuilder.flop(this, this.pRag);
    this.bowGfx.clear();
    this.time.delayedCall(2500, () => this._checkRoundEnd());
  }

  _respawn() {
    RagdollBuilder.destroy(this, this.pRag);
    if (this.bow) this.bow.destroy();
    this.hp = MAX_HP; this.playerDead = false;
    if (this.eb.onHpChange) this.eb.onHpChange(this.hp);
    this._buildPlayer();
  }

  _checkRoundEnd() {
    if (this.gameOver) return;
    if (this.playerScore >= 4 || this.enemyScore >= 4 || this.currentRound >= 6) {
      this.gameOver = true;
      if (this.eb.onGameOver) {
        this.sound.stopByKey('bgm');
        if (this.playerScore > this.enemyScore) {
          this.sound.play('victory');
        } else if (this.enemyScore > this.playerScore) {
          this.sound.play('defeat');
        } else {
          this.sound.play('gameover');
        }
        this.eb.onGameOver({
          playerScore: this.playerScore,
          enemyScore: this.enemyScore,
          timer: this.lastTimerStr || '00:00.000'
        });
      }
      return;
    }
    this._nextRound();
  }

  _nextRound() {
    this.currentRound++;
    if (this.eb.onRoundChange) this.eb.onRoundChange(this.currentRound);
    
    // User Request: Refill HP and Stamina every round
    this.hp = MAX_HP;
    this.st = MAX_ST;
    if (this.eb.onHpChange) this.eb.onHpChange(this.hp);
    if (this.eb.onStChange) this.eb.onStChange(this.st);
    
    // Destroy all existing arrows
    this.arrows.forEach(a => a.destroy());
    this.arrows = [];

    // Ensure only one enemy by destroying previous ones and clearing array
    this.enemies.forEach(e => {
      RagdollBuilder.destroy(this, e.rag);
      if (e.blocks) e.blocks.forEach(b => { try { b.destroy(); } catch (_) {} });
      if (e.hpBg) e.hpBg.destroy();
      if (e.hpFill) e.hpFill.destroy();
      if (e.bow) e.bow.destroy();
      if (e.bowGfx) e.bowGfx.destroy();
    });
    this.enemies = [];
    
    // Always respawn player to clear damage tint and stuck arrows
    this._respawn();
    
    this._spawnEnemy();
    this._startEnemyAI();
  }

  // ═══════════ HELPERS ═══════════
  _floatDmg(x, y, dmg, head, customText) {
    const label = customText ? customText : (head ? 'HEADSHOT!' : `-${dmg}`);
    const color = customText ? '#ffaa00' : (head ? '#ffeb3b' : '#ff4444');
    const size = head ? '22px' : (customText ? '16px' : '18px');
    const t = this.add.text(x, y, label, {
      fontSize: size, fontStyle: 'bold',
      color: color, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({targets: t, y: y - 45, alpha: 0, duration: 1200, onComplete: () => t.destroy()});
  }

  _knockback(img, dir) {
    try { this.matter.applyForce(img.body, img.body.position, {x:dir*0.06, y:-0.03}); } catch(_){}
  }

  _hideDots() { this.trajDots.forEach(d=>d.setAlpha(0)); }

  // ═══════════ AIMING VISUALS (bow, string, arms, trajectory) ═══════════
  _updateAim() {
    if (!this.pRag || this.playerDead) { this._hideDots(); this.bowGfx.clear(); return; }
    const torso = this.pRag.parts.torso;
    const uArmL = this.pRag.parts.uArmL, uArmR = this.pRag.parts.uArmR;
    const fArmL = this.pRag.parts.fArmL, fArmR = this.pRag.parts.fArmR;
    let angle = -0.3, pull = 0, ratio = 0;

    if (this.aiming) {
      const mag = Math.sqrt(this.dragX**2+this.dragY**2);
      ratio = Math.min(1, mag/MAX_DRAG);
      angle = Math.atan2(this.dragY, this.dragX);
      pull = ratio * 35; 
    } 

    const bowX = fArmL.x + Math.cos(fArmL.rotation + Math.PI/2) * 19.8;
    const bowY = fArmL.y + Math.sin(fArmL.rotation + Math.PI/2) * 19.8;
    const bowAngle = fArmL.rotation + Math.PI/2;
    this.bow.setPosition(bowX, bowY).setRotation(bowAngle);

    this._drawBowstring(this.bowGfx, bowX, bowY, bowAngle, pull, ratio, true);

    // ── IK Arms ──
    try {
      if (this.aiming) {
        this.matter.setAngularVelocity(uArmL.body, 0);
        this.matter.setAngularVelocity(uArmR.body, 0);
        this.matter.setAngularVelocity(fArmL.body, 0);
        this.matter.setAngularVelocity(fArmR.body, 0);

        const frontArmAngle = angle - Math.PI/2;
        uArmL.setRotation(frontArmAngle + 0.1);
        fArmL.setRotation(frontArmAngle + 0.1);

        const shoulderX = torso.x + 15;
        const shoulderY = torso.y - 21;
        // String pull point for back arm math
        const midX = bowX - Math.cos(bowAngle) * (15 + pull * 1.8);
        const midY = bowY - Math.sin(bowAngle) * (15 + pull * 1.8);
        const backAng = Math.atan2(midY - shoulderY, midX - shoulderX);
        uArmR.setRotation(backAng + Math.PI/2);
        fArmR.setRotation(backAng + Math.PI/2 + 0.3);
      }
    } catch(_){}
  }

  _drawBowstring(gfx, bowX, bowY, bowAngle, pull, ratio, isPlayer) {
    gfx.clear();
    gfx.lineStyle(2, 0xcccccc);
    
    const stringR = 27; 
    const forwardOff = 1; 
    const topX = bowX + Math.cos(bowAngle - Math.PI/2) * stringR + Math.cos(bowAngle) * forwardOff;
    const topY = bowY + Math.sin(bowAngle - Math.PI/2) * stringR + Math.sin(bowAngle) * forwardOff;
    const botX = bowX + Math.cos(bowAngle + Math.PI/2) * stringR + Math.cos(bowAngle) * forwardOff;
    const botY = bowY + Math.sin(bowAngle + Math.PI/2) * stringR + Math.sin(bowAngle) * forwardOff;
    
    const midX = bowX - Math.cos(bowAngle) * (15 + pull * 1.8);
    const midY = bowY - Math.sin(bowAngle) * (15 + pull * 1.8);
    
    gfx.beginPath();
    gfx.moveTo(topX, topY);
    gfx.lineTo(midX, midY);
    gfx.lineTo(botX, botY);
    gfx.strokePath();

    if (isPlayer && this.aiming && ratio > 0.05) {
      gfx.lineStyle(2, 0xcccccc);
      const tipOffset = 65 - (ratio * 55); 
      const sideOffX = Math.cos(bowAngle + Math.PI/2) * 3;
      const sideOffY = Math.sin(bowAngle + Math.PI/2) * 3;

      const arrowTipX = bowX + Math.cos(bowAngle) * tipOffset + sideOffX;
      const arrowTipY = bowY + Math.sin(bowAngle) * tipOffset + sideOffY;
      
      gfx.beginPath();
      gfx.moveTo(midX + sideOffX, midY + sideOffY);
      gfx.lineTo(arrowTipX, arrowTipY);
      gfx.strokePath();
      
      const headLen = 7;
      const ha1 = bowAngle + 2.6, ha2 = bowAngle - 2.6;
      gfx.fillStyle(0xdddddd);
      gfx.fillTriangle(
        arrowTipX, arrowTipY,
        arrowTipX + Math.cos(ha1)*headLen, arrowTipY + Math.sin(ha1)*headLen,
        arrowTipX + Math.cos(ha2)*headLen, arrowTipY + Math.sin(ha2)*headLen
      );
    }
  }

  // ═══════════ UPDATE ═══════════
  update(time, delta) {
    if (this.gameOver || this.isPaused) return;
    const dt = delta/1000;
    
    if (this.isStarted && !this.gameOver) {
      if (!this.startTime) this.startTime = this.time.now;
      const elapsed = this.time.now - this.startTime;
      const m = Math.floor(elapsed/60000);
      const s = Math.floor((elapsed%60000)/1000);
      const ms = Math.floor(elapsed%1000);
      const timerStr = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`;
      if (timerStr !== this.lastTimerStr) {
        if (this.eb.onTimerUpdate) this.eb.onTimerUpdate(timerStr);
        this.lastTimerStr = timerStr;
      }
    }

    if (this.aiming) {
      this.st = Math.max(0, this.st-ST_DRAIN*dt);
      if (this.eb.onStChange) this.eb.onStChange(this.st);
      if (this.st===0) { this.aiming=false; this._playerShoot(); this._hideDots(); }
    } else { 
      const prevSt = this.st;
      this.st = Math.min(MAX_ST, this.st+ST_REGEN*dt); 
      if (Math.floor(this.st) !== Math.floor(prevSt) && this.eb.onStChange) {
        this.eb.onStChange(this.st);
      }
    }

    if (this.pRag && !this.playerDead) {
      const tint = this.hp < 30 ? 0xff8888 : 0xffffff;
      this.pRag.parts.torso.setTint(tint);
    }
    
    this.arrows = this.arrows.filter(a=>!a.dead);
    this.arrows.forEach(a=>a.update(dt));
    this.fruits = this.fruits.filter(f=>!f.dead);
    this.fruits.forEach(f=>f.update());

    this.enemies.forEach(e => {
      if (e.dead) return;
      if (e.hpBg) { e.hpBg.setPosition(e.rag.parts.head.x, e.rag.parts.head.y-35); e.hpFill.setPosition(e.rag.parts.head.x, e.rag.parts.head.y-35); e.hpFill.width=(e.hp/e.maxHp)*50; }
      if (e.bow && e.rag && e.rag.parts.fArmL) {
        const arm = e.rag.parts.fArmL;
        const handX = arm.x + Math.cos(arm.rotation + Math.PI/2) * 19.8;
        const handY = arm.y + Math.sin(arm.rotation + Math.PI/2) * 19.8;
        const bAng = arm.rotation + Math.PI/2 - Math.PI;
        e.bow.setPosition(handX, handY).setRotation(bAng);
        
        if (!e.bowGfx) e.bowGfx = this.add.graphics().setDepth(7);
        this._drawBowstring(e.bowGfx, handX, handY, bAng, 0, 0, false);
      }
    });

    this._updateAim();
  }
}
