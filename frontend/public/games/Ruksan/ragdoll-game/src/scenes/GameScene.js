import Phaser from 'phaser';
import Arrow from '../entities/Arrow.js';
import Fruit from '../entities/Apple.js';
import RagdollBuilder from '../systems/RagdollBuilder.js';
import SoundFX from '../systems/SoundFX.js';

const MAX_HP = 100, MAX_ST = 100;
const ST_DRAIN = 12, ST_REGEN = 18;
const MAX_DRAG = 150, MIN_POW = 5, MAX_POW = 28;

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    SoundFX.init();
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.hp = MAX_HP; this.st = MAX_ST;
    this.playerScore = 0; this.enemyScore = 0;
    this.currentRound = 1;
    this.aiming = false; this.dragX = 0; this.dragY = 0;
    this.arrows = []; this.enemies = []; this.fruits = [];
    this.playerDead = false; this.gameOver = false;

    this.matter.world.setGravity(0, 1.8);
    this.isPaused = false;
    this._buildWorld();
    this._buildPlayer();
    this._spawnEnemy();
    this._setupInput();
    this._setupCollisions();
    this._startFruitTimer();
    this._startEnemyAI();

    // Menu logic
    window.startGame = () => {
      this.isStarted = true;
      this.scene.resume();
    };
    
    // Start game paused (waiting for menu)
    this.scene.pause();
    this.isStarted = false;

    // Pause game when mouse leaves window
    const pauseOverlay = document.getElementById('pause-overlay');
    
    document.addEventListener('mouseleave', () => {
      if (!this.gameOver && this.isStarted) {
        this.scene.pause();
        pauseOverlay.style.display = 'flex';
      }
    });
    
    document.addEventListener('mouseenter', () => {
      if (!this.gameOver && this.isStarted) {
        this.scene.resume();
        pauseOverlay.style.display = 'none';
      }
    });
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
    // HUD
    this.add.image(40, 40, 'skull').setDepth(100).setScale(1.5);
    this.scoreText = this.add.text(70, 40, 'YOU 0 - 0 ENEMY', {fontSize:'24px',fontFamily:'Impact',color:'#fff'}).setOrigin(0,0.5).setDepth(100);
    this.roundText = this.add.text(this.W/2, 20, 'ROUND 1', {fontSize:'18px',fontFamily:'Impact',color:'#aaa'}).setOrigin(0.5,0).setDepth(100);
    // HP/ST bars on tower
    const by = this.towerY - 20;
    this.add.rectangle(this.towerX, by, 90, 16, 0x333333).setDepth(10);
    this.hpBar = this.add.rectangle(this.towerX, by, 90, 16, 0xcc3333).setDepth(11);
    this.hpTxt = this.add.text(this.towerX, by, '100', {fontSize:'12px',fontStyle:'bold',color:'#fff',fontFamily:'Impact'}).setOrigin(0.5).setDepth(12);
    this.add.rectangle(this.towerX, by+20, 90, 16, 0x333333).setDepth(10);
    this.stBar = this.add.rectangle(this.towerX, by+20, 90, 16, 0x3366cc).setDepth(11);
    this.stTxt = this.add.text(this.towerX, by+20, '100', {fontSize:'12px',fontStyle:'bold',color:'#fff',fontFamily:'Impact'}).setOrigin(0.5).setDepth(12);
    // Jump button
    this.jumpBtn = this.add.rectangle(this.towerX, by+52, 80, 36, 0xdddddd).setDepth(10).setInteractive();
    this.add.text(this.towerX, by+45, 'JUMP', {fontSize:'12px',fontStyle:'bold',color:'#222',fontFamily:'Arial'}).setOrigin(0.5).setDepth(12);
    this.add.text(this.towerX, by+59, '5 STAMINA', {fontSize:'9px',fontStyle:'bold',color:'#3366cc',fontFamily:'Arial'}).setOrigin(0.5).setDepth(12);
    this.jumpBtn.on('pointerdown', () => {
      if (this.st >= 5 && !this.playerDead) {
        this.st -= 5;
        this.matter.applyForce(this.pRag.parts.torso.body, this.pRag.parts.torso.body.position, {x:0,y:-0.1});
      }
    });
    // Bow string graphics
    this.bowGfx = this.add.graphics().setDepth(7);
    // Trajectory dots — more dots for smoother line
    this.trajDots = [];
    for (let i=0;i<20;i++) this.trajDots.push(this.add.circle(0,0,2.5,0xffffff,0.8).setAlpha(0).setDepth(20));
    
    // Aim base visual - fixed on left side
    this.aimBaseBox = this.add.rectangle(this.towerX + 20, this.towerY - 240, 140, 140, 0xffffff, 0.05).setDepth(-1).setVisible(false);
    
    // Timer text & mock Leaderboard
    this.timerText = this.add.text(this.W/2, 50, '00:00.000', {
      fontSize: '28px', fontFamily: 'Impact', color: '#ffffff'
    }).setOrigin(0.5).setDepth(200);
  }

  // ═══════════ PLAYER ═══════════
  _buildPlayer() {
    const px = this.towerX, py = this.towerY - 233;
    this.pRag = RagdollBuilder.build(this, px, py, {isPlayer:true});
    this.bow = this.add.image(px+20, py-10, 'bow').setDepth(5).setScale(1.8);
  }

  // ═══════════ ENEMY ═══════════
  _spawnEnemy() {
    const r = this.currentRound;
    const ex = Phaser.Math.Between(this.W*0.45, this.W*0.75);
    const ey = Phaser.Math.Between(this.H*0.3, this.H*0.65);
    // platform blocks
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
    const eBow = this.add.image(ex-20, ey-30, 'bow').setDepth(5).setScale(1.8).setFlipX(true);
    this.enemies.push({rag, hp:maxHp, maxHp, dead:false, hasHelmet:true, round:r, accMod:1, blocks, hpBg, hpFill, bow:eBow});
  }

  // ═══════════ INPUT ═══════════
  _setupInput() {
    this.input.on('pointerdown', p => {
      if (this.gameOver||this.playerDead) return;
      // skip jump btn area
      if (Math.abs(p.x-this.towerX)<50 && Math.abs(p.y-this.jumpBtn.y)<25) return;
      this.aiming = true;
      this.aimOrigin = {x:p.x, y:p.y};
    });
    this.input.on('pointermove', p => {
      if (!this.aiming || this.isPaused) return;
      // Drag back to shoot forward. Clamp X >= 0 restricts to 90 degrees forward.
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
    const type = this.nextArrowBomb ? 'bomb' : 'player';
    this.arrows.push(new Arrow(this, t.x+44, t.y-14, Math.cos(angle)*power, Math.sin(angle)*power, type));
    this.nextArrowBomb = false;
    this.dragX = 0; this.dragY = 0;
  }

  // ═══════════ ENEMY AI ═══════════
  _startEnemyAI() {
    if (this._aiTimer) this._aiTimer.remove();
    const delay = Math.max(1200, 3200 - (this.currentRound-1)*400); // Faster, more competitive
    this._aiTimer = this.time.addEvent({delay, loop:true, callback:this._enemyShoot, callbackScope:this});
  }

  _enemyShoot() {
    if (this.gameOver||this.playerDead) return;
    const alive = this.enemies.filter(e=>!e.dead);
    if (!alive.length || !this.pRag) return;
    const e = Phaser.Utils.Array.GetRandom(alive);
    const ex = e.rag.parts.torso.x, ey = e.rag.parts.torso.y;
    const px = this.pRag.parts.torso.x, py = this.pRag.parts.torso.y;
    
    // Smarter enemy: sometimes dodge/jump before shooting
    if (Math.random() < 0.4) {
      this.matter.applyForce(e.rag.parts.torso.body, e.rag.parts.torso.body.position, {x: (Math.random()-0.5)*0.05, y: -0.15});
    }

    const speed = 14 + e.round*0.6;
    const dist = Phaser.Math.Distance.Between(ex,ey, px,py);
    const timeToHit = dist / speed;
    const drop = 0.5 * 1.8 * (timeToHit * timeToHit) * 0.55; // Tuned drop compensation
    const angle = Math.atan2(py-ey-drop, px-ex);
    const spread = (Math.random()-0.5) * Math.max(0.01, 0.12 - e.round*0.015) * e.accMod;
    const isBomb = e.round>=4 && Math.random()<0.25;
    const count = e.round>=4 ? (e.round>=6 ? 5 : 3) : 1;
    for (let i=0;i<count;i++) {
      const off = (i-Math.floor(count/2))*0.08;
      this.arrows.push(new Arrow(this, ex-32, ey-14, Math.cos(angle+spread+off)*speed, Math.sin(angle+spread+off)*speed, 'enemy', isBomb));
    }
    // Rotate enemy bow to aim
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
      this.time.delayedCall(Phaser.Math.Between(15000, 25000), spawn); // Slower spawn
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
        // arrow-to-arrow deflection
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
      if (this.hpTxt) { this.hpTxt.setText(Math.round(this.hp).toString()); this.hpBar.width = (this.hp/100)*90; }
    } else if (d.reward === 'stamina') {
      this.st = Math.min(100, this.st + d.amount);
    } else if (d.reward === 'extra') {
      this.lives++;
      this.livesText.setText(this.lives.toString());
    } else if (d.reward === 'bomb') {
      this.nextArrowBomb = true;
    }
  }

  _arrowHit(arrowRef, other) {
    if (!arrowRef || arrowRef.dead || arrowRef.stuck) return;
    // Fruit hit
    if (other.getData && other.getData('isFruit')) {
      const fr = other.getData('fruitRef');
      if (fr && !fr.dead) {
        const reward = fr.collect();
        if (reward) this._applyReward(reward);
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
    SoundFX.play('hit');
    let dmg = 0, headshot = false;

    // Helmet zone or head with helmet: knock helmet off first
    if (zone === 'helmet' || (zone === 'head' && e.hasHelmet)) {
      e.hasHelmet = false;
      this._popHelmet(e);
      SoundFX.play('clank');
      this._floatDmg(part.x, part.y - 15, 0, false, 'HELMET OFF!');
      this._knockback(part, arrow.image.body.velocity.x > 0 ? 1 : -1);
      return;
    }

    // Head without helmet = instant kill
    if (zone === 'head') {
      dmg = 9999; headshot = true;
      SoundFX.play('clank');
    }
    // Body shot
    else if (zone === 'body') {
      dmg = 35;
    }
    // Arm shot — reduces enemy accuracy
    else if (zone === 'arm') {
      dmg = 20;
      e.accMod = 3;
    }
    // Leg shot — makes enemy limp
    else if (zone === 'leg') {
      dmg = 25;
      // Loosen knee constraints for limp effect
      e.rag.constraints.forEach(c => {
        try {
          const tL = e.rag.parts.thighL.body, tR = e.rag.parts.thighR.body;
          if (c.bodyA === tL || c.bodyB === tL || c.bodyA === tR || c.bodyB === tR) {
            c.stiffness = 0.12;
          }
        } catch(_){}
      });
    }

    // Bomb arrow instant kill / max damage
    if (arrow.type === 'bomb') {
      dmg = 9999;
    }

    // Permanent red tint for realism visual damage
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
    this.scoreText.setText(`YOU ${this.playerScore} - ${this.enemyScore} ENEMY`);
    RagdollBuilder.flop(this, e.rag);
    if (e.hpBg) e.hpBg.destroy(); if (e.hpFill) e.hpFill.destroy(); if (e.bow) e.bow.destroy();
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
    SoundFX.play('hit');
    const dmg = zone==='head'?70 : zone==='body'?25 : 12;
    this.hp = Math.max(0, this.hp-dmg);
    part.setTint(0xff4444);
    this._floatDmg(part.x, part.y-15, dmg, zone==='head');
    this._knockback(part, arrow.image.body.velocity.x>0?1:-1);
    if (this.hp<=0) this._playerDie();
  }

  _playerDie() {
    if (this.playerDead) return;
    this.playerDead = true; 
    this.enemyScore++;
    this.scoreText.setText(`YOU ${this.playerScore} - ${this.enemyScore} ENEMY`);
    RagdollBuilder.flop(this, this.pRag);
    this.bowGfx.clear();
    this.time.delayedCall(2500, () => this._checkRoundEnd());
  }

  _respawn() {
    RagdollBuilder.destroy(this, this.pRag);
    if (this.bow) this.bow.destroy();
    this.hp = MAX_HP; this.playerDead = false;
    this._buildPlayer();
  }

  _checkRoundEnd() {
    if (this.gameOver) return;
    if (this.playerScore >= 4 || this.enemyScore >= 4 || this.currentRound >= 6) {
      this.gameOver = true;
      this._showWinScreen();
      return;
    }
    this._nextRound();
  }

  _nextRound() {
    this.currentRound++;
    this.roundText.setText(`ROUND ${this.currentRound}`);
    if (this.playerDead) this._respawn();
    this._spawnEnemy();
    this._startEnemyAI();
  }

  _showWinScreen() {
    const o = this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.8).setDepth(200);
    let msg = 'DRAW!'; let col = '#aaaaaa';
    if (this.playerScore > this.enemyScore) { msg = 'YOU WIN!'; col = '#00ffaa'; }
    else if (this.enemyScore > this.playerScore) { msg = 'ENEMY WINS!'; col = '#ff4444'; }
    this.add.text(this.W/2,this.H/2-40,msg,{fontSize:'54px',fontFamily:'Impact',color:col}).setOrigin(0.5).setDepth(201);
    this.add.text(this.W/2,this.H/2+10,`Final Score: ${this.playerScore} - ${this.enemyScore}`,{fontSize:'24px',fontFamily:'Arial',color:'#fff'}).setOrigin(0.5).setDepth(201);
    const r = this.add.text(this.W/2,this.H/2+60,'TAP TO RESTART',{fontSize:'20px',fontFamily:'Arial',color:'#aaa'}).setOrigin(0.5).setDepth(201);
    this.tweens.add({targets:r,alpha:0.3,yoyo:true,repeat:-1,duration:600});
    this.input.once('pointerdown', ()=>this.scene.restart());
  }

  _showGameOver() {
    const o = this.add.rectangle(this.W/2,this.H/2,this.W,this.H,0x000000,0.7).setDepth(200);
    this.add.text(this.W/2,this.H/2-30,'GAME OVER',{fontSize:'48px',fontFamily:'Impact',color:'#ff4444'}).setOrigin(0.5).setDepth(201);
    const r = this.add.text(this.W/2,this.H/2+30,'TAP TO RESTART',{fontSize:'20px',fontFamily:'Arial',color:'#aaa'}).setOrigin(0.5).setDepth(201);
    this.tweens.add({targets:r,alpha:0.3,yoyo:true,repeat:-1,duration:600});
    this.input.once('pointerdown', ()=>this.scene.restart());
  }

  // ═══════════ HELPERS ═══════════
  _applyReward(d) {
    if (d.reward==='hp') this.hp = Math.min(MAX_HP, this.hp+d.amount);
    else if (d.reward==='stamina') this.st = Math.min(MAX_ST, this.st+d.amount);
    // extra life reward isn't helpful in round based, so we just restore hp
    else if (d.reward==='extra') { this.hp=MAX_HP; }
  }

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
      pull = ratio * 35; // pulls back more into character

      // Show aim base box (fixed on left) and rotate it
      this.aimBaseBox.setVisible(true).setRotation(angle);
    } else { 
      this.aimBaseBox.setVisible(false);
    }

    // Position bow at the player's front hand
    const bowX = fArmL.x + Math.cos(fArmL.rotation + Math.PI/2) * 19.8;
    const bowY = fArmL.y + Math.sin(fArmL.rotation + Math.PI/2) * 19.8;
    const bowAngle = fArmL.rotation + Math.PI/2;
    this.bow.setPosition(bowX, bowY).setRotation(bowAngle);

    // Draw bowstring
    this.bowGfx.clear();
    this.bowGfx.lineStyle(2, 0xcccccc);
    const stringR = 27; // radius along bow curve
    const topX = bowX + Math.cos(bowAngle - Math.PI/2) * stringR;
    const topY = bowY + Math.sin(bowAngle - Math.PI/2) * stringR;
    const botX = bowX + Math.cos(bowAngle + Math.PI/2) * stringR;
    const botY = bowY + Math.sin(bowAngle + Math.PI/2) * stringR;
    // String pull point (where back hand grips)
    const midX = bowX - Math.cos(bowAngle) * (15 + pull * 1.8);
    const midY = bowY - Math.sin(bowAngle) * (15 + pull * 1.8);
    this.bowGfx.beginPath();
    this.bowGfx.moveTo(topX, topY);
    this.bowGfx.lineTo(midX, midY);
    this.bowGfx.lineTo(botX, botY);
    this.bowGfx.strokePath();

    // Draw nocked arrow on bow when aiming
    if (this.aiming && ratio > 0.05) {
      this.bowGfx.lineStyle(2, 0xcccccc);
      const arrowTipX = bowX + Math.cos(bowAngle) * 45;
      const arrowTipY = bowY + Math.sin(bowAngle) * 45;
      this.bowGfx.beginPath();
      this.bowGfx.moveTo(midX, midY);
      this.bowGfx.lineTo(arrowTipX, arrowTipY);
      this.bowGfx.strokePath();
      // Arrowhead
      const headLen = 6;
      const ha1 = bowAngle + 2.6, ha2 = bowAngle - 2.6;
      this.bowGfx.fillStyle(0xdddddd);
      this.bowGfx.fillTriangle(
        arrowTipX, arrowTipY,
        arrowTipX + Math.cos(ha1)*headLen, arrowTipY + Math.sin(ha1)*headLen,
        arrowTipX + Math.cos(ha2)*headLen, arrowTipY + Math.sin(ha2)*headLen
      );
    }

    // ── IK Arms ──
    try {
      if (this.aiming) {
        this.matter.setAngularVelocity(uArmL.body, 0);
        this.matter.setAngularVelocity(uArmR.body, 0);
        this.matter.setAngularVelocity(fArmL.body, 0);
        this.matter.setAngularVelocity(fArmR.body, 0);

        // Front arm (left) — extends straight toward the bow grip
        const frontArmAngle = angle - Math.PI/2;
        uArmL.setRotation(frontArmAngle + 0.1);
        fArmL.setRotation(frontArmAngle + 0.1);

        // Back arm (right) — pulls string back toward shoulder
        const shoulderX = torso.x + 15;
        const shoulderY = torso.y - 21;
        const backAng = Math.atan2(midY - shoulderY, midX - shoulderX);
        uArmR.setRotation(backAng + Math.PI/2);
        fArmR.setRotation(backAng + Math.PI/2 + 0.3);
      }
    } catch(_){}
  }

  // ═══════════ UPDATE ═══════════
  update(time, delta) {
    if (this.gameOver || this.isPaused) return;
    const dt = delta/1000;
    
    // Timer updates
    if (this.isStarted && !this.gameOver) {
      if (!this.startTime) this.startTime = this.time.now;
      const elapsed = this.time.now - this.startTime;
      const m = Math.floor(elapsed/60000);
      const s = Math.floor((elapsed%60000)/1000);
      const ms = Math.floor(elapsed%1000);
      this.timerText.setText(`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`);
    }

    // Stamina
    if (this.aiming) {
      this.st = Math.max(0, this.st-ST_DRAIN*dt);
      if (this.st===0) { this.aiming=false; this._playerShoot(); this._hideDots(); }
    } else { this.st = Math.min(MAX_ST, this.st+ST_REGEN*dt); }
    // HP/ST bars
    this.hpBar.width = (this.hp/MAX_HP)*90; this.hpTxt.setText(Math.floor(this.hp).toString());
    this.stBar.width = (this.st/MAX_ST)*90; this.stTxt.setText(Math.floor(this.st).toString());
    // Tint player red when low HP
    if (this.pRag && !this.playerDead) {
      const tint = this.hp < 30 ? 0xff8888 : 0xffffff;
      this.pRag.parts.torso.setTint(tint);
    }
    // Arrows
    this.arrows = this.arrows.filter(a=>!a.dead);
    this.arrows.forEach(a=>a.update(dt));
    // Fruits
    this.fruits = this.fruits.filter(f=>!f.dead);
    this.fruits.forEach(f=>f.update());
    // Enemy UI
    this.enemies.forEach(e => {
      if (e.dead) return;
      if (e.hpBg) { e.hpBg.setPosition(e.rag.parts.head.x, e.rag.parts.head.y-35); e.hpFill.setPosition(e.rag.parts.head.x, e.rag.parts.head.y-35); e.hpFill.width=(e.hp/e.maxHp)*50; }
      if (e.bow && e.rag && e.rag.parts.fArmL) {
        const arm = e.rag.parts.fArmL;
        const handX = arm.x + Math.cos(arm.rotation + Math.PI/2) * 19.8;
        const handY = arm.y + Math.sin(arm.rotation + Math.PI/2) * 19.8;
        e.bow.setPosition(handX, handY).setRotation(arm.rotation + Math.PI/2 - Math.PI);
      }
    });
    // Aim visuals
    this._updateAim();
  }
}
