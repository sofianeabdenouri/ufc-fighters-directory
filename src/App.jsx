import React, { useState, useEffect } from 'react';
import FighterCard from './components/FighterCard';
import '../styles.css'; // Ensure your styles file is correctly imported

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

    // Fetch fighters and remove duplicates before setting the state
    useEffect(() => {
        fetch('http://127.0.0.1:5000/fighters')
            .then(response => response.json())
            .then(data => {
                // Clean up country names
                const cleanedFighters = data.map(fighter => ({
                    ...fighter,
                    country: fighter.country ? fighter.country.trim() : 'Unknown'
                }));

                // Remove duplicates by using a Set on fighter names
                const uniqueFighters = Array.from(new Set(cleanedFighters.map(fighter => fighter.name)))
                    .map(name => cleanedFighters.find(fighter => fighter.name === name));

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters);  // Initially, show all fighters
            });
    }, []);

    // Handle the search and filters
    const handleSearch = () => {
        let results = [...fighters];

        // Apply search term
        if (searchTerm) {
            results = results.filter(fighter =>
                fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply filters
        if (filters.country) {
            results = results.filter(fighter => fighter.country === filters.country);
        }

        if (filters.weightClass) {
            results = results.filter(fighter => fighter.weight_class === filters.weightClass);
        }

        if (filters.sex) {
            results = results.filter(fighter => fighter.sex === filters.sex);
        }

        // Apply sorting
        if (filters.sortBy === 'alphabetical') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filters.sortBy === 'wins') {
            results.sort((a, b) => b.wins - a.wins);
        } else if (filters.sortBy === 'losses') {
            results.sort((a, b) => b.losses - a.losses);
        } else if (filters.sortBy === 'draws') {
            results.sort((a, b) => b.draws - a.draws);
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
                    {[...new Set(fighters.map(fighter => fighter.country).filter(country => country !== 'Unknown'))].map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>

                <select name="weightClass" value={filters.weightClass} onChange={handleFilterChange}>
                    <option value="">All Weight Classes</option>
                    {[...new Set(fighters.map(fighter => fighter.weight_class))].map((weightClass) => (
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
                    <FighterCard key={fighter.fighter_id} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default App;
