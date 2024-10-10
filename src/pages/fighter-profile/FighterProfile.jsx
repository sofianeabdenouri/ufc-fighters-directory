import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FighterProfile.css';

const FighterProfile = ({ isFavorite, toggleFavorite }) => {
    const { state } = useLocation();
    const { fighter } = state || {};
    const navigate = useNavigate();

    if (!fighter) {
        return <p>No fighter data found.</p>;
    }

    const imageName = `${fighter.FirstName}_${fighter.LastName}.png`;
    const imageUrl = `/src/common/images/${imageName}`;

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
            <button onClick={() => toggleFavorite(fighter.FighterId)} className="profile-star-button">
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
