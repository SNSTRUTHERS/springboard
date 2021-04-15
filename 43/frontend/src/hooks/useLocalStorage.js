import { useEffect, useState } from "react";

/**
 * Creates a state variable that synchronizes with localStorage.
 * 
 * @template T Type of value being stored.
 * 
 * @param {T}      defaultValue The initial value of the state variable.
 * @param {string} storageKey   The key to use to store the state in local storage.
 * 
 * @returns {[ T, React.Dispatch<T> ]} State variable and set state callback function.
 */
const useLocalStorage = (defaultValue, storageKey = "localStorageState") => {
    // read from local storage on first state read if available
    const [ state, setState ] = useState(
        JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(defaultValue))
    );
    
    // save to local storage on state write
    useEffect(() =>
        localStorage.setItem(storageKey, JSON.stringify(state)), [ storageKey, state ]
    );

    return [ state, setState ];
};

export default useLocalStorage;
