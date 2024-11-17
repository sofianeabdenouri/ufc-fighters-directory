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
        isDuplicate, // This will be passed in as part of the fighter object
    } = fighter;

    const navigate = useNavigate();

    // Function to sanitize names for image file paths
    const sanitizeNameForImage = (firstName = '', lastName = '', nickname = '', isDuplicate = false) => {
        const baseName = [firstName, lastName]
            .filter(Boolean)
            .join(' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/['-]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim();

        if (isDuplicate && nickname) {
            const sanitizedNickname = nickname
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/['-]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .trim();
            return `${baseName}_${sanitizedNickname}`;
        }

        return baseName;
    };

    // Construct the image path
    const getImageName = () => {
        if (!FirstName && !LastName) {
            // Unknown fighter: determine gender-based default
            const isFemale = WeightClass?.startsWith("Women's");
            return isFemale ? 'default_f.png' : 'default.png';
        }
        // Use nickname if fighter is a duplicate
        return `${sanitizeNameForImage(FirstName, LastName, Nickname, isDuplicate)}.png`;
    };

    const imageUrl = `/src/common/images/${getImageName()}`;

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
                        src={isFavorite ? '/src/common/images/star.png' : '/src/common/images/star_gray.png'}
                        alt={isFavorite ? 'Favorited' : 'Not Favorited'}
                        className="star-icon"
                    />
                </button>
            </div>

            <h2>{FirstName || 'Unknown'} {LastName || ''}</h2>
            <p>{WeightClass || 'Unknown'}</p>

            {/* Display the image */}
<div className="fighter-image">
    <img
        src={
            `${FirstName} ${LastName}`.trim() === "Maiara Amanajas dos Santos"
                ? '/src/common/images/default_f.png' // Special case for Maiara Amanajas dos Santos
                : imageUrl
        }
        alt={`${FirstName || 'Unknown'} ${LastName || ''}`}
        onError={(e) => {
            e.target.src = WeightClass?.startsWith("Women's")
                ? '/src/common/images/default_f.png' // Fallback for female unknown fighters
                : '/src/common/images/default.png'; // Fallback for male/unknown fighters
        }}
    />
</div>


            <div className="fighter-stats-box">
                <div className="fighter-stats wins">
                    <p>{Wins || 0}</p>
                    <p className="hover-content">{TechnicalKnockouts || 0} KOs<br />{Submissions || 0} SUBs</p>
                </div>
                <div className="fighter-stats losses">
                    <p>{Losses || 0}</p>
                    <p className="hover-content">{TechnicalKnockoutLosses || 0} KOs<br />{SubmissionLosses || 0} SUBs</p>
                </div>
                <div className="fighter-stats draws">
                    <p>{Draws || 0}</p>
                    <p className="hover-content">{NoContests || 0} NCs</p>
                </div>
            </div>

            {/* Visit Profile Button */}
            <button
                className="visit-profile-btn"
                onClick={handleNavigate}
            >
                Visit Profile
            </button>
        </div>
    );
};

export default FighterCard;
