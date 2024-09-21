import React from 'react';
import classes from './Header.module.css';
import imageSource from '../common/images/favicon.ico';
import videoSource from '../common/videos/backgroundvideo.mp4';

const Header: React.FC = () => {
    return (
        <div className={classes.Container} >
            <video
                autoPlay
                loop
                muted
                className={classes.Video} >
                <source src={videoSource} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className={classes.Content}>
                <div className={classes.SubContent} >
                    <h1>Welcome to the World of Mixed Martial Arts</h1>
                    <p>A World of Great Stories & Beautiful Beyond your Wildest Dreams</p>
                    <a href="#fighters">
                        <button type="button" className="btn btn-outline-dark">View UFC fighters</button>
                    </a>
                    <img src={imageSource} alt="profile" />
                </div>
            </div>
        </div>
    )
}

export default Header;
