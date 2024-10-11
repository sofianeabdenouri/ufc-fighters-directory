import React, { useState, useEffect } from 'react';
import './SearchBar.css'; // Assuming you'll add the necessary CSS for styling

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false); // New state to track if the user has scrolled past

    // Helper function to remove duplicates by FighterId
    const removeDuplicates = (fighters) => {
        const uniqueFighters = new Map();
        fighters.forEach(fighter => uniqueFighters.set(fighter.FighterId, fighter));
        return Array.from(uniqueFighters.values());
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim() === '') {
                setFilteredFighters(removeDuplicates(fighters)); // Reset to the original list if search term is empty
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

    // Track scroll position to determine when to apply the border
    useEffect(() => {
        const handleScroll = () => {
            const searchBarOffset = 100; // Change this value based on when you want the border to appear
            if (window.scrollY > searchBarOffset) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`search-container ${scrolled ? 'scrolled' : ''}`}>
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
