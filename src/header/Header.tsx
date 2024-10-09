import React from 'react';
import classes from './Header.module.css';
import imageSource from '../common/images/favicon.ico';
import videoSource from '../common/videos/backgroundvideo.mp4';

interface HeaderProps {
    scrollToFighters: () => void;
    conditionalRender?: boolean; // Optional prop to control rendering
}

const Header: React.FC<HeaderProps> = ({ scrollToFighters, conditionalRender = true }) => {
    if (!conditionalRender) {
        return null; // Prevent rendering if the condition is false
    }

    return (
        <div className={classes.Container}>
            <video autoPlay loop muted className={classes.Video}>
                <source src={videoSource} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className={classes.Content}>
                <div className={classes.SubContent}>
                    <h1>Welcome to the Ultimate Fighting Championship</h1>
                    <p>A World Where Mastery Meets Martial Arts and Legends Are Born</p>
                    <button type="button" className="btn btn-outline-dark" onClick={scrollToFighters}>
                        View UFC fighters
                    </button>
                    <img src={imageSource} alt="profile" />
                </div>
            </div>
        </div>
    );
};

export default Header;
