import React, { useState, useEffect } from 'react';
import useSaveScrollOnUnmount from './components/useSaveScrollOnUnmount';
import FighterCard from './FighterCard';
import Loading from './components/Loading';

// Utility function to sanitize names
const sanitizeName = (firstName = '', lastName = '') => {
  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['-]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  return fullName;
};

function FighterList() {
  useSaveScrollOnUnmount();
  const [fighters, setFighters] = useState([]);
  const [filteredFighters, setFilteredFighters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

const apiUrl = '/api/fighters';

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const uniqueFighters = [];
        const namesSet = new Set();

        data.forEach((fighter) => {
          const fullName = `${fighter.FirstName} ${fighter.LastName}`;
          if (!namesSet.has(fullName)) {
            namesSet.add(fullName);
            uniqueFighters.push(fighter);
          }
        });

        setFighters(uniqueFighters);
        setFilteredFighters(uniqueFighters);
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  // Real-time filtering
  useEffect(() => {
    const sanitizedTerm = sanitizeName(searchTerm);

    const filtered = fighters.filter((fighter) => {
      const fullName = sanitizeName(fighter.FirstName, fighter.LastName);
      return fullName.includes(sanitizedTerm);
    });

    setFilteredFighters(filtered);
  }, [searchTerm, fighters]);

  const handleSort = (e) => {
    const sortType = e.target.value;
    setSortBy(sortType);

    let sortedFighters = [...filteredFighters]; // Sort the filtered list
    switch (sortType) {
      case 'alphabetical':
        sortedFighters.sort((a, b) => a.LastName.localeCompare(b.LastName));
        break;
      case 'mostWins':
        sortedFighters.sort((a, b) => b.Wins - a.Wins);
        break;
      case 'mostLosses':
        sortedFighters.sort((a, b) => b.Losses - a.Losses);
        break;
      default:
        break;
    }

    setFilteredFighters(sortedFighters);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search fighters"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
          >
            &times;
          </button>
        )}
      </div>

      <select value={sortBy} onChange={handleSort}>
        <option value="">Sort by</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="mostWins">Most Wins</option>
        <option value="mostLosses">Most Losses</option>
      </select>

      <div className="fighter-list">
        {filteredFighters.map((fighter) => (
          <FighterCard key={fighter.FighterId} fighter={fighter} />
        ))}
      </div>
    </div>
  );
}

export default FighterList;
