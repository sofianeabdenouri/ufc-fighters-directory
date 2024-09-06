import React, { useState, useEffect } from 'react';

const apiKey = '367273178ae34553a6df1f7b5b76089e';  // Your API key
const apiUrl = `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${apiKey}`;

function FighterCard({ fighter }) {
    // Helper function for singular/plural formatting
    const formatLabel = (count, singular, plural) => count === 1 ? singular : plural;

    return (
        <div className="fighter-card">
            {fighter.Nickname && <p>"{fighter.Nickname}"</p>} {/* Display nickname if it exists */}
            <h2>{fighter.FirstName} {fighter.LastName}</h2>
            <p>{fighter.WeightClass}</p>

            <div className="fighter-stats">
                <div className="wins">
                    <p>{fighter.Wins}</p>
                    <p>{fighter.TechnicalKnockouts} {formatLabel(fighter.TechnicalKnockouts, 'KO', 'KOs')}</p>
                    <p>{fighter.Submissions} {formatLabel(fighter.Submissions, 'SUB', 'SUBs')}</p>
                </div>
                <div className="losses">
                    <p>{fighter.Losses}</p>
                    <p>{fighter.TechnicalKnockoutLosses} {formatLabel(fighter.TechnicalKnockoutLosses, 'KO', 'KOs')}</p>
                    <p>{fighter.SubmissionLosses} {formatLabel(fighter.SubmissionLosses, 'SUB', 'SUBs')}</p>
                </div>
                <div className="draws">
                    <p>{fighter.Draws}</p>
                    <p>{formatLabel(fighter.Draws, 'Draw', 'Draws')}</p>
                    <p>{fighter.NoContests} {formatLabel(fighter.NoContests, 'NC', 'NCs')}</p>
                </div>
            </div>
        </div>
    );
}

function FighterList() {
    const [fighters, setFighters] = useState([]);

    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Filter out fighters with no records and ensure no duplicates
                const uniqueFighters = Array.from(new Set(data.map(f => f.FighterId)))
                    .map(id => data.find(f => f.FighterId === id))
                    .filter(fighter => fighter.Wins !== 0 || fighter.Losses !== 0 || fighter.Draws !== 0 || fighter.NoContests !== 0);

                setFighters(uniqueFighters);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="fighter-list">
            {fighters.map(fighter => (
                <FighterCard key={fighter.FighterId} fighter={fighter} />
            ))}
        </div>
    );
}

export default FighterList;
