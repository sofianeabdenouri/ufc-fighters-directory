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

    // Fetch fighters and process the data
    useEffect(() => {
        fetch('https://mmafightcardsapi.adaptable.app/')
            .then(response => response.json())
            .then(responseData => {
                console.log('API Response:', responseData); // Debugging: Log the API response
                
                const data = responseData.data; // Access the nested 'data' array

                const extractedFighters = [];

                // Process the data array to extract fighters
                data.forEach(event => {
                    event.fights.forEach(fight => {
                        extractedFighters.push(fight.fighterA);
                        extractedFighters.push(fight.fighterB);
                    });
                });

                // Remove duplicates
                const uniqueFighters = Array.from(new Set(extractedFighters.map(fighter => fighter.name)))
                    .map(name => extractedFighters.find(fighter => fighter.name === name));

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
                    {[...new Set(fighters.map(fighter => fighter.country))].map((country) => (
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
                    <FighterCard key={fighter.name} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default App;
