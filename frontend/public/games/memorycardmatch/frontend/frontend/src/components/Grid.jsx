/* eslint-disable react/prop-types */
import Card from './Card';

export default function Grid({ cards, flippedCards, matchedCards, revealAll, onCardClick }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-fit mx-auto p-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
          // Check if this specific card is currently flipped
          isFlipped={revealAll || flippedCards.some((flipped) => flipped.id === card.id)}
          // Check if this card's icon name is already matched
          isMatched={matchedCards.includes(card.name)}
        />
      ))}
    </div>
  );
}