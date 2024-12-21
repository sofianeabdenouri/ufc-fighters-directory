import React from 'react';
import { useNavigate } from 'react-router-dom';

const normalizeString = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/['-]/g, '') // Remove apostrophes and hyphens
        .trim();
};

const normalizeForComparison = (name) => {
    // Remove file extension if present
    const nameWithoutExtension = name.replace(/\.[^/.]+$/, '');
    
    // Replace both spaces and underscores with a common delimiter
    return normalizeString(nameWithoutExtension)
        .replace(/[\s_]+/g, ' ');
};

const matchNameToImage = (apiName, filename) => {
    const normalizedApiName = normalizeForComparison(apiName);
    const normalizedFilename = normalizeForComparison(filename);
    
    return normalizedApiName === normalizedFilename;
};

const sanitizeNameForImage = (firstName = '', lastName = '', nickname = '', isDuplicate = false) => {
    const fullName = `${firstName} ${lastName}`.trim();
    const normalizedName = normalizeForComparison(fullName)
        .replace(/\s+/g, '_'); // Convert spaces to underscores for filename

    if (isDuplicate && nickname) {
        const sanitizedNickname = normalizeForComparison(nickname)
            .replace(/\s+/g, '_');
        return `${normalizedName}_${sanitizedNickname}.png`;
    }

    return `${normalizedName}.png`;
};

// Utility function to remove accents from strings
const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Removes accents from characters
};

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
        isDuplicate, // Passed as part of the fighter object
    } = fighter;

    const navigate = useNavigate();

    // Construct the image path based on sanitized names
    const getImageName = () => {
        if (!FirstName && !LastName) {
            // Default images for unknown fighters
            const isFemale = WeightClass?.startsWith("Women's");
            return isFemale ? 'default_f.png' : 'default.png';
        }
        return `${sanitizeNameForImage(FirstName, LastName, Nickname, isDuplicate)}.png`;
    };

    // Correct image path to align with Vercel's file serving structure
    const imageUrl = `/assets/images/${getImageName()}`;

    const handleNavigate = () => {
        // Save the current scroll position
        sessionStorage.setItem('scrollPosition', window.scrollY);

        // Navigate to FighterProfile
        navigate(`/fighter/${FighterId}`, { state: { fighter } });
    };

    return (
        <div className="fighter-card">
            <div className="nickname-wrapper">
                {Nickname ? (
                    <p className="nickname">"{Nickname}"</p>
                ) : (
                    <p className="nickname">&nbsp;</p> // Placeholder if no nickname
                )}
                {/* Favorite Star Icon */}
                <button onClick={() => toggleFavorite(FighterId)} className="star-button">
                    <img
                        src={isFavorite ? '/assets/images/star.png' : '/assets/images/star_gray.png'}
                        alt={isFavorite ? 'Favorited' : 'Not Favorited'}
                        className="star-icon"
                    />
                </button>
            </div>

            <h2>{FirstName || 'Unknown'} {LastName || ''}</h2>
            <p>{WeightClass || 'Unknown'}</p>

            {/* Fighter Image */}
            <div className="fighter-image">
                <img
                    src={imageUrl}
                    alt={`${FirstName || 'Unknown'} ${LastName || ''}`}
                    onError={(e) => {
                        e.target.src = WeightClass?.startsWith("Women's")
                            ? '/assets/images/default_f.png'
                            : '/assets/images/default.png';
                    }}
                />
            </div>

            {/* Fighter Stats */}
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
