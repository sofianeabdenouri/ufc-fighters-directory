import React, { useEffect, useState } from 'react';
import FighterCard from './FighterCard';

function FighterList() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://mmafightcardsapi.adaptable.app/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);  // Debugging to see the data structure

        // Extract fighters from the data
        const extractedFighters = [];
        data.forEach(event => {
          event.fights.forEach(fight => {
            extractedFighters.push(fight.fighterA);
            extractedFighters.push(fight.fighterB);
          });
        });

        // Remove duplicates based on the fighter's name
        const uniqueFighters = Array.from(new Set(extractedFighters.map(fighter => fighter.name)))
          .map(name => extractedFighters.find(fighter => fighter.name === name));

        setFighters(uniqueFighters);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Fighters</h1>
      <div className="fighter-list">
        {fighters.map((fighter, index) => (
          <FighterCard key={index} fighter={fighter} />
        ))}
      </div>
    </div>
  );
}

export default FighterList;
