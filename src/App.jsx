import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import FighterProfile from './pages/fighter-profile/FighterProfile';
import Header from './header/Header';
import './App.css';

// Utility function to sanitize fighter names for use in image paths
const sanitizeNameForImage = (firstName = '', lastName = '') => {
    // Join composed names if both are present
    const fullName = [firstName, lastName]
        .filter(Boolean)               // Remove empty or undefined names
        .join(' ')                     // Join with space if both names are present
        .normalize('NFD')              // Normalize to decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toLowerCase()                 // Convert to lowercase
        .replace(/['-]/g, '')          // Remove apostrophes and hyphens
        .replace(/[^a-z0-9\s]/g, '')   // Remove non-alphanumeric characters
        .replace(/\s+/g, '_')          // Replace spaces with underscores
        .trim();                       // Remove leading/trailing spaces
    
    return fullName;
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
    const [currentPage, setCurrentPage] = useState(1);
    const fightersPerPage = useRef(0); // Dynamically calculate fighters per page
    const totalPages = Math.ceil(filteredFighters.length / fightersPerPage.current); // Total number of pages
    const [showPageInput, setShowPageInput] = useState(false);
const [pageInputValue, setPageInputValue] = useState('');
const [errorMessage, setErrorMessage] = useState('');

const handleKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
};
useEffect(() => {
    setShowPageInput(false); // Hide the ellipsis input on page change
    setPageInputValue('');   // Clear the input value on page change
}, [currentPage]);

    const handlePageInputChange = (e) => {
        setPageInputValue(e.target.value);
        setErrorMessage(''); // Clear any previous error message
    };
    
    const handlePageInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(pageInputValue, 10);
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setShowPageInput(false);
                setPageInputValue(''); // Clear input value after navigation
            } else {
                setErrorMessage('Please enter a valid page number');
            }
        }
    };
    const handleFavoritesFilter = () => {
    // Filter for favorite fighters first
    let favoriteFighters = fighters.filter(fighter => favorites.includes(fighter.FighterId));
    
    // Apply selected weight class filters
    if (selectedWeightClasses.length > 0) {
        favoriteFighters = favoriteFighters.filter(fighter =>
            selectedWeightClasses.includes(fighter.WeightClass || 'Unknown')
        );
    }

    // Apply selected gender filters
    if (selectedGenders.length > 0) {
        favoriteFighters = favoriteFighters.filter(fighter => {
            const gender = maleWeightClasses.includes(fighter.WeightClass) || !fighter.WeightClass ? 'Male' : 'Female';
            return selectedGenders.includes(gender);
        });
    }
    
    // Apply current sorting option
    favoriteFighters = handleSort(favoriteFighters);
    
    // Update state with sorted and filtered favorites
    setFilteredFighters(favoriteFighters);
    setCurrentPage(1); // Reset to page 1 after filtering
};

    
    const goToPage = () => {
        const page = parseInt(pageInputValue, 10);
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setShowPageInput(false); // Hide input after setting page
            setErrorMessage('');
            setPageInputValue(''); // Clear input after navigation
        } else {
            setErrorMessage('Please enter a valid page number');
        }
    };
    
    
    const getPaginationNumbers = () => {
        const pages = [];
        
        if (totalPages <= 7) {
            // If total pages are small, show all without '...'
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // If near the beginning
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
            }
            // If near the end
            else if (currentPage >= totalPages - 3) {
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            }
            // If in the middle
            else {
                pages.push('...');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
                pages.push('...');
            }
        }
    
        return pages;
    };
    
    
    
// Dynamically set fighters per page to 5 fighters per row and 3 rows
useEffect(() => {
    const setFixedGrid = () => {
        const fightersPerRow = 5; // Set fixed fighters per row
        fightersPerPage.current = fightersPerRow * 3; // 5 fighters per row, 3 rows
    };

    setFixedGrid(); // Run on mount
    window.addEventListener('resize', setFixedGrid);
    return () => window.removeEventListener('resize', setFixedGrid);
}, []);

    
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
        const normalizedSearchTerm = sanitizeNameForImage(searchTerm.trim());
    
        if (normalizedSearchTerm) {
            results = fighters.filter((fighter) => {
                const sanitizedFullName = sanitizeNameForImage(fighter.FirstName, fighter.LastName);
                return sanitizedFullName.includes(normalizedSearchTerm);
            });
        }
    
        if (selectedWeightClasses.length > 0) {
            results = results.filter(fighter =>
                selectedWeightClasses.includes(fighter.WeightClass || 'Unknown')
            );
        }
    
        if (selectedGenders.length > 0) {
            results = results.filter(fighter => {
                const gender = maleWeightClasses.includes(fighter.WeightClass) || !fighter.WeightClass ? 'Male' : 'Female';
                return selectedGenders.includes(gender);
            });
        }
    
        results = handleSort(results);
        setFilteredFighters(results);
        setCurrentPage(1); // Reset to page 1 after search
    
        // Reset the advanced filters
        setSelectedWeightClasses([]);
        setSelectedGenders([]);
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
        setFavorites((prevFavorites) => {
            const updatedFavorites = prevFavorites.includes(fighterId)
                ? prevFavorites.filter((id) => id !== fighterId)
                : [...prevFavorites, fighterId];
            
            // Update localStorage with the new favorites list
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
            return updatedFavorites;
        });
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
    </select>

    <button onClick={handleSearch}>Search</button>

    <button
        className="favorites-button"
        onClick={handleFavoritesFilter} // New function for instant favorites filter
    >
        Favorites
    </button>

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

                                    
                                </div>
                            )}

                            {/* Display number of results */}
                            <div className="result-count">
    {Math.min(fightersPerPage.current, filteredFighters.slice((currentPage - 1) * fightersPerPage.current, currentPage * fightersPerPage.current).length)} fighters shown — {filteredFighters.length} fighters found
</div>


  {/* PAGINATION LOGIC HERE */}
  {(() => {
                            const paginatedFighters = filteredFighters.slice(
                                (currentPage - 1) * fightersPerPage.current,
                                currentPage * fightersPerPage.current
                            );

                             return (
                                <div className="fighter-list" ref={fighterListRef}>
                                    
                                    {paginatedFighters.length > 0 ? (
                                        paginatedFighters.map((fighter) => (
                                            <FighterCard
                                                key={fighter.FighterId}
                                                fighter={fighter}
                                                isFavorite={favorites.includes(
                                                    fighter.FighterId
                                                )}
                                                toggleFavorite={toggleFavorite}
                                            />
                                        ))
                                    ) : (
                                        <p>No fighters found</p>
                                    )}
                                </div>
                                     );
                                    })()}
{/* Pagination Controls */}
{totalPages > 1 && (
    <div className="pagination">
        <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className={currentPage === 1 ? 'disabled-button' : ''}
        >
            « First
        </button>

        <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={currentPage === 1 ? 'disabled-button' : ''}
        >
            ‹ Prev
        </button>

        {getPaginationNumbers().map((page, index) =>
            page === '...' ? (
                showPageInput ? (
                    <div key={index} style={{ display: 'inline-block', textAlign: 'center' }}>
                        {errorMessage && (
                            <div className="ellipses-error-message">{errorMessage}</div>
                        )}
                        <input
                            type="text"
                            value={pageInputValue}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) {
                                    setPageInputValue(e.target.value);
                                    setErrorMessage('');
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    goToPage();
                                }
                            }}
                            placeholder=""
                            className="ellipses-page-input"
                            style={{ width: '35px', height: '35px', textAlign: 'center' }}
                            autoFocus
                            onBlur={() => setShowPageInput(false)}
                        />
                    </div>
                ) : (
                    <button
                        key={index}
                        onClick={() => {
                            setShowPageInput(true);
                            setErrorMessage('');
                        }}
                        className="ellipsis-button"
                    >
                        ...
                    </button>
                )
            ) : (
                <button
                    key={index}
                    className={page === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
                </button>
            )
        )}

        <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={currentPage === totalPages ? 'disabled-button' : ''}
        >
            Next ›
        </button>

        <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={currentPage === totalPages ? 'disabled-button' : ''}
        >
            Last »
        </button>
    </div>
)}



                            {/* Scroll to top button */}
                            {showScrollButton && (
                                <button onClick={handleScrollToTop} className="scroll-to-top">
                                    ↑
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
