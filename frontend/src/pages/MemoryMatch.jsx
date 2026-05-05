import React from 'react';

const MemoryMatch = () => {
  return (
    <main className="min-h-screen bg-[#060614] text-white p-6 md:p-10 flex items-center justify-center">
      <section className="max-w-xl w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.35em] mb-4">Memory Match</p>
        <h1 className="text-4xl font-black mb-4">Standalone memory game</h1>
        <p className="text-gray-300 mb-8">
          Open the dashboard card to launch the new Memory Card Match game that lives under the nested Vite app.
        </p>
        <a
          href="/games/memorycardmatch/frontend/dist/index.html"
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[#060614]"
        >
          Open Game
        </a>
      </section>
    </main>
  )
}

export default MemoryMatch
