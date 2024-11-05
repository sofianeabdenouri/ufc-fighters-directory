import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import './SearchBar.css';

const sanitizeName = (firstName = '', lastName = '') => {
    const fullName = [firstName, lastName]
        .filter(Boolean)               // Remove empty or undefined names
        .join(' ')                     // Join with space if both names are present
        .normalize('NFD')              // Normalize to decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toLowerCase()                 // Convert to lowercase
        .replace(/['-]/g, '')          // Remove apostrophes and hyphens
        .replace(/[^a-z0-9\s]/g, '')   // Remove non-alphanumeric characters
        .replace(/\s+/g, '_')          // Replace spaces with underscores
        .trim();                       // Remove leading/trailing spaces
    
    return fullName;
};


function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm); // Defer the search term
    const [scrolled, setScrolled] = useState(false);

    const filteredResults = useMemo(() => {
        const sanitizedTerm = sanitizeName(deferredSearchTerm);
        if (sanitizedTerm === '') return fighters;
        return fighters.filter(fighter => {
            const fullName = sanitizeName(fighter.FirstName, fighter.LastName);
            return fullName.includes(sanitizedTerm);
        });
    }, [deferredSearchTerm, fighters]);
    
    useEffect(() => {
        setFilteredFighters(filteredResults);
    }, [filteredResults, setFilteredFighters]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
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
