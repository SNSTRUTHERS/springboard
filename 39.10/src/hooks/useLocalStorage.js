import React, { useEffect, useState } from "react";

/**
 * Creates a state variable that synchronizes with localStorage.
 * 
 * @template T Type of value being stored.
 * 
 * @param {string} key          The key to use to store the state in local storage.
 * @param {T}      defaultValue The initial value of the state variable.
 * 
 * @returns {[ T, React.Dispatch<T> ]} State variable and set state callback function.
 */
const useLocalStorage = (key, defaultValue) => {
    const [ state, setState ] = useState(() => {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
        return value;
    });
    useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [ key, state ]);

    return [ state, setState ];
};

export default useLocalStorage;
