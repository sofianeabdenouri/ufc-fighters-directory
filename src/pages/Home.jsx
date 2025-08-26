import React, { useState, useEffect, useRef } from 'react';
import FighterList from '../components/FighterList';
import SearchBar from '../components/SearchBar';
import AdvancedSearch from '../components/AdvancedSearch';
import Pagination from '../components/Pagination';
import ScrollToTopButton from '../components/ScrollToTopButton';

function Home() {
  // TODO: on va migrer ici tous les states, fetch, handlers, etc.
  return (
    <div className="home-container">
      <h1 className="font-h1">MMArec</h1>
      <h5 className="description">Live up-to-date records for every fighter</h5>

      {/* SearchBar */}
      <SearchBar />

      {/* Advanced Filters */}
      <AdvancedSearch />

      {/* Fighter List */}
      <FighterList />

      {/* Pagination */}
      <Pagination />

      {/* Scroll to Top */}
      <ScrollToTopButton />
    </div>
  );
}

export default Home;
