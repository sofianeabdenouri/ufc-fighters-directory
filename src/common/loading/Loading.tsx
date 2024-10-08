import React from 'react';
import classes from './Loading.module.css';

const  Loading: React.FC = () => {
    return (
        <div className={classes.Loading}>
            <div className={classes.Loader} />
            <p>Loading Fighters</p>
        </div>
    )
}

export default Loading