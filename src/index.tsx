import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { render } from 'react-dom';
import * as d3 from 'd3';
import { FloatInput } from './FloatInput/FloatInput';
import './index.css'
import { chordTranspose } from 'd3';

const { sqrt, PI: pi, E: e } = Math;

const makeNormalDistributionFn = (mean: number, std: number) => {
    return (x: number) => 1/(std*sqrt(2*pi))*e**(-0.5*((x - mean)/std)**2);
};


const Chart = () => {
    const MAX_DEVIATIONS = 3;
    const MIN_DEVIATION_SIZE = 1e-3;
    const PLOT_POINT_COUNT = 300;
    const DEFAULT_X_DOMAIN = 4;
    const DEFAULT_Y_DOMAIN = 0.5;

    const WIDTH = 900;
    const HEIGHT = 500;
    const MARGIN = 60;
    const PADDING = 30;


    const ref = useRef<SVGSVGElement|null>(null);
    const [mean, setMean] = useState(0);
    const [std, setStd] = useState(1);
    const [zoom, setZoom] = useState(1);
    const plotSvg = useRef<any>({});


    const max = mean + std*MAX_DEVIATIONS;
    const min = mean - std*MAX_DEVIATIONS;
    const f = makeNormalDistributionFn(mean, std);

    useEffect(() => {
        const p = plotSvg.current;

        p.x = d3.scaleLinear().range([0, WIDTH]);
        p.y = d3.scaleLinear().range([HEIGHT, 0]);

        p.svg = d3.select(ref.current)
            .attr('width', WIDTH + MARGIN)
            .attr('height', HEIGHT + MARGIN)
            .on('mousemove', function(e) {
                const tooltipX = d3.pointer(e)[0];
                const lineX = p.x.invert(tooltipX - PADDING);
                const lineY = p.f(lineX);
                const tooltipY = p.y(lineY) + PADDING;
                tooltip
                    .attr('cx', tooltipX)
                    .attr('cy', tooltipY)
                tooltipText
                    .attr('x', tooltipX)
                    .attr('y', tooltipY - 10)
                    .html(`(x: ${lineX.toFixed(3)}; y: ${lineY.toFixed(3)})`);
            });
    
        p.plot = p.svg.append('g')
            .attr('class', 'plot')
            .attr('transform', `translate(${PADDING}, ${PADDING})`)
            
        p.xAxis = d3.axisBottom(p.x);
        p.yAxis = d3.axisLeft(p.y);
        
        p.plot.append('g')
            .attr('class', 'xAxis axis')
            .attr('transform', `translate(0, ${p.y(0)})`);
        p.plot.append('g')
            .attr('class', 'yAxis axis')
            .attr('transform', `translate(${p.x(0)}, 0)`);

        const handleStdDrag = d3.drag()
            .on('drag', (event) => {
                const newStd = Math.max(MIN_DEVIATION_SIZE, p.x.invert(event.x) - p.mean);
                setStd(newStd);
            });

        p.dragStd = p.plot.append('line')
            .attr('class', 'drag std')
            .call(handleStdDrag);

        const handleMeanDrag = d3.drag()
            .on('drag', (event) => {
                setMean(mean => mean - p.x.invert(event.x));
            });

        p.dragMean = p.plot.append('line')
            .attr('class', 'drag mean')
            .call(handleMeanDrag);

        p.line = p.plot.append('path')
            .attr('class', 'line');

        const tooltip = p.svg.append('circle')
            .attr('class', 'tooltip')
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', 0);

        const tooltipText = p.svg.append('text')
            .attr('class', 'tooltip');
    }, []);

    useEffect(() => {
        const p = plotSvg.current;

        p.x.domain([-DEFAULT_X_DOMAIN*zoom + mean, DEFAULT_X_DOMAIN*zoom + mean]);
        p.y.domain([0, DEFAULT_Y_DOMAIN*zoom]);

        p.plot.select('.xAxis')
            .call(p.xAxis);
        p.plot.select('.yAxis')
            .call(p.yAxis)
            .attr('transform', `translate(${p.x(0)}, 0)`);
    }, [zoom, mean]);

    useEffect(() => {
        const p = plotSvg.current;

        const line = d3.line()(p.x.ticks(PLOT_POINT_COUNT).map(xi => [p.x(xi), p.y(f(xi))]))
        p.line.attr('d', line);
        
        p.dragMean
            .attr('x1', p.x(0))
            .attr('y1', p.y(0) + 6)
            .attr('x2', p.x(0))
            .attr('y2', p.y(0.5*zoom));
        
        p.dragStd
            .attr('x1', p.x(std + mean))
            .attr('y1', p.y(0))
            .attr('x2', p.x(std + mean))
            .attr('y2', p.y(f(mean + std)));

        p.mean = mean;
        p.std = std;
        p.f = f;
    }, [mean, std, zoom]);

    return <div>
        <svg
            ref={ref}
            onWheel={e => {
                const newZoom = Math.max(0.1, Math.min(10, zoom*(1 + e.deltaY*0.001)));
                setZoom(newZoom);
            }}
        />
        <div className="inputs">
            <FloatInput
                label="mean"
                value={mean} 
                onBlur={setMean} 
            />
            <FloatInput 
                label="std" 
                value={std} 
                onBlur={setStd} 
            />
            <FloatInput 
                label="min" 
                value={min} 
                onBlur={nMin => {
                    const nMean = (max + nMin)/(2);
                    const nStd = (max - nMean)/MAX_DEVIATIONS;
                    setMean(nMean);
                    setStd(nStd)
                }}
            />
            <FloatInput 
                label="max" 
                value={max} 
                onBlur={nMax => {
                    const nMean = (min + nMax)/(2);
                    const nStd = (nMax - nMean)/MAX_DEVIATIONS;
                    setMean(nMean);
                    setStd(nStd)
                }} 
            />
        </div>
    </div>;
}


const App = () => {
    return <div><Chart /></div>
}

render(<App />, document.querySelector('#react-root'));
