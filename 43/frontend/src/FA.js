import React from "react";

const FA = ({fas, icon, pulse, size, spin}) => <i
    className={`fa ${
        fas ? 'fas' : ''
    } fa-${icon} ${
        size ? `fa-${size}x` : ''
    } ${
        spin ? 'fa-spin' : ''
    } ${
        pulse ? 'fa-pulse' : ''
    }`}
    aria-hidden
/>;

export default FA;
