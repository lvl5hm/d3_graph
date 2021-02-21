import * as React from 'react';
import * as d3 from 'd3';
const { sqrt, PI: pi, E: e } = Math;

const makeNormalDistributionFn = (mean: number, std: number) => {
    return (x: number) => 1/(std*sqrt(2*pi))*e**(-0.5*((x - mean)/std)**2);
};

export const bellCurve = () => {
    const w = 600;
    const h = 400;
    const pad = 60;
    const xDomain = [-6, 6];
    const yDomain = [0, 0.5];

    const svg = d3.select(document.body)
        .append('svg')
            .attr('width', w + pad*2)
            .attr('height', h + pad*2)
        .append('g')
            .attr('transform', `translate(${pad}, ${pad})`);

    const initialX = d3.scaleLinear()
        .domain(xDomain)
        .range([0, w]);
    const initialY = d3.scaleLinear()
        .domain(yDomain)
        .range([h, 0]);

    const xAxis = svg.append('g')
        .attr('transform', `translate(0, ${initialY(0)})`)
        .call(d3.axisBottom(initialX));

    const yAxis = svg.append('g')
        .call(d3.axisLeft(initialY));

    const clip = svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', w)
        .attr('height', h)
        .attr('x', 0)
        .attr('y', 0);

    const zoom = d3.zoom()
        .scaleExtent([0.1, 20])
        .extent([[0, 0], [w, h]])
        .on('zoom', handleZoom);

    const line = svg.append('path')
        .attr('class', 'line')
        .attr('clip-path', 'url(#clip)');

    svg.append('rect') 
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(zoom);


    let x = initialX;
    let y = initialY;
    let mean = 0;
    let std = 1;

    updateLine();

    function bellCurve(x: number) {
        return 1/(std*sqrt(2*pi))*e**(-0.5*((x - mean)/std)**2);
    }

    function updateLine() {
        const d = d3.line()(x.ticks(100).map(xi => [x(xi), y(bellCurve(xi))]))
        line.attr('d', d);
    }

    function setBellCurveConstants(newMean: number, newStd: number) {
        mean = newMean;
        std = newStd;
        updateLine();
    }
    
    function handleZoom(zoomEvent?) {
        x = zoomEvent?.transform.rescaleX(initialX) ?? initialX;
        y = zoomEvent?.transform.rescaleY(initialY) ?? initialY;

        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));

        updateLine();
    }

    return {
        setBellCurveConstants,
    };
};
