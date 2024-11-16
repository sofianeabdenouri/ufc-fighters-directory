import React from 'react';
import { useNavigate } from 'react-router-dom';

const FighterCard = ({ fighter, isFavorite, toggleFavorite }) => {
    const {
        FighterId,
        FirstName,
        LastName,
        Nickname,
        WeightClass,
        Wins,
        Losses,
        Draws,
        TechnicalKnockouts,
        TechnicalKnockoutLosses,
        Submissions,
        SubmissionLosses,
        NoContests,
    } = fighter;

    const navigate = useNavigate();

    // Function to clean and format fighter names for image file names
    const sanitizeNameForImage = (firstName = '', lastName = '') => {
        const fullName = [firstName, lastName]
            .filter(Boolean)
            .join(' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/['-]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();
        return fullName;
    };

    // Construct image filename
    const imageName = `${sanitizeNameForImage(FirstName, LastName)}.png`;
    const imageUrl = `/src/common/images/${imageName}`;

    const handleNavigate = () => {
        // Save the current scroll position
        sessionStorage.setItem('scrollPosition', window.scrollY);

        // Navigate to the fighter's profile
        navigate(`/fighter/${FighterId}`, { state: { fighter } });
    };

    return (
        <div className="fighter-card">
            <div className="nickname-wrapper">
                {Nickname ? (
                    <p className="nickname">"{Nickname}"</p>
                ) : (
                    <p className="nickname">&nbsp;</p> // Render a non-breaking space if no nickname
                )}
                {/* Favorite Star Icon positioned next to the nickname */}
                <button onClick={() => toggleFavorite(FighterId)} className="star-button">
                    <img
                        src={isFavorite ? "/src/common/images/star.png" : "/src/common/images/star_gray.png"}
                        alt={isFavorite ? "Favorited" : "Not Favorited"}
                        className="star-icon"
                    />
                </button>
            </div>

            <h2>{FirstName} {LastName}</h2>
            <p>{WeightClass}</p>

            {/* Display the image */}
            <div className="fighter-image">
                <img
                    src={imageUrl}
                    alt={`${FirstName} ${LastName}`}
                    onError={(e) => { e.target.src = '/src/common/images/default.png'; }} // Fallback to default image
                />
            </div>

            <div className="fighter-stats-box">
                <div className="fighter-stats wins">
                    <p>{Wins}</p>
                    <p className="hover-content">{TechnicalKnockouts} KOs<br />{Submissions} SUBs</p>
                </div>
                <div className="fighter-stats losses">
                    <p>{Losses}</p>
                    <p className="hover-content">{TechnicalKnockoutLosses} KOs<br />{SubmissionLosses} SUBs</p>
                </div>
                <div className="fighter-stats draws">
                    <p>{Draws}</p>
                    <p className="hover-content">{NoContests} NCs</p>
                </div>
            </div>

            {/* Visit Profile Button */}
            <button
                className="visit-profile-btn"
                onClick={handleNavigate} // Use the updated handler
            >
                Visit Profile
            </button>
        </div>
    );
};

export default FighterCard;
