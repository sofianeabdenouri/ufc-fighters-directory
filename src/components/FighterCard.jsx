import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import the hook for navigation

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
        NoContests
    } = fighter;

    const navigate = useNavigate(); // Get the navigate function

    // Construct the image filename based on the fighter's first and last name
    const imageName = `${FirstName}_${LastName}.png`;
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
                    onError={(e) => { e.target.src = '/src/common/images/default.png'; }} 
                />
            </div>

            <div className="fighter-stats-box">
                <div className="fighter-stats wins">
                    <p>{Wins}</p>
                    <p className="hover-content">{TechnicalKnockouts} KOs<br/>{Submissions} SUBs</p>
                </div>
                <div className="fighter-stats losses">
                    <p>{Losses}</p>
                    <p className="hover-content">{TechnicalKnockoutLosses} KOs<br/>{SubmissionLosses} SUBs</p>
                </div>
                <div className="fighter-stats draws">
                    <p>{Draws}</p>
                    <p className="hover-content">{NoContests} NC</p>
                </div>
            </div>

            {/* Visit Profile Button */}
            <button 
                className="visit-profile-btn" 
                onClick={() => navigate(`/fighter/${FighterId}`, { state: { fighter } })} // Pass the fighter data as state
            >
                Visit Profile
            </button>
        </div>
    );
};

export default FighterCard;
