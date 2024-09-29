import React, { useState, useEffect, useRef } from 'react'; // Added useRef
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

    const fighterListRef = useRef(null); // Create a ref for the fighter list

    const maleWeightClasses = [
        "Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", 
        "Middleweight", "Light Heavyweight", "Heavyweight", "Catch Weight", "Open Weight", "Unknown"
    ];

    const femaleWeightClasses = [
        "Women's Strawweight", "Women's Flyweight", 
        "Women's Bantamweight", "Women's Featherweight"
    ];

    const genders = ["Male", "Female"];

    // Fetch fighters
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const uniqueFighters = [];
                const nameSet = new Set();

                data.forEach(fighter => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`;
                    const hasRecords = 
                        fighter.Wins > 0 || 
                        fighter.Losses > 0 || 
                        fighter.Draws > 0 ||
                        fighter.Height > 0 || 
                        fighter.Weight > 0;

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

    // Function to scroll to the fighter list
    const scrollToFighterList = () => {
        fighterListRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSort = () => { /* Sorting logic */ };
    const handleSearch = () => { /* Search logic */ };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleWeightClass = (weightClass) => { /* Toggle weight class filter */ };
    const toggleGender = (gender) => { /* Toggle gender filter */ };
    const toggleAdvancedSearch = () => { /* Toggle advanced search */ };

    const isWeightClassDisabled = (weightClass) => { /* Logic to disable weight classes based on gender */ };

    return (
        <Router>
            <Header scrollToFighterList={scrollToFighterList} /> {/* Pass scroll function as prop */}
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="app">
                            <h1>UFC Fighters Directory</h1>

                            <div className="search-container">
                                {/* Search and sorting UI */}
                            </div>

                            <div id="fighters" ref={fighterListRef} className="fighter-list"> {/* Fighter list with ref */}
                                {filteredFighters.length > 0 ? (
                                    filteredFighters.map(fighter => (
                                        <FighterCard key={fighter.FighterId} fighter={fighter} />
                                    ))
                                ) : (
                                    <p>No fighters found</p>
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
