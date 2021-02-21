import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { FloatInput } from '../FloatInput/FloatInput';
import { makeBellCurve } from './bellCurve';
import './Chart.css'

export const Chart = () => {
    const MAX_DEVIATIONS = 3;
    const MIN_STD_VALUE = 1e-3;

    const [mean, setMean] = useState(0);
    const [std, setStdUnchecked] = useState(1);
    const setStd = (newStd: number) => setStdUnchecked(Math.max(MIN_STD_VALUE, newStd));

    const max = mean + std*MAX_DEVIATIONS;
    const min = mean - std*MAX_DEVIATIONS;

    const chartRef = useRef<SVGSVGElement>(null);
    const bellCurve = useRef((mean: number, std: number) => {});

    useEffect(() => {
        // makeBellCurve returns a function that updates the chart when provided with mean and std
        bellCurve.current = makeBellCurve(chartRef.current, mean, std, setMean, setStd);
    }, []);

    useEffect(() => {
        bellCurve.current(mean, std);
    }, [mean, std]);

    return <div>
        <svg ref={chartRef} />
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