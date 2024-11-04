import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import './SearchBar.css';

const sanitizeName = (name) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

function SearchBar({ fighters, setFilteredFighters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm); // Defer the search term
    const [scrolled, setScrolled] = useState(false);

    const filteredResults = useMemo(() => {
        const sanitizedTerm = sanitizeName(deferredSearchTerm);
        if (sanitizedTerm === '') return fighters;
        return fighters.filter(fighter => {
            const fullName = sanitizeName(`${fighter.FirstName} ${fighter.LastName}`);
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
