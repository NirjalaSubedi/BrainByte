import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import MemoryMatch from './pages/MemoryMatch';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route.startsWith('#/quiz')) return <Quiz />;
  if (route.startsWith('#/memory-match')) return <MemoryMatch />;
  return <Dashboard />;
}

export default App;