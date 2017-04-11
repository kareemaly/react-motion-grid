import React from 'react';
import ReactDOM from 'react-dom';
import MotionGrid from './MotionGrid/test';

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

ReactDOM.render(<MotionGrid />, document.getElementById("root"));