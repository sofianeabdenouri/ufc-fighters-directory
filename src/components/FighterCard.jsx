import React from 'react';
import { useNavigate } from 'react-router-dom';

const FighterCard = ({ fighter }) => {
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
    const formatName = (name) => {
        return name
            ? name.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() // Replace special characters and spaces with underscores
            : '';
    };

    const firstName = formatName(FirstName || ''); // Handle cases where only the first name exists
    const lastName = formatName(LastName || ''); // Handle cases where no last name is present

    // Construct image filename
    const imageName = `${firstName}${lastName ? `_${lastName}` : ''}.png`; // Handle case where there's no last name
    const imageUrl = `/src/common/images/${imageName}`; // Assuming your images are in this folder

    return (
        <div className="fighter-card">
            {Nickname && <p className="nickname">"{Nickname}"</p>}
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
                    <p className="hover-content">{NoContests} NC</p>
                </div>
            </div>

            {/* Visit Profile Button */}
            <button
                className="visit-profile-btn"
                onClick={() => navigate(`/fighter/${FighterId}`, { state: { fighter } })}
            >
                Visit Profile
            </button>
        </div>
    );
};

export default FighterCard;
