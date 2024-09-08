import React from 'react';

const FighterCard = ({ fighter }) => {
    const {
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
        Nocontests
    } = fighter;

    // Construct the image filename based on the fighter's first and last name
    const imageName = `${FirstName}_${LastName}.png`;
    const imageUrl = `/src/assets/images/${imageName}`; // Assuming your images are in this folder

    // Helper function for singular/plural formatting and 0 case
    const formatLabel = (count, singular, plural) => {
        if (count === 0) return singular; // No 's' for zero
        return count === 1 ? singular : plural;
    };

    return (
        <div className="fighter-card">
            {Nickname && <p className="nickname">"{Nickname}"</p>}
            <h2>{FirstName} {LastName}</h2>
            <p>{WeightClass}</p>

            {/* Display the image */}
            <div className="fighter-image">
                <img src={imageUrl} alt={`${FirstName} ${LastName}`} onError={(e) => { e.target.src = '/src/assets/images/default.png'; }} />
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
                    <p className="hover-content">{Nocontests} NC</p>
                </div>
            </div>
        </div>
    );
};

export default FighterCard;
