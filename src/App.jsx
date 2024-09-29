import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import FighterProfile from './pages/fighter-profile/FighterProfile';
import Header from './header/Header';
import './App.css';

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [selectedWeightClasses, setSelectedWeightClasses] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const maleWeightClasses = [
        "Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", 
        "Middleweight", "Light Heavyweight", "Heavyweight", "Catch Weight", "Open Weight", "Unknown"
    ];

    const femaleWeightClasses = [
        "Women's Strawweight", "Women's Flyweight", 
        "Women's Bantamweight", "Women's Featherweight"
    ];

    const genders = ["Male", "Female"];

    // Fetch fighters and process the data
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const uniqueFighters = [];
                const nameSet = new Set();

                data.forEach(fighter => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`;
                    const hasRecords = fighter.Wins > 0 || fighter.Losses > 0 || fighter.Draws > 0 || fighter.Height > 0 || fighter.Weight > 0;

                    if (!nameSet.has(fullName) && hasRecords) {
                        nameSet.add(fullName);
                        uniqueFighters.push(fighter);
                    }
                });

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Handle sorting logic
    const handleSort = () => {
        let sortedFighters = [...filteredFighters];
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
            default:
                break;
        }
        setFilteredFighters(sortedFighters);
    };

    // Handle search functionality
    const handleSearch = () => {
        let results = fighters;

        // If a search term exists, filter based on that
        if (searchTerm.trim() !== '') {
            results = fighters.filter(fighter => {
                const fullName = `${fighter.FirstName || ''} ${fighter.LastName || ''}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) || 
                       (fighter.FirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (fighter.LastName || '').toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // Filter by weight classes if any are selected
        if (selectedWeightClasses.length > 0) {
            results = results.filter(fighter => {
                const fighterWeightClass = fighter.WeightClass || "Unknown"; // Assign "Unknown" to fighters with no weight class
                return selectedWeightClasses.includes(fighterWeightClass);
            });
        }

        // Filter by gender if any are selected
        if (selectedGenders.length > 0) {
            results = results.filter(fighter => {
                const gender = maleWeightClasses.includes(fighter.WeightClass) || !fighter.WeightClass ? "Male" : "Female";
                return selectedGenders.includes(gender);
            });
        }

        setFilteredFighters(results);
    };

    // Handle pressing the "Enter" key to trigger search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(); // Trigger search when Enter is pressed
        }
    };

    // Toggle weight class filters
    const toggleWeightClass = (weightClass) => {
        setSelectedWeightClasses(prev => 
            prev.includes(weightClass) 
            ? prev.filter(wc => wc !== weightClass) 
            : [...prev, weightClass]
        );
    };

    // Toggle gender filters
    const toggleGender = (gender) => {
        setSelectedGenders(prev => 
            prev.includes(gender) 
            ? prev.filter(g => g !== gender) 
            : [...prev, gender]
        );
    };

    // Toggle advanced search section visibility
    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(prev => !prev); // Toggle the state
    };

    // Function to disable weight classes based on gender filter
    const isWeightClassDisabled = (weightClass) => {
        if (selectedGenders.length === 2) {
            return false; // If both genders are selected, none of the weight classes should be disabled
        }
        if (selectedGenders.includes("Female") && !femaleWeightClasses.includes(weightClass)) {
            return true; // Disable male weight classes if "Female" is selected
        }
        if (selectedGenders.includes("Male") && !maleWeightClasses.includes(weightClass)) {
            return true; // Disable female weight classes if "Male" is selected
        }
        return false;
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
                                    <option value="mostDraws">Most Draws</option>
                                    <option value="mostKOs">Most KOs</option>
                                    <option value="mostSubs">Most Submissions</option>
                                </select>

                                <button onClick={handleSort}>Sort</button>

                                {/* Advanced Search Toggle */}
                                <button onClick={toggleAdvancedSearch} style={{ marginLeft: '10px' }}>
                                    {showAdvancedSearch ? 'Hide Advanced Search' : 'Advanced Search'}
                                </button>
                            </div>

                            {/* Advanced Search Section */}
                            {showAdvancedSearch && (
                                <div className="advanced-search-box fighter-card"> {/* Match styling of fighter card */}
                                    <h2>Advanced Search</h2>

                                    <div>
                                        <h3>Filter by Gender:</h3>
                                        {genders.map(gender => (
                                            <div key={gender}>
                                                <label>
                                                    <input 
                                                        type="checkbox" 
                                                        onChange={() => toggleGender(gender)} 
                                                    /> {gender}
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3>Filter by Weight Class:</h3>
                                        {maleWeightClasses.concat(femaleWeightClasses).map(wc => (
                                            <div key={wc}>
                                                <label style={{ color: isWeightClassDisabled(wc) ? 'gray' : 'white' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        onChange={() => toggleWeightClass(wc)} 
                                                        disabled={isWeightClassDisabled(wc)} 
                                                    /> {wc}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
