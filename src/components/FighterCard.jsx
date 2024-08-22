import React from 'react';

function FighterCard({ fighter }) {
  // Build the image path
  const imagePath = `/src/assets/fighter_images/${fighter.name.replace(/\s+/g, '_')}.jpg`;

  // Split the record and assign wins, losses, draws
  const [wins, losses, draws] = fighter.record.split(' - ');

  return (
    <div className="fighter-card">
      <h2>{fighter.name}</h2>
      <p>{fighter.weight_class}</p>
      <div className="record">
        <span className="wins">{wins}</span>
        <span className="separator">-</span>
        <span className="losses">{losses}</span>
        <span className="separator">-</span>
        <span className="draws">{draws}</span>
      </div>
      <img
        className="fighter-image"
        src={imagePath}
        alt={fighter.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/src/assets/fighter_images/default_image.png'; // Fallback image
        }}
      />
    </div>
  );
}

export default FighterCard;
