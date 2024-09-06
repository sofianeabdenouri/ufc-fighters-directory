import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import './App.css'; // Ensure your styles file is correctly imported

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [selectedWeightClasses, setSelectedWeightClasses] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [favorites, setFavorites] = useState([]);
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
            .catch((error) => console.error('Error fetching data:', error));
    }, []);
    
    
    const handleSort = (results) => {
        let sortedFighters = [...results];

        switch (sortBy) {
            case 'alphabetical':
                sortedFighters.sort((a, b) => {
                    const lastNameCompare = a.LastName?.toLowerCase().localeCompare(b.LastName?.toLowerCase());
                    if (lastNameCompare === 0) {
                        return a.FirstName?.toLowerCase().localeCompare(b.FirstName?.toLowerCase());
                    }
                    return lastNameCompare;
                });
                break;
            case 'mostWins':
                sortedFighters.sort((a, b) => b.Wins - a.Wins);
                break;
            case 'mostLosses':
                sortedFighters.sort((a, b) => b.Losses - a.Losses);
                break;
            case 'mostDraws':
                sortedFighters.sort((a, b) => b.Draws - a.Draws);
                break;
            case 'mostKOs':
                sortedFighters.sort((a, b) => b.TechnicalKnockouts - a.TechnicalKnockouts);
                break;
            case 'mostSubs':
                sortedFighters.sort((a, b) => b.Submissions - a.Submissions);
                break;
            case 'favorites': // New case for sorting by favorites
                sortedFighters = sortedFighters.filter(fighter => favorites.includes(fighter.FighterId));
                break;
            default:
                return results;
        }

        return sortedFighters;
    };

    const handleSearch = () => {
        let results = fighters;
        const normalizedSearchTerm = sanitizeNameForImage(searchTerm.trim());
    
        if (normalizedSearchTerm) {
            results = fighters.filter((fighter) => {
                const sanitizedFullName = sanitizeNameForImage(fighter.FirstName, fighter.LastName);
                return sanitizedFullName.includes(normalizedSearchTerm);
            });
        }
    
        if (selectedWeightClasses.length > 0) {
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
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="app">
                            <Header scrollToFighters={scrollToFighters} />

                            <h1 className="font-h1">UFC Records</h1>
                            <h5 className="description">Live up-to-date records for every fighter</h5>
                            <div className="search-container">
    <div className="search-input-wrapper">
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search fighters"
        />
        {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
                &times;
            </button>
        )}
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