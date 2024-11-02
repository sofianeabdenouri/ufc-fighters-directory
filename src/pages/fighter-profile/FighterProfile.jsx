// FighterProfile.jsx
import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './FighterProfile.css';
import NotFound from '../not-found/NotFound';

const FighterProfile = ({ favorites, toggleFavorite }) => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const { fighter } = state || {};

    if (!fighter) return <NotFound />;

    // Utility function to sanitize fighter names for image paths
    const sanitizeNameForImage = (firstName = '', lastName = '') => {
        // Join composed names if both are present
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

    // Apply the sanitization logic for first and last names
    const imageName = sanitizeNameForImage(fighter.FirstName, fighter.LastName);
    const imageUrl = `/src/common/images/${imageName}.png`;

    const isFavorite = favorites.includes(fighter.FighterId);

    const handleToggleFavorite = () => {
        toggleFavorite(fighter.FighterId);
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="fighter-profile-container">
            <div className="fighter-profile-details">
                <h1>{fighter.FirstName} {fighter.LastName}</h1>
                <p>Age: {calculateAge(fighter.BirthDate)}</p>
                <p>Nickname: {fighter.Nickname || 'N/A'}</p>
                <p>Weight Class: {fighter.WeightClass}</p>
                <p>Wins: {fighter.Wins}</p>
                <p>Losses: {fighter.Losses}</p>
                <p>Draws: {fighter.Draws}</p>
                <p>Height: {fighter.Height} inches</p>
                <p>Weight: {fighter.Weight} lbs</p>
                <p>Reach: {fighter.Reach} inches</p>
                <p>Technical Knockouts: {fighter.TechnicalKnockouts}</p>
                <p>Submissions: {fighter.Submissions}</p>

                <button className="fighter-profile-back-btn" onClick={() => navigate('/')}>
                    Back to Directory
                </button>
            </div>

            <div className="fighter-profile-image">
                <img
                    src={imageUrl}
                    alt={`${fighter.FirstName} ${fighter.LastName}`}
                    onError={(e) => { e.target.src = '/src/common/images/default.png'; }}
                />
            </div>

            <button onClick={handleToggleFavorite} className="profile-star-button">
                <img
                    src={isFavorite ? '/src/common/images/star.png' : '/src/common/images/star_gray.png'}
                    alt={isFavorite ? 'Favorited' : 'Not Favorited'}
                    className="profile-star-icon"
                />
            </button>
        </div>
    );
};

export default FighterProfile;
