import React, { useEffect, useState } from 'react';
import FighterCard from './FighterCard';

function FighterList() {
  const [fighters, setFighters] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/fighters')
      .then(response => response.json())
      .then(data => setFighters(data));
  }, []);

  return (
    <div>
      <h1>Fighters</h1>
      <div className="fighter-list">
        {fighters.map(fighter => (
          <FighterCard key={fighter.fighter_id} fighter={fighter} />
        ))}
      </div>
    </div>
  );
}

export default FighterList;
