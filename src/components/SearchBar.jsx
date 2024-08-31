import React, { useState, useEffect } from 'react';

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const filtered = fighters.filter(fighter =>
                fighter.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
            setFilteredFighters(filtered);
        }, 300); // Debounce time in ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fighters, setFilteredFighters]);

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fighters"
            />
        </div>
    );
}

export default SearchBar;
