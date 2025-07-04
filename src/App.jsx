import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import Header from './header/Header';
import './App.css';
import ScrollRestorer from './ScrollRestorer';
import Loading from "./common/loading/Loading";


const FighterProfile = React.lazy(() => import('./pages/fighter-profile/FighterProfile'));

// Utility function to sanitize fighter names for use in image paths
const sanitizeNameForImage = (firstName = '', lastName = '', nickname = '', isDuplicate = false) => {
    const fullName = [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['-]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();

    if (isDuplicate && nickname) {
        const sanitizedNickname = nickname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/['-]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
            return `${fullName}_${sanitizedNickname}`;
        }

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
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        const fetchFavorites = () => {
            try {
                const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
                setFavorites(savedFavorites); // Load favorites from localStorage
            } catch (error) {
                console.error('Error loading favorites from localStorage:', error);
            }
        };
    
        fetchFavorites();
    }, []);
    
    
    const [showScrollButton, setShowScrollButton] = useState(false); // For scroll-to-top button
    const [currentPage, setCurrentPage] = useState(1);
    const fightersPerPage = useRef(0); // Dynamically calculate fighters per page
    const totalPages = Math.ceil(filteredFighters.length / fightersPerPage.current); // Total number of pages
    const [showPageInput, setShowPageInput] = useState({ left: false, right: false });
const [pageInputValue, setPageInputValue] = useState('');
const [errorMessage, setErrorMessage] = useState('');

const handleEllipsisClick = (side) => {
    setShowPageInput((prev) => ({ ...prev, [side]: true }));
    setErrorMessage('');
};

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

    
const goToPage = (side) => {
    const page = parseInt(pageInputValue, 10);
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setShowPageInput({ left: false, right: false }); // Close both inputs
        setErrorMessage('');
        setPageInputValue('');
    } else {
        setErrorMessage('Invalid page number');
    }
};
    
const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('rightEllipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push('leftEllipsis');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('leftEllipsis');
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
            pages.push('rightEllipsis');
            pages.push(totalPages);
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
    
const handleScrollToTop = () => {
    const scrollingElement = document.querySelector(".app"); // Target the scrollable element
    if (scrollingElement) {
        scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
    }
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
        const apiUrl = `${import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')}/fighters`;
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            
                    .then((data) => {
                        // Add defaults to fighters
                        const fightersWithDefaults = data.map(fighter => ({
                            ...fighter,
                            FirstName: fighter.FirstName || "",
                            LastName: fighter.LastName || "",
                            Nickname: fighter.Nickname || "",
                            WeightClass: fighter.WeightClass || "Unknown",
                            Wins: fighter.Wins ?? 0,
                            Losses: fighter.Losses ?? 0,
                            Draws: fighter.Draws ?? 0,
                            TechnicalKnockouts: fighter.TechnicalKnockouts ?? 0,
                            Submissions: fighter.Submissions ?? 0,
                            Height: fighter.Height ?? "N/A",
                            Weight: fighter.Weight ?? "N/A",
                            Reach: fighter.Reach ?? "N/A",
                            BirthDate: fighter.BirthDate || "N/A",
                        }));
            
                        // Filter out fighters with no fights
                        const fightersWithFights = fightersWithDefaults.filter((fighter) => {
                            const totalFights = (fighter.Wins || 0) + (fighter.Losses || 0) + (fighter.Draws || 0);
                            return totalFights > 0;
                        });
            
                        // Group fighters by full name
                        const groupedFighters = fightersWithFights.reduce((acc, fighter) => {
                            const fullName = `${fighter.FirstName} ${fighter.LastName}`.trim();
                            if (!acc[fullName]) acc[fullName] = [];
                            acc[fullName].push(fighter);
                            return acc;
                        }, {});
            
                        // Flatten groups and remove duplicates
                        const selectedFighters = Object.values(groupedFighters).flatMap((group) => {
                            if (group.length === 1) return group; // No duplicates, keep the single fighter
            
                            // Deduplicate fighters with identical records
                            const uniqueFighters = group.reduce((unique, currentFighter) => {
                                const isDuplicate = unique.some((fighter) =>
                                    fighter.Wins === currentFighter.Wins &&
                                    fighter.Losses === currentFighter.Losses &&
                                    fighter.Draws === currentFighter.Draws &&
                                    fighter.Nickname === currentFighter.Nickname
                                );
                                if (!isDuplicate) unique.push(currentFighter);
                                return unique;
                            }, []);
            
                            // Mark duplicates
                            return uniqueFighters.map((fighter) => ({
                                ...fighter,
                                isDuplicate: uniqueFighters.length > 1, // Mark as duplicate only if more than one remains
                            }));
                        });
            
                        // Update the state with filtered and deduplicated fighters
                        setFighters(selectedFighters);
                        setFilteredFighters(selectedFighters);
                    })
                    .catch((error) => console.error('Error fetching data:', error));
            }, []);
            
   useEffect(() => {
  handleSearch();
}, [searchTerm]);
 
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
    
        if (searchTerm.trim()) {
            const normalizedSearchTerm = searchTerm
                .toLowerCase() // Normalize to lowercase
                .normalize('NFD') // Decompose accented characters
                .replace(/[\u0300-\u036f]/g, ''); // Remove accents
        
            results = fighters.filter((fighter) => {
                const firstName = (fighter.FirstName || '')
                    .toLowerCase() // Normalize to lowercase
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
        
                const lastName = (fighter.LastName || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
        
                const fullName = `${firstName} ${lastName}`; // Combine first and last names
        
                return (
                    firstName.includes(normalizedSearchTerm) ||
                    lastName.includes(normalizedSearchTerm) ||
                    fullName.includes(normalizedSearchTerm) // Match full name
                );
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
        try {
            // Retrieve favorites from localStorage or initialize as an empty array
            const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
            if (storedFavorites.includes(fighterId)) {
                // If already in favorites, remove it
                const updatedFavorites = storedFavorites.filter((id) => id !== fighterId);
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                setFavorites(updatedFavorites); // Update the state
            } else {
                // If not in favorites, add it
                const updatedFavorites = [...storedFavorites, fighterId];
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                setFavorites(updatedFavorites); // Update the state
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };
    

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="app">
                            <ScrollRestorer /> 
                            <Header scrollToFighters={scrollToFighters} />

                            <h1 className="font-h1">MMArec</h1>
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

    <button onClick={toggleAdvancedSearch}>
        {showAdvancedSearch ? 'Hide Advanced Filters' : 'Advanced Filters'}
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
  {wc}
  <input
    type="checkbox"
    onChange={() => toggleWeightClass(wc)}
    disabled={isWeightClassDisabled(wc)}
  />
</label>

                                                </div>
                                            ))}
                                        </div>

                                        <div className="female-divisions">
                                            <h3>Female Divisions</h3>
                                            {femaleWeightClasses.map(wc => (
                                                <div key={wc}>
                                                    <label>
  {wc}
  <input
    type="checkbox"
    onChange={() => toggleWeightClass(wc)}
    disabled={isWeightClassDisabled(wc)}
  />
</label>

                                                </div>
                                            ))}
                                        </div>

                                        <div className="other-divisions">
                                            <h3>Other Divisions</h3>
                                            {maleWeightClasses.slice(8).map(wc => (
                                                <div key={wc}>
                                                    <label>
  {wc}
  <input
    type="checkbox"
    onChange={() => toggleWeightClass(wc)}
    disabled={isWeightClassDisabled(wc)}
  />
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
        page === 'leftEllipsis' ? (
            showPageInput.left ? (
                <div key={index} style={{ display: 'inline-block', textAlign: 'center' }}>
                    {errorMessage && <div className="ellipses-error-message">{errorMessage}</div>}
                    <input
                        type="text"
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') goToPage('left');
                        }}
                        placeholder="Go"
                        className="ellipses-page-input"
                        onBlur={() => setShowPageInput((prev) => ({ ...prev, left: false }))}
                        autoFocus
                    />
                </div>
            ) : (
                <button
                    key={index}
                    onClick={() => handleEllipsisClick('left')}
                    className="ellipsis-button"
                >
                    ...
                </button>
            )
        ) : page === 'rightEllipsis' ? (
            showPageInput.right ? (
                <div key={index} style={{ display: 'inline-block', textAlign: 'center' }}>
                    {errorMessage && <div className="ellipses-error-message">{errorMessage}</div>}
                    <input
                        type="text"
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') goToPage('right');
                        }}
                        placeholder="Go"
                        className="ellipses-page-input"
                        onBlur={() => setShowPageInput((prev) => ({ ...prev, right: false }))}
                        autoFocus
                    />
                </div>
            ) : (
                <button
                    key={index}
                    onClick={() => handleEllipsisClick('right')}
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
This is a fan-made project and is in no way affiliated with, authorized, or endorsed by any mixed martial arts (MMA) organization or promotion, including but not limited to the UFC, Bellator, ONE Championship, PFL, or any of their partners, subsidiaries, or affiliates.<br/> All trademarks, names, and logos associated with MMA organizations are the property of their respective owners.<br/> The information presented on this site is for entertainment and informational purposes only. While efforts are made to ensure accuracy, it is not official or guaranteed to be up-to-date.
                                </p>
                            </footer>
                        </div>
                    }
                />

                {/* Adjusted Route to pass favorites and toggleFavorite to FighterProfile */}
                <Route
                    path="/fighter/:id"
                    element={
                            <Suspense fallback={<Loading />}>
  <FighterProfile
    favorites={favorites}
    toggleFavorite={toggleFavorite}
  />
</Suspense>


                    }
                />
            </Routes>
        </Router>
    );
}

export default App;