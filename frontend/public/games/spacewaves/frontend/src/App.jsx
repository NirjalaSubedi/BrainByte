import React, { useState, useEffect } from 'react';
import Loading from './components/loading'; // Folder ma filename check gara (L or l)
import ModeSelection from './components/ModeSelection';
import LevelSelect from './components/LevelSelect';
import Game from './components/Game';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import './index.css';

function App() {
  //Screens: 'loading', 'menu', 'level-select', 'login', 'game', 'leaderboard'
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null); // User data store garna
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [nextAfterLogin, setNextAfterLogin] = useState('menu');

  // On mount, check if a global BrainByte user exists in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('brainbyte_user');
    if (stored) {
      // provide same shape as backend responses: { username: '...' }
      setUser({ username: stored });
    }
  }, []);

  //Menu ma 'START' thichda chalne function
  const handleStartGame = () => {
    setNextAfterLogin('game');
    if (user) {
      //Yadi user pahile nai login chha bhane direct Game ma jane
      setCurrentScreen('game');
    } else {
      //Login chaina bhane pahila Name halna pathaune
      setCurrentScreen('login');
    }
  };

  //Login success bhayepachi chalne function
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentScreen(nextAfterLogin);
    setNextAfterLogin('menu');
  };

  //Game Over pachi Menu ma jada chalne function
  const handleBackToMenu = () => {
    //User lai null pardina, so that feri login garnu naparos
    setCurrentScreen('menu');
  };

  //Logout garna man lage (Menu ko logout button bata)
  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('menu');
  };

  return (
    <div className="App">
      {/* Background Starfield*/}
      <div className="starfield-bg"></div>


      {/*Loading Screen */}
      {currentScreen === 'loading' && (
        <Loading onFinished={() => setCurrentScreen('menu')} />
      )}

      {/* Main Menu (Mode Selection) */}
      {currentScreen === 'menu' && (
        <ModeSelection
          user={user}
          onStart={handleStartGame}
          onOpenLevelSelect={() => setCurrentScreen('level-select')}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onShowLeaderboard={() => setCurrentScreen('leaderboard')}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'level-select' && (
        <LevelSelect
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onBack={() => setCurrentScreen('menu')}
          onStart={handleStartGame}
        />
      )}

      {/* Step 3: Login Screen (Only if not logged in) */}
      {currentScreen === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Step 4: Actual Game Component */}
      {currentScreen === 'game' && (
        <Game
          onGameOver={handleBackToMenu}
          initialLevel={selectedLevel}
        />
      )}

      {/* Step 5: Leaderboard Screen */}
      {currentScreen === 'leaderboard' && (
        <Leaderboard onBack={() => setCurrentScreen('menu')} />
      )}
    </div>
  );
}

export default App;