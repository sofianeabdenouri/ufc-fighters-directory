import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import './SearchBar.css';

// Simple sanitization to remove accents and special characters
const sanitizeName = (name = '') => {
    return name
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/['-]/g, '') // Remove apostrophes and hyphens
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
        .toLowerCase() // Convert to lowercase
        .trim(); // Remove leading/trailing spaces
};

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm); // Defer the search term for smoother UX
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll to apply styles or animations when scrolling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Updated filtering logic for progressive search
    const filteredResults = useMemo(() => {
        const sanitizedTerm = sanitizeName(deferredSearchTerm);
        if (sanitizedTerm === '') return fighters;

        return fighters.filter((fighter) => {
            const firstName = (fighter.FirstName || "").toLowerCase();
            const lastName = (fighter.LastName || "").toLowerCase();

            // Match if the search term appears anywhere in the first or last name
            return firstName.includes(sanitizedTerm) || lastName.includes(sanitizedTerm);
        });
    }, [deferredSearchTerm, fighters]);

    // Update filteredFighters when the filtered results change
    useEffect(() => {
        setFilteredFighters(filteredResults);
    }, [filteredResults, setFilteredFighters]);

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
