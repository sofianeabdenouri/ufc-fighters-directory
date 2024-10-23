import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import FighterProfile from './pages/fighter-profile/FighterProfile';
import Header from './header/Header';
import './App.css';

// Utility function to sanitize fighter names for use in image paths
const sanitizeNameForImage = (name) => {
    return name
        .toLowerCase()                // Convert to lowercase
        .replace(/['-]/g, '')         // Remove apostrophes and hyphens
        .replace(/\s+/g, '_');        // Replace spaces with underscores
};

// Utility function to remove accents from strings
const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Removes accents from characters
};

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [selectedWeightClasses, setSelectedWeightClasses] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    }); // State for managing favorites
    const [showScrollButton, setShowScrollButton] = useState(false); // For scroll-to-top button

    // Scroll restoration logic
    useEffect(() => {
        // Save scroll position before leaving the page
        const saveScrollPosition = () => {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        };

        // Add event listener to save scroll position
        window.addEventListener('beforeunload', saveScrollPosition);

        // Restore scroll position when user revisits
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition && window.location.pathname === "/") {
            window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }

        return () => {
            // Cleanup: remove event listener
            window.removeEventListener('beforeunload', saveScrollPosition);
        };
    }, []);

    // Toggle scroll-to-top button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdvancedSearch = () => {
        handleSearch(); // Trigger search when doing advanced search
    };

    const maleWeightClasses = [
        "Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight",
        "Middleweight", "Light Heavyweight", "Heavyweight", "Catch Weight", "Open Weight", "Unknown"
    ];

    const femaleWeightClasses = [
        "Women's Strawweight", "Women's Flyweight",
        "Women's Bantamweight", "Women's Featherweight"
    ];

    const genders = ["Male", "Female"];
    const fighterListRef = useRef(null);

    const scrollToFighters = () => {
        fighterListRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
        const normalizedSearchTerm = removeAccents(searchTerm.trim().toLowerCase());

        if (normalizedSearchTerm !== '') {
            results = fighters.filter(fighter => {
                const fullName = `${fighter.FirstName || ''} ${fighter.LastName || ''}`;
                const normalizedFullName = removeAccents(fullName.toLowerCase());

                return normalizedFullName.includes(normalizedSearchTerm) ||
                    removeAccents((fighter.FirstName || '').toLowerCase()).includes(normalizedSearchTerm) ||
                    removeAccents((fighter.LastName || '').toLowerCase()).includes(normalizedSearchTerm);
            });
        }

        if (selectedWeightClasses.length > 0) {
            results = results.filter(fighter => {
                const fighterWeightClass = fighter.WeightClass || "Unknown";
                return selectedWeightClasses.includes(fighterWeightClass);
            });
        }

        if (selectedGenders.length > 0) {
            results = results.filter(fighter => {
                const gender = maleWeightClasses.includes(fighter.WeightClass) || !fighter.WeightClass ? "Male" : "Female";
                return selectedGenders.includes(gender);
            });
        }

        results = handleSort(results);
        setFilteredFighters(results);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilteredFighters(fighters); // Reset to the full fighter list
    };

    const toggleWeightClass = (weightClass) => {
        setSelectedWeightClasses(prev =>
            prev.includes(weightClass)
                ? prev.filter(wc => wc !== weightClass)
                : [...prev, weightClass]
        );
    };

    const toggleGender = (gender) => {
        setSelectedGenders(prev =>
            prev.includes(gender)
                ? prev.filter(g => g !== gender)
                : [...prev, gender]
        );
    };

    const toggleAdvancedSearch = () => {
        setShowAdvancedSearch(prev => !prev);
    };

    const isWeightClassDisabled = (weightClass) => {
        if (selectedGenders.length === 2) {
            return false;
        }
        if (selectedGenders.includes("Female") && !femaleWeightClasses.includes(weightClass)) {
            return true;
        }
        if (selectedGenders.includes("Male") && !maleWeightClasses.includes(weightClass)) {
            return true;
        }
        return false;
    };

    const toggleFavorite = (fighterId) => {
        setFavorites(prevFavorites =>
            prevFavorites.includes(fighterId)
                ? prevFavorites.filter(id => id !== fighterId)
                : [...prevFavorites, fighterId]
        );
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="app">
                            <Header scrollToFighters={scrollToFighters} />

                            <h1 className="font-h1">UFC Fighters Directory</h1>
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

                                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                                    <option value="">No sorting</option>
                                    <option value="alphabetical">Alphabetical</option>
                                    <option value="mostWins">Most Wins</option>
                                    <option value="mostLosses">Most Losses</option>
                                    <option value="mostDraws">Most Draws</option>
                                    <option value="mostKOs">Most Knockouts</option>
                                    <option value="mostSubs">Most Submissions</option>
                                    <option value="favorites">Favorites</option> {/* Added Favorites sorting */}
                                </select>

                                <button onClick={handleSearch}>Search</button>

                                <button onClick={toggleAdvancedSearch} style={{ marginLeft: '10px' }}>
                                    {showAdvancedSearch ? 'Hide Advanced Search' : 'Advanced Search'}
                                </button>
                            </div>

                            {showAdvancedSearch && (
                                <div className="advanced-search-box fighter-card">
                                    <div className="weight-class-container">
                                        <div className="male-divisions">
                                            <h3>Male Divisions</h3>
                                            {maleWeightClasses.slice(0, 8).map(wc => (
                                                <div key={wc}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => toggleWeightClass(wc)}
                                                            disabled={isWeightClassDisabled(wc)}
                                                        /> {wc}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="female-divisions">
                                            <h3>Female Divisions</h3>
                                            {femaleWeightClasses.map(wc => (
                                                <div key={wc}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => toggleWeightClass(wc)}
                                                            disabled={isWeightClassDisabled(wc)}
                                                        /> {wc}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="other-divisions">
                                            <h3>Other Divisions</h3>
                                            {maleWeightClasses.slice(8).map(wc => (
                                                <div key={wc}>
                                                    <label>
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

                                    <div className="advanced-search-button-container">
                                        <button className="advanced-search-button" onClick={handleAdvancedSearch}>
                                            Advanced Search
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Display number of results */}
                            <div className="result-count">
                                {filteredFighters.length} fighters found.
                            </div>

                            <div className="fighter-list" ref={fighterListRef}>
                                {filteredFighters.length > 0 ? (
                                    filteredFighters.map(fighter => (
                                        <FighterCard 
                                            key={fighter.FighterId} 
                                            fighter={fighter} 
                                            isFavorite={favorites.includes(fighter.FighterId)} 
                                            toggleFavorite={toggleFavorite}
                                        />
                                    ))
                                ) : (
                                    <p>No fighters found</p>
                                )}
                            </div>

                            {/* Scroll to top button */}
                            {showScrollButton && (
                                <button onClick={handleScrollToTop} className="scroll-to-top">
                                    ↑ Top
                                </button>
                            )}

                            {/* Footer for fan project */}
                            <footer className="footer">
                                <p>
                                    This is a fan-made project and is in no way affiliated with, authorized, or endorsed by the Ultimate Fighting Championship (UFC) or any of its partners, subsidiaries, or associated organizations.<br/> All UFC-related trademarks, names, and logos are the property of their respective owners. <br/> The information presented on this site is for entertainment and informational purposes only, and while every effort is made to ensure accuracy, it is not official or guaranteed to be up-to-date.
                                </p>
                            </footer>
                        </div>
                    }
                />

                {/* Adjusted Route to pass favorites and toggleFavorite to FighterProfile */}
                <Route
                    path="/fighter/:id"
                    element={
                        <FighterProfile 
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
