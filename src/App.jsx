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
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`http://localhost:5000/favorites/user123`);
                const data = await response.json();
                setFavorites(data); // Initialize favorites from backend
            } catch (error) {
                console.error('Error fetching favorites:', error);
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
        if (selectedGenders.includes("Male") && !maleWeightClasses.includes(weightClass)) {
            return true;
        }
        return false;
    };

    const toggleFavorite = async (fighterId) => {
        try {
            if (favorites.includes(fighterId)) {
                // If already in favorites, remove it
                await fetch(`http://localhost:5000/favorites/user123`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fighterId }),
                });
    
                setFavorites((prevFavorites) =>
                    prevFavorites.filter((id) => id !== fighterId)
                );
            } else {
                // If not in favorites, add it
                await fetch(`http://localhost:5000/favorites/user123`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fighterId }),
                });
    
                setFavorites((prevFavorites) => [...prevFavorites, fighterId]);
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