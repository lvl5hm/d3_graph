import * as d3 from 'd3';
const { sqrt, PI: pi, E: e } = Math;

type ChangeHandler = (v: number) => void;

export const makeBellCurve = (element: SVGSVGElement, initialMean: number, initialStd: number, onMeanChange: ChangeHandler, onStdChange: ChangeHandler) => {
    if (!element) throw new Error(`element should not be ${element}`);

    const w = 600;
    const h = 400;
    const pad = 60;
    const xDomain = [-6, 6];
    const yDomain = [0, 0.5];

    const wrapper = d3.select(element)
            .attr('width', w + pad*2)
            .attr('height', h + pad*2)
        .append('g')
            .attr('class', 'overlay')
            .attr('transform', `translate(${pad}, ${pad})`);

    const initialX = d3.scaleLinear()
        .domain(xDomain)
        .range([0, w]);
    const initialY = d3.scaleLinear()
        .domain(yDomain)
        .range([h, 0]);

    const xAxis = wrapper.append('g')
        .attr('transform', `translate(0, ${initialY(0)})`)

    const yAxis = wrapper.append('g')

    wrapper.append('defs')
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

    const plot = wrapper.append('g')
        .attr('clip-path', 'url(#clip)');

    plot.append('text')
        .attr('class', 'hint')
        .text('drag & scroll the plot\n for panning and zooming')
        .attr('x', 10)
        .attr('y', 30);


    const line = plot.append('path')
        .attr('class', 'line');


    const tooltip = plot.append('text')
        .attr('class', 'tooltip');

    plot.append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mousemove', (e) => {
            const pos = d3.pointer(e);
            tooltip
                .attr('x', pos[0])
                .attr('y', pos[1] - 20)
        })
        .call(zoom);


    // x and y scales change when zooming and panning
    let x = initialX;
    let y = initialY;
    let mean = initialMean;
    let std = initialStd;

    // anchors for changing mean and std
    // when dragged, they call onChange() callbacks so
    // the react component can set its input values
    const meanAnchor = plot.append('circle')
        .attr('class', 'anchor')
        .attr('r', 5)
        .call(hoverTooltip('drag to change mean'))
        .call(d3.drag().on('drag', (e) => {
            onMeanChange(x.invert(e.x));
        }));

    const stdAnchor = plot.append('circle')
        .attr('class', 'anchor')
        .attr('r', 5)
        .call(hoverTooltip('drag to change std'))
        .call(d3.drag().on('drag', (e) => {
            onStdChange(x.invert(e.x) - mean);
        }));

    handleZoom();

    function hoverTooltip(text: string) {
        return (selection) => selection
            .on('mouseover', (e) => {
                if (!e.buttons) {
                    tooltip
                    .text(text)
                    .style('opacity', 1);
                }
            })
            .on('mouseout', () => {
                tooltip
                    .style('opacity', 0);
            });
    }

    function bellCurve(x: number) {
        return 1/(std*sqrt(2*pi))*e**(-0.5*((x - mean)/std)**2);
    }

    function updatePlot() {
        const d = d3.line()(x.ticks(200).map(xi => [x(xi), y(bellCurve(xi))]))
        line.attr('d', d);

        meanAnchor
            .attr('cx', x(mean))
            .attr('cy', y(bellCurve(mean)));

        stdAnchor
            .attr('cx', x(mean + std))
            .attr('cy', y(bellCurve(mean + std)));
    }

    function setBellCurveConstants(newMean: number, newStd: number) {
        mean = newMean;
        std = newStd;
        updatePlot();
    }
    
    function handleZoom(zoomEvent?) {
        x = zoomEvent?.transform.rescaleX(initialX) ?? initialX;
        y = zoomEvent?.transform.rescaleY(initialY) ?? initialY;

        xAxis.call(d3.axisBottom(x).tickSizeInner(-h));
        yAxis.call(d3.axisLeft(y).tickSizeInner(-w));

        updatePlot();
    }

    return setBellCurveConstants;
};
