import React, { useState, useEffect } from 'react';

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to remove duplicates by FighterId
    const removeDuplicates = (fighters) => {
        const uniqueFighters = new Map();
        fighters.forEach(fighter => uniqueFighters.set(fighter.FighterId, fighter));
        return Array.from(uniqueFighters.values());
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim() === '') {
                // Reset to the original list if search term is empty
                setFilteredFighters(removeDuplicates(fighters));
            } else {
                const filtered = fighters.filter(fighter => {
                    const fullName = `${fighter.FirstName} ${fighter.LastName}`.toLowerCase();
                    return fullName.includes(searchTerm.trim().toLowerCase());
                });
                setFilteredFighters(removeDuplicates(filtered));
            }
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
