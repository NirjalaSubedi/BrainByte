/* eslint-disable react/prop-types */
export default function Card({ card, onClick, isFlipped, isMatched }) {
  return (
    <div 
      className={`relative w-24 h-24 cursor-pointer transition-all duration-500 [transform-style:preserve-3d] ${isFlipped || isMatched ? '[transform:rotateY(180deg)]' : ''}`}
      onClick={() => !isFlipped && !isMatched && onClick(card)}
    >
      {/* Back Side (The Hidden Side) */}
      <div className="absolute inset-0 bg-slate-700 rounded-xl flex items-center justify-center text-orange-300 text-2xl font-bold [backface-visibility:hidden] border border-orange-500/20">
        ?
      </div>

      {/* Front Side (The Icon Side) */}
      <div className="absolute inset-0 rounded-xl overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]">
        <img
          src={card.image}
          alt={card.name}
          className="absolute inset-0 h-full w-full object-cover select-none"
          draggable="false"
        />
      </div>
    </div>
  );
}