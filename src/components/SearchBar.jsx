import React, { useState } from 'react';

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        console.log('Search term:', searchTerm);  // Debugging
        const filtered = fighters.filter(fighter =>
            fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('Filtered fighters:', filtered);  // Debugging
        setFilteredFighters(filtered);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fighters"
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
}

export default SearchBar;
