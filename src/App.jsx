import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard'; // Adjust the import as necessary
import FighterProfile from './pages/fighter-profile/FighterProfile'; // Adjust import as necessary
import Header from './header/Header';
import './App.css';

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(''); // Initial state set to empty string
    const [filteredFighters, setFilteredFighters] = useState([]);

    // Fetch fighters and process the data
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                // Filter out duplicates and remove fighters with no essential stats
                const uniqueFighters = [];
                const nameSet = new Set();

                data.forEach(fighter => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`;

                    // Remove fighters with no essential data (i.e., fighters with no wins, losses, height, weight, etc.)
                    const hasRecords = 
                        fighter.Wins > 0 || 
                        fighter.Losses > 0 || 
                        fighter.Draws > 0 ||
                        fighter.Height > 0 || 
                        fighter.Weight > 0;

                    if (!nameSet.has(fullName) && hasRecords) {
                        nameSet.add(fullName);
                        uniqueFighters.push(fighter); // Add the fighter to the unique list if they have records
                    }
                });

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters); // Initialize filtered fighters
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Handle sorting logic
    const handleSort = () => {
        let sortedFighters = [...fighters];
        switch (sortBy) {
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

    // Handle search functionality
    const handleSearch = () => {
        if (searchTerm.trim() === '') {
            setFilteredFighters(fighters); // If search term is empty, show all fighters
        } else {
            const results = fighters.filter(fighter => {
                const fullName = `${fighter.FirstName || ''} ${fighter.LastName || ''}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) || 
                       (fighter.FirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (fighter.LastName || '').toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredFighters(results);
        }
    };

    // Handle pressing the "Enter" key to trigger search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(); // Trigger search when Enter is pressed
        }
    };

    return (
        <Router>
            <Header />

            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="app">
                            <h1>UFC Fighters Directory</h1>

                            <div className="search-container">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyPress} // Listen for Enter key press
                                    placeholder="Search fighters"
                                />
                                <button onClick={handleSearch}>Search</button>

                                {/* Sort Dropdown */}
                                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                                    <option value="" disabled>Sort by</option>
                                    <option value="alphabetical">Alphabetical</option>
                                    <option value="mostWins">Most Wins</option>
                                    <option value="mostLosses">Most Losses</option>
                                </select>

                                <button onClick={handleSort}>Sort</button>
                            </div>

                            <div className="fighter-list">
                                {filteredFighters.length > 0 ? (
                                    filteredFighters.map(fighter => (
                                        <FighterCard key={fighter.FighterId} fighter={fighter} />
                                    ))
                                ) : (
                                    <p>No fighters found</p> // Display message if no search results
                                )}
                            </div>
                        </div>
                    }
                />

                {/* Route for Fighter Profile */}
                <Route path="/fighter/:id" element={<FighterProfile />} />
            </Routes>
        </Router>
    );
}

export default App;
