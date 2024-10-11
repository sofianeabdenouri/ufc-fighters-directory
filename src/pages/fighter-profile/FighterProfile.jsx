import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './FighterProfile.css';
import NotFound from '../not-found/NotFound'; // Import the NotFound component

const FighterProfile = ({ favorites, toggleFavorite }) => {
    const { state } = useLocation();
    const { id } = useParams(); // Get fighter ID from URL
    const navigate = useNavigate();

    const { fighter } = state || {}; // Fallback if state is missing
    
    // If fighter is not found in state, render the NotFound component
    if (!fighter) return <NotFound />;

    const imageName = `${fighter.FirstName}_${fighter.LastName}.png`;
    const imageUrl = `/src/common/images/${imageName}`;

    // Check if the fighter is a favorite
    const isFavorite = favorites.includes(fighter.FighterId);

    // Handle the favorite toggle click
    const handleToggleFavorite = () => {
        toggleFavorite(fighter.FighterId);
    };

    return (
        <div className="fighter-profile-container">
            <div className="fighter-profile-details">
                <h1>{fighter.FirstName} {fighter.LastName}</h1>
                <p>Nickname: {fighter.Nickname || "N/A"}</p>
                <p>Weight Class: {fighter.WeightClass}</p>
                <p>Wins: {fighter.Wins}</p>
                <p>Losses: {fighter.Losses}</p>
                <p>Draws: {fighter.Draws}</p>
                <p>Height: {fighter.Height} inches</p>
                <p>Weight: {fighter.Weight} lbs</p>
                <p>Reach: {fighter.Reach} inches</p>
                <p>Technical Knockouts: {fighter.TechnicalKnockouts}</p>
                <p>Submissions: {fighter.Submissions}</p>
                <p>Birthdate: {new Date(fighter.BirthDate).toLocaleDateString()}</p>

                {/* Back Button */}
                <button className="fighter-profile-back-btn" onClick={() => navigate('/')}>
                    Back to Directory
                </button>
            </div>

            <div className="fighter-profile-image">
                <img src={imageUrl} alt={`${fighter.FirstName} ${fighter.LastName}`} onError={(e) => { e.target.src = '/src/common/images/default.png'; }} />
            </div>

            {/* Favorite Star Icon positioned next to the Back button */}
            <button onClick={handleToggleFavorite} className="profile-star-button">
                <img
                    src={isFavorite ? "/src/common/images/star.png" : "/src/common/images/star_gray.png"}
                    alt={isFavorite ? "Favorited" : "Not Favorited"}
                    className="profile-star-icon"
                />
            </button>
        </div>
    );
};

export default FighterProfile;
