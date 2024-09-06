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

    // Helper function for singular/plural formatting and 0 case
    const formatLabel = (count, singular, plural) => {
        if (count === 0) return singular; // No 's' for zero
        return count === 1 ? singular : plural;
    };

    return (
        <div className="fighter-card">
            {Nickname && <p className="nickname">"{Nickname}"</p>} {/* Display nickname if it exists */}
            <h2>{FirstName} {LastName}</h2>
            <p>{WeightClass}</p>
            
            <div className="fighter-stats">
                <div className="wins">
                    <p>{Wins}</p>
                    <p>{TechnicalKnockouts} {formatLabel(TechnicalKnockouts, 'KO', 'KOs')}</p>
                    <p>{Submissions} {formatLabel(Submissions, 'SUB', 'SUBs')}</p>
                </div>
                <div className="losses">
                    <p>{Losses}</p>
                    <p>{TechnicalKnockoutLosses} {formatLabel(TechnicalKnockoutLosses, 'KO', 'KOs')}</p>
                    <p>{SubmissionLosses} {formatLabel(SubmissionLosses, 'SUB', 'SUBs')}</p>
                </div>
                <div className="draws">
                    <p>{Draws}</p>
                    <p>{formatLabel(Draws, 'Draw', 'Draws')}</p> {/* Apply singular/plural formatting logic for Draws */}
                    <p>{Nocontests} {formatLabel(Nocontests, 'NC', 'NCs')}</p> {/* Apply same logic for NCs */}
                </div>
            </div>
        </div>
    );
};

export default FighterCard;
