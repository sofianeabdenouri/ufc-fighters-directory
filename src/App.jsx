import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FighterCard from './components/FighterCard';
import Header from './header/Header'; // Correct import path
import './App.css';

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('alphabetical'); // New state for sorting
    const [filteredFighters, setFilteredFighters] = useState([]); // To apply sorting and filters

    // Fetch fighters and process the data
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const fightersWithRecords = data.filter(fighter => fighter.Wins || fighter.Losses || fighter.Draws);
                const uniqueFighters = Array.from(new Set(fightersWithRecords.map(fighter => fighter.FighterId)))
                    .map(id => fightersWithRecords.find(fighter => fighter.FighterId === id));
                setFighters(uniqueFighters);
                setFilteredFighters(uniqueFighters); // Set filteredFighters to be the same initially
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Handle sorting logic based on sortBy state
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
            case 'mostDraws':
                sortedFighters.sort((a, b) => b.Draws - a.Draws);
                break;
            case 'mostSubmissions':
                sortedFighters.sort((a, b) => b.Submissions - a.Submissions);
                break;
            case 'mostKOs':
                sortedFighters.sort((a, b) => b.TechnicalKnockouts - a.TechnicalKnockouts);
                break;
            case 'weightClass':
                sortedFighters.sort((a, b) => a.WeightClass.localeCompare(b.WeightClass));
                break;
            case 'gender':
                sortedFighters = sortedFighters.filter(fighter =>
                    fighter.WeightClass.toLowerCase().includes("women's") ? 'Female' : 'Male'
                );
                break;
            default:
                break;
        }

        setFilteredFighters(sortedFighters); // Set sorted fighters to the state
    };

    const fetchImage = async (fighterName) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY; // Add your Google API Key
            const searchEngineId = import.meta.env.VITE_GOOGLE_CSE_ID; // Add your Google Custom Search Engine ID

            const response = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
                params: {
                    key: apiKey,
                    cx: searchEngineId,
                    q: fighterName + ' UFC',
                    searchType: 'image',
                    num: 1, // Get only one image per request
                },
            });

            const imageUrl = response.data.items[0]?.link || '';
            return imageUrl;
        } catch (error) {
            console.error('Error fetching image:', error);
            return '';
        }
    };

    const handleSearch = () => {
        const results = fighters.filter(fighter =>
            fighter.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fighter.LastName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Fetch images for the filtered fighters
        Promise.all(
            results.map(async (fighter) => {
                const imageUrl = await fetchImage(fighter.FirstName + ' ' + fighter.LastName);
                return { ...fighter, imageUrl };
            })
        ).then((fightersWithImages) => {
            setFilteredFighters(fightersWithImages); // Set filtered fighters with images
        });
    };

    return (
        <div className="app">
            {/* Render Header only once */}
            <Header />

            <h1 id="fighters">UFC Fighters Directory</h1>

            {/* Search and Sort */}
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
                    <option value="alphabetical">Sort by Alphabetical</option>
                    <option value="mostWins">Sort by Most Wins</option>
                    <option value="mostLosses">Sort by Most Losses</option>
                    <option value="mostDraws">Sort by Most Draws</option>
                    <option value="mostSubmissions">Sort by Most Submissions</option>
                    <option value="mostKOs">Sort by Most KOs</option>
                    <option value="weightClass">Sort by Weight Class</option>
                    <option value="gender">Sort by Gender</option>
                </select>

                <button onClick={handleSort}>Sort</button>
            </div>

            {/* Fighter List */}
            <div className="fighter-list">
                {filteredFighters.map(fighter => (
                    <FighterCard key={fighter.FighterId} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default App;
