import React from 'react';

function FighterCard({ fighter }) {
  const { name, picture, country } = fighter;

  // The image URL comes directly from the API now
  const imagePath = picture || '/src/assets/fighter_images/default_image.png';

  return (
    <div className="fighter-card">
      <h2>{name}</h2>
      <p>{fighter.weight_class || 'Unknown Weight Class'}</p>
      {country && (
        <img src={country} alt="Country Flag" style={{ width: '30px', marginBottom: '10px' }} />
      )}
      <div className="record">
        <span className="wins">{fighter.record.split(' - ')[0]}</span>
        <span className="separator">-</span>
        <span className="losses">{fighter.record.split(' - ')[1]}</span>
        <span className="separator">-</span>
        <span className="draws">{fighter.record.split(' - ')[2]}</span>
      </div>
      <img
        className="fighter-image"
        src={imagePath}
        alt={name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/src/assets/fighter_images/default_image.png'; // Fallback image
        }}
      />
    </div>
  );
}

export default FighterCard;
