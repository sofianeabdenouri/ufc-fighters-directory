import React from 'react';
import { useNavigate } from 'react-router-dom';

// Function to sanitize and format names to match image filenames
const sanitizeNameForImage = (firstName = '', lastName = '', nickname = '', isDuplicate = false) => {
    const normalizeAndClean = (str) =>
        str
            .normalize('NFD') // Remove diacritics
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/'/g, '') // Remove apostrophes
            .replace(/\./g, '') // Remove periods
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/-/g, '') // Remove hyphens 
            .trim(); // Trim extra whitespace

    const adaptToFilenames = (str, isLastName = false) => {
        if (isLastName) {
            return str
                .replace(/\b(de|da|dos|del|la)\b/g, (match) => match.toLowerCase()) // Prepositions lowercase
                .replace(/\b(Di|La|Mc|Mac|Al|Van)([A-Za-z]+)/g, (match, p1, p2) => `${p1}${p2.toLowerCase()}`) // "McGregor" -> "Mcgregor"
            }
        return str // First names 
        .replace(/\b(KJ|JC|KB|JP|CB|BJ|CM|TJ|JJ|AJ|CJ)\b/g, (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()) // "TJ" -> "Tj"
        .replace(/\b(Sang|Won|Su|Dong|Mar|Chang|Ye|Le|De|Da|Hyun|Jeong|Min|Jun|Seung)([A-Za-z]+)/g, (match, p1, p2) => `${p1}${p2.toLowerCase()}`); 

    };

    const cleanedFirst = adaptToFilenames(normalizeAndClean(firstName));
    const cleanedLast = adaptToFilenames(normalizeAndClean(lastName), true);
    const baseName = [cleanedFirst, cleanedLast].filter(Boolean).join('_');

    if (isDuplicate && nickname) {
        const cleanedNickname = normalizeAndClean(nickname);
        return `${baseName}_${cleanedNickname}`;
    }

    return baseName;
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
