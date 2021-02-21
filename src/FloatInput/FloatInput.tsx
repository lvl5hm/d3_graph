import * as React from 'react';
import { useState, useEffect } from 'react';
import './FloatInput.css';

interface FloatInputProps {
    onBlur: (v: number) => void;
    value: number;
    label: string;
}

export const FloatInput: React.FC<FloatInputProps> = ({ value: propsValue, onBlur, label }) => {
    const [value, setValue] = useState(propsValue.toString());
    useEffect(() => {
        setValue(propsValue.toFixed(3));
    }, [propsValue]);

    return <div className="floatInputWrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <label>{label}</label>
        <input
            type="number" 
            placeholder="std" 
            value={value} 
            onChange={e => setValue(e.target.value)}
            onBlur={() => {
                const parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) {
                    setValue(propsValue.toFixed(3));
                } else {
                    onBlur(parsedValue);
                }
            }}
        />
    </div>
};