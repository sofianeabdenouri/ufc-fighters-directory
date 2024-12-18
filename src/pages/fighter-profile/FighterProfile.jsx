import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './FighterProfile.css';
import NotFound from '../not-found/NotFound';

const FighterProfile = ({ favorites, toggleFavorite }) => {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [fighter, setFighter] = useState(location.state?.fighter || null);
    const [loading, setLoading] = useState(!fighter);
    const [error, setError] = useState(null);

    // Fetch fighter data if it's not available in the state
    useEffect(() => {
        if (!fighter) {
            console.log('Fetching fighter data for Fighter ID:', id);
            setLoading(true);
            const apiUrl = `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/fighters/${id}`;
            fetch(apiUrl)
                .then((response) => {
                    if (!response.ok) throw new Error('Failed to fetch fighter data');
                    return response.json();
                })
                .then((data) => {
                    console.log('Fetched Fighter Data:', data);
                    setFighter(data);
                })
                .catch((err) => {
                    console.error('Error fetching fighter data:', err);
                    setError('Fighter not found');
                })
                .finally(() => setLoading(false));
        }
    }, [id, fighter]);

    if (loading) return <div className="fighter-profile-container">Loading...</div>;

    if (error) {
        return (
            <div className="fighter-profile-container">
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Back to Directory</button>
            </div>
        );
    }

    if (!fighter) {
        return <NotFound />;
    }

    const {
        FirstName,
        LastName,
        Nickname,
        WeightClass,
        Wins,
        Losses,
        Draws,
        TechnicalKnockouts,
        Submissions,
        Height,
        Weight,
        Reach,
        BirthDate,
    } = fighter;

    // Function to sanitize and format names to match image filenames
    const sanitizeNameForImage = (firstName = '', lastName = '', nickname = '', isDuplicate = false) => {
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const cleanedFirst = firstName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .trim();

        const cleanedLast = lastName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .trim();

        const baseName = [capitalize(cleanedFirst), capitalize(cleanedLast)].filter(Boolean).join('_');

        if (isDuplicate && nickname) {
            const cleanedNickname = nickname
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '')
                .trim();
            return `${baseName}_${cleanedNickname.toLowerCase()}`;
        }

        return baseName;
    };

    // Construct image path
    const isDuplicate = fighter?.isDuplicate || false; // Default to false if not provided
    const imageUrl = `/assets/images/${sanitizeNameForImage(FirstName, LastName, Nickname, isDuplicate)}.png`;

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        if (
            today.getMonth() < birthDateObj.getMonth() ||
            (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())
        ) {
            age--;
        }
        return age;
    };

    const formatHeight = (heightInInches) => {
        if (!heightInInches || heightInInches <= 0) return 'N/A';
        const feet = Math.floor(heightInInches / 12);
        const inches = Math.round(heightInInches % 12);
        const cm = Math.round(heightInInches * 2.54);
        return `${feet}′ ${inches}″ / ${cm}cm`;
    };

    const formatReach = (reachInInches) => {
        if (!reachInInches || reachInInches <= 0) return 'N/A';
        const cm = Math.round(reachInInches * 2.54);
        return `${reachInInches}″ / ${cm}cm`;
    };

    const formatWeight = (weightInLbs) => {
        if (!weightInLbs || weightInLbs <= 0) return 'N/A';
        const kg = Math.round(weightInLbs * 0.453592);
        return `${weightInLbs} lbs / ${kg} kg`;
    };

    const isFavorite = favorites.includes(fighter.FighterId);

    return (
        <div className="fighter-profile-container">
            <div className="fighter-profile-details">
                <h1>{FirstName || 'Unknown'} {LastName || ''}</h1>
                <p><b>Age:</b> {calculateAge(BirthDate)}</p>
                <p><b>Nickname:</b> {Nickname || 'N/A'}</p>
                <p>
                    <b>Sex:</b>
                    <span>
                        {WeightClass?.includes("Women's") ? (
                            <>
                                <span style={{ color: "#ff69b4", fontSize: "14px" }}>♀</span> Female
                            </>
                        ) : (
                            <>
                                <span style={{ color: "#7faefd", fontSize: "14px" }}>♂</span> Male
                            </>
                        )}
                    </span>
                </p>
                <p><b>Weight Class:</b> {WeightClass || 'Unknown'}</p>
                <p><b>Wins:</b> {Wins || 0}</p>
                <p><b>Losses:</b> {Losses || 0}</p>
                <p><b>Draws:</b> {Draws || 0}</p>
                <p><b>Height:</b> {formatHeight(Height)}</p>
                <p><b>Reach:</b> {formatReach(Reach)}</p>
                <p><b>Weight:</b> {formatWeight(Weight)}</p>
                <p><b>Knockouts:</b> {TechnicalKnockouts || 0}</p>
                <p><b>Submissions:</b> {Submissions || 0}</p>

                <button className="fighter-profile-back-btn" onClick={() => navigate('/')}>
                    Back to Directory
                </button>
            </div>

            <div className="fighter-profile-image">
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

            <button onClick={() => toggleFavorite(fighter.FighterId)} className="profile-star-button">
                <img
                    src={isFavorite ? '/assets/images/star.png' : '/assets/images/star_gray.png'}
                    alt={isFavorite ? 'Favorited' : 'Not Favorited'}
                    className="profile-star-icon"
                />
            </button>
        </div>
    );
};

export default FighterProfile;
