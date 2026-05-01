import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene', active: false }); }

  create() {
    this.gameScene = this.scene.get('GameScene');

    // Make sure our HTML UI container is empty
    this.uiLayer = document.getElementById('ui-layer');
    this.uiLayer.innerHTML = `
      <div id="hud-container" class="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div class="flex flex-col gap-2">
            <div class="bg-gray-800/80 rounded-lg p-2 flex gap-1 items-center shadow-lg border border-gray-700" id="lives-container">
              <!-- Skulls injected here -->
            </div>
            <div class="bg-gray-800/80 rounded-lg px-4 py-2 text-white font-bold text-xl shadow-lg border border-gray-700">
              <span class="text-gray-400 text-sm block">SCORE</span>
              <span id="score-display" class="text-yellow-400">0</span>
            </div>
          </div>
          <div class="flex gap-4">
             <!-- Health Bar -->
             <div class="flex flex-col items-center">
               <span class="text-red-400 font-bold text-xs mb-1 drop-shadow-md">HEALTH</span>
               <div class="w-8 h-40 bg-gray-900 rounded border-2 border-gray-700 relative overflow-hidden flex flex-col-reverse shadow-inner">
                 <div id="hp-bar" class="w-full bg-red-500 h-full transition-all duration-200"></div>
               </div>
             </div>
             <!-- Stamina Bar -->
             <div class="flex flex-col items-center">
               <span class="text-blue-400 font-bold text-xs mb-1 drop-shadow-md">STAMINA</span>
               <div class="w-8 h-40 bg-gray-900 rounded border-2 border-gray-700 relative overflow-hidden flex flex-col-reverse shadow-inner">
                 <div id="stamina-bar" class="w-full bg-blue-500 h-full transition-all duration-200"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    `;

    this._updateLives(3);

    // Event listeners
    this.gameScene.events.on('hpChanged', (hp, max) => {
      const bar = document.getElementById('hp-bar');
      if (bar) bar.style.height = `${(hp / max) * 100}%`;
    });

    this.gameScene.events.on('staminaChanged', (val, max) => {
      const bar = document.getElementById('stamina-bar');
      if (bar) bar.style.height = `${(val / max) * 100}%`;
    });

    this.gameScene.events.on('livesChanged', (lives) => {
      this._updateLives(lives);
    });

    this.gameScene.events.on('scoreChanged', (score) => {
      const display = document.getElementById('score-display');
      if (display) display.innerText = score;
    });

    this.gameScene.events.on('gameOver', (data) => this._showLeaderboard(data));
  }

  _updateLives(lives) {
    const container = document.getElementById('lives-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < lives; i++) {
      container.innerHTML += `<div class="w-6 h-6 bg-white rounded-full relative shadow-md">
        <div class="absolute bg-gray-900 w-1.5 h-1.5 rounded-full left-1 top-2"></div>
        <div class="absolute bg-gray-900 w-1.5 h-1.5 rounded-full right-1 top-2"></div>
        <div class="absolute bg-white w-4 h-2 left-1 -bottom-1"></div>
      </div>`;
    }
  }

  _showLeaderboard(data) {
    // Hide HUD
    document.getElementById('hud-container').style.display = 'none';

    // Build Leaderboard modal using Tailwind
    const title = data.isWin ? 'VICTORY!' : 'GAME OVER';
    const titleColor = data.isWin ? 'text-yellow-400' : 'text-red-500';

    // Mock stats
    const wins = parseInt(localStorage.getItem('ra_wins') || '0') + (data.isWin ? 1 : 0);
    const losses = parseInt(localStorage.getItem('ra_losses') || '0') + (!data.isWin ? 1 : 0);
    
    localStorage.setItem('ra_wins', wins);
    localStorage.setItem('ra_losses', losses);

    this.uiLayer.innerHTML += `
      <div class="pointer-events-auto bg-gray-900/95 p-8 rounded-2xl shadow-2xl border-4 border-gray-700 text-center flex flex-col items-center gap-6 max-w-md w-full backdrop-blur-sm animate-fade-in">
        <h1 class="text-5xl font-black ${titleColor} drop-shadow-lg">${title}</h1>
        
        <div class="bg-gray-800 w-full rounded-xl p-4 flex flex-col gap-2 border border-gray-600 shadow-inner">
          <div class="flex justify-between items-center text-xl">
            <span class="text-gray-400 font-bold">SCORE</span>
            <span class="text-yellow-400 font-black text-2xl">${data.score}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-bold">PLAYTIME</span>
            <span class="text-white font-bold">${data.playtime}s</span>
          </div>
        </div>

        <div class="w-full flex justify-between gap-4">
          <div class="bg-gray-800 flex-1 rounded-xl p-3 border border-gray-600">
            <div class="text-green-400 text-sm font-bold">WINS</div>
            <div class="text-white text-2xl font-black">${wins}</div>
          </div>
          <div class="bg-gray-800 flex-1 rounded-xl p-3 border border-gray-600">
            <div class="text-red-400 text-sm font-bold">LOSSES</div>
            <div class="text-white text-2xl font-black">${losses}</div>
          </div>
        </div>

        <!-- Fake QR Code for mobile (using image API) -->
        <div class="bg-white p-2 rounded-lg mt-2">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://brainbyte.game" alt="QR Code" width="120" height="120" class="rounded">
           <p class="text-xs text-gray-800 font-bold mt-1">SCAN TO PLAY ON MOBILE</p>
        </div>

        <button id="btn-restart" class="w-full mt-4 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white text-2xl font-black py-4 rounded-xl shadow-lg border-b-4 border-green-800 transition-transform active:scale-95 active:border-b-0 active:translate-y-1">
          PLAY AGAIN
        </button>
      </div>
    `;

    document.getElementById('btn-restart').onclick = () => {
      this.uiLayer.innerHTML = '';
      this.scene.stop('GameScene');
      this.scene.start('BootScene');
    };
  }
}
