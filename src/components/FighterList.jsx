import React, { useState, useEffect } from 'react';
import FighterCard from './components/FighterCard'; // Adjust this import path

const apiKey = 'YOUR_API_KEY'; // Add your API key here
const apiUrl = `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${apiKey}`;

function FighterList() {
    const [fighters, setFighters] = useState([]);
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const [sortBy, setSortBy] = useState('');

    // Fetch data
    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Remove duplicates by keeping only 1 fighter with the same FirstName + LastName
                const uniqueFighters = [];
                const namesSet = new Set();

                data.forEach(fighter => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`;
                    if (!namesSet.has(fullName)) {
                        namesSet.add(fullName);
                        uniqueFighters.push(fighter);
                    }
                });

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters); // Initial set
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Handle search input
    const handleSearch = () => {
        const term = searchTerm.trim().toLowerCase();

        // Filter based on the search term
        const filtered = fighters.filter(fighter => {
            const fullName = `${fighter.FirstName} ${fighter.LastName}`.toLowerCase();
            return fullName.includes(term);
        });

        setFilteredFighters(filtered); // Update filtered fighters
    };

    // Handle sort
    const handleSort = (e) => {
        const sortType = e.target.value;
        setSortBy(sortType);

        let sortedFighters = [...fighters];
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

        setFilteredFighters(sortedFighters); // Update filtered list after sorting
    };

    return (
        <div>
            {/* Search Bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Capture input
                placeholder="Search fighters"
            />
            <button onClick={handleSearch}>Search</button> {/* Trigger search on button click */}

            {/* Sort Dropdown */}
            <select value={sortBy} onChange={handleSort}>
                <option value="">Sort by</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="mostWins">Most Wins</option>
                <option value="mostLosses">Most Losses</option>
            </select>

            {/* Fighter List */}
            <div className="fighter-list">
                {filteredFighters.map(fighter => (
                    <FighterCard key={fighter.FighterId} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default FighterList;
