import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FighterCard from './components/FighterCard';
import FighterProfile from './pages/fighter-profile/FighterProfile';
import Header from './header/Header';
import './App.css';

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

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filteredFighters, setFilteredFighters] = useState([]);
    const [selectedWeightClasses, setSelectedWeightClasses] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const fightersPerPage = useRef(15); // 5 fighters per row * 3 rows
    const totalPages = Math.ceil(filteredFighters.length / fightersPerPage.current);

    useEffect(() => {
        // Fetch initial favorites
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

    useEffect(() => {
        // Fetch fighters data
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then((response) => response.json())
            .then((data) => {
                const fightersWithRecords = data.filter(
                    (fighter) => fighter.Wins || fighter.Losses || fighter.Draws
                );

                const uniqueFighters = Array.from(new Set(fightersWithRecords.map((f) => f.FighterId))).map((id) =>
                    fightersWithRecords.find((f) => f.FighterId === id)
                );

                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters);
            })
            .catch((error) => console.error('Error fetching fighters:', error));
    }, []);

    const handleSearch = () => {
        let results = fighters;

        if (searchTerm) {
            const normalizedSearchTerm = sanitizeNameForImage(searchTerm.trim());
            results = results.filter((fighter) => {
                const sanitizedFullName = sanitizeNameForImage(fighter.FirstName, fighter.LastName);
                return sanitizedFullName.includes(normalizedSearchTerm);
            });
        }

        if (selectedWeightClasses.length > 0) {
            results = results.filter((fighter) =>
                selectedWeightClasses.includes(fighter.WeightClass || 'Unknown')
            );
        }

        if (selectedGenders.length > 0) {
            results = results.filter((fighter) => {
                const gender =
                    ["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"].includes(
                        fighter.WeightClass
                    )
                        ? 'Male'
                        : 'Female';
                return selectedGenders.includes(gender);
            });
        }

        if (sortBy) {
            switch (sortBy) {
                case 'alphabetical':
                    results.sort((a, b) => {
                        const lastNameCompare = a.LastName.localeCompare(b.LastName);
                        return lastNameCompare === 0
                            ? a.FirstName.localeCompare(b.FirstName)
                            : lastNameCompare;
                    });
                    break;
                case 'mostWins':
                    results.sort((a, b) => b.Wins - a.Wins);
                    break;
                default:
                    break;
            }
        }

        setFilteredFighters(results);
        setCurrentPage(1);
    };

    const toggleFavorite = async (fighterId) => {
        try {
            if (favorites.includes(fighterId)) {
                await fetch(`http://localhost:5000/favorites/user123`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fighterId }),
                });
                setFavorites(favorites.filter((id) => id !== fighterId));
            } else {
                await fetch(`http://localhost:5000/favorites/user123`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fighterId }),
                });
                setFavorites([...favorites, fighterId]);
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
                            <Header />
                            <h1 className="font-h1">UFC Records</h1>
                            <div className="search-container">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search fighters"
                                />
                                <button onClick={handleSearch}>Search</button>
                            </div>

                            <div className="fighter-list">
                                {filteredFighters.map((fighter) => (
                                    <FighterCard
                                        key={fighter.FighterId}
                                        fighter={fighter}
                                        isFavorite={favorites.includes(fighter.FighterId)}
                                        toggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        </div>
                    }
                />
                <Route
                    path="/fighter/:id"
                    element={<FighterProfile favorites={favorites} toggleFavorite={toggleFavorite} />}
                />
            </Routes>
        </Router>
    );
}

export default App;
