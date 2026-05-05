import React from 'react';

const Quiz = () => {
  return (
    <main className="min-h-screen bg-[#060614] text-white p-6 md:p-10 flex items-center justify-center">
      <section className="max-w-xl w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.35em] mb-4">Quiz</p>
        <h1 className="text-4xl font-black mb-4">Quiz mode</h1>
        <p className="text-gray-300 mb-8">
          The quiz card stays available from the dashboard. If you want, I can turn this into a full standalone build too.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[#060614]"
        >
          Back to Dashboard
        </a>
      </section>
    </main>
  )
}

export default Quiz
