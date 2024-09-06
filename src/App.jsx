import React, { useState, useEffect } from 'react';
import FighterCard from './components/FighterCard';
import './App.css'; // Ensure your styles file is correctly imported

function App() {
    const [fighters, setFighters] = useState([]);
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        country: '',
        weightClass: '',
        sex: '',
        sortBy: '',
    });

    // Fetch fighters and process the data
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                // Filter out fighters with no fights or records
                const fightersWithRecords = data.filter(fighter => fighter.Wins || fighter.Losses || fighter.Draws);

                // Remove duplicates by unique Fighter ID
                const uniqueFighters = Array.from(new Set(fightersWithRecords.map(fighter => fighter.FighterId)))
                    .map(id => fightersWithRecords.find(fighter => fighter.FighterId === id));

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters); // Initially, show all fighters
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Handle the search and filters
    const handleSearch = () => {
        let results = [...fighters];

        // Apply search term
        if (searchTerm) {
            results = results.filter(fighter =>
                fighter.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fighter.LastName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply filters
        if (filters.country) {
            results = results.filter(fighter => fighter.Nationality === filters.country);
        }

        if (filters.weightClass) {
            results = results.filter(fighter => fighter.WeightClass === filters.weightClass);
        }

        if (filters.sex) {
            results = results.filter(fighter => fighter.Gender === filters.sex);
        }

        // Apply sorting
        if (filters.sortBy === 'alphabetical') {
            results.sort((a, b) => a.FirstName.localeCompare(b.FirstName));
        } else if (filters.sortBy === 'wins') {
            results.sort((a, b) => b.Wins - a.Wins);
        } else if (filters.sortBy === 'losses') {
            results.sort((a, b) => b.Losses - a.Losses);
        } else if (filters.sortBy === 'draws') {
            results.sort((a, b) => b.Draws - a.Draws);
        }

        setFilteredFighters(results);
    };

    // Update filters state when a filter is selected
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    return (
        <div className="app">
            <h1>UFC Fighters Directory</h1>
            <div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search fighters"
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="filters">
                <select name="country" value={filters.country} onChange={handleFilterChange}>
                    <option value="">All Countries</option>
                    {[...new Set(fighters.map(fighter => fighter.Nationality))].map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>

                <select name="weightClass" value={filters.weightClass} onChange={handleFilterChange}>
                    <option value="">All Weight Classes</option>
                    {[...new Set(fighters.map(fighter => fighter.WeightClass))].map((weightClass) => (
                        <option key={weightClass} value={weightClass}>{weightClass}</option>
                    ))}
                </select>

                <select name="sex" value={filters.sex} onChange={handleFilterChange}>
                    <option value="">Both</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="">Sort By</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                    <option value="wins">Most Wins</option>
                    <option value="losses">Most Losses</option>
                    <option value="draws">Most Draws</option>
                </select>
            </div>

            <div className="fighter-list">
                {filteredFighters.map(fighter => (
                    <FighterCard key={fighter.FighterId} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default App;
