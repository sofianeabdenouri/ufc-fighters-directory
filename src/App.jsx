import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import routing components
import FighterCard from './components/FighterCard'; // FighterCard component
import FighterProfile from '././pages/fighter-profile/FighterProfile'; // FighterProfile page component
import Header from './header/Header'; // Header component
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
                const fightersWithRecords = data.filter(fighter => fighter.Wins || fighter.Losses || fighter.Draws);
                setFighters(fightersWithRecords);
                setFilteredFighters(fightersWithRecords);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

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

    const handleSearch = () => {
        const results = fighters.filter(fighter =>
            fighter.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fighter.LastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFighters(results);
    };

    return (
        <Router>
            <Header />

            <Routes>
                <Route path="/" element={
                    <div className="app">
                        <h1>UFC Fighters Directory</h1>

                        <div className="search-container">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search fighters"
                            />
                            <button onClick={handleSearch}>Search</button>

                            {/* Sort Dropdown */}
                            <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                                <option value="" disabled>Sort by</option> {/* Default "Sort by" option */}
                                <option value="alphabetical">Alphabetical</option>
                                <option value="mostWins">Most Wins</option>
                                <option value="mostLosses">Most Losses</option>
                                <option value="mostDraws">Most Draws</option>
                                <option value="mostSubmissions">Most Submissions</option>
                                <option value="mostKOs">Most KOs</option>
                                <option value="weightClass">Weight Class</option>
                                <option value="gender">Gender</option>
                            </select>

                            <button onClick={handleSort}>Sort</button>
                        </div>

                        <div className="fighter-list">
                            {filteredFighters.map(fighter => (
                                <FighterCard key={fighter.FighterId} fighter={fighter} />
                            ))}
                        </div>
                    </div>
                } />

                {/* Route for Fighter Profile */}
                <Route path="/fighter/:id" element={<FighterProfile />} />
            </Routes>
        </Router>
    );
}

export default App;
