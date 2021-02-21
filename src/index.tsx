import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Chart } from './Chart/Chart';
import './index.css'

render(<Chart />, document.querySelector('#react-root'));
