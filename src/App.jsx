import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FighterCard from './components/FighterCard';
import './App.css';

function App() {
    const [fighters, setFighters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch fighters and process the data
    useEffect(() => {
        fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${import.meta.env.VITE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const fightersWithRecords = data.filter(fighter => fighter.Wins || fighter.Losses || fighter.Draws);
                const uniqueFighters = Array.from(new Set(fightersWithRecords.map(fighter => fighter.FighterId)))
                    .map(id => fightersWithRecords.find(fighter => fighter.FighterId === id));
                setFighters(uniqueFighters);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

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
            setFighters(fightersWithImages);
        });
    };

    return (
        <div className="app">
            <h1>UFC Fighters Directory</h1>
            <div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search fighters"
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="fighter-list">
                {fighters.map(fighter => (
                    <FighterCard key={fighter.FighterId} fighter={fighter} />
                ))}
            </div>
        </div>
    );
}

export default App;
