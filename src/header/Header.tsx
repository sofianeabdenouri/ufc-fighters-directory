import React from 'react';
import classes from './Header.module.css';
import imageSource from '../common/images/favicon.ico';
import videoSource from '../common/videos/backgroundvideo.mp4';

interface HeaderProps {
  scrollToFighters: () => void;
  conditionalRender?: boolean;
}

const Header: React.FC<HeaderProps> = ({ scrollToFighters, conditionalRender = true }) => {
  if (!conditionalRender) return null;

  return (
    <div className={classes.Container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={classes.Video}
        aria-hidden="true"
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={classes.VideoOverlay} />

      <div className={classes.Content}>
        <div className={classes.SubContent}>
          <h1>Welcome to the Mixed Marial Arts</h1>
          <p>The World of New Age Gladiators</p>
          <button type="button" onClick={scrollToFighters}>
            View MMA fighters
          </button>
          <img src={imageSource} alt="profile" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export default Header;
