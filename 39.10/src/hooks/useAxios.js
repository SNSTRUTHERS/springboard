import axios from "axios";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import useLocalStorage from "./useLocalStorage";

/**
 * Creates a new array state variable that receives updated contents from a web URL.
 * 
 * @param {string}        baseURL Base URL of the web get request.
 * @param {string?}       key     Key to associate with the state variable. Undefined to not save
 *                                in localStorage.
 * @param {(data) => any} filter  Optional callback for filtering response data when updating
 *                                state variable elements.
 * 
 * @returns {[
 *     any[],
 *     (string?) => PromiseLike<void>
 * ]} State variable array & function to call to append new data.                                                
 */
const useAxios = (baseURL, key = undefined, filter = undefined) => {
    const hook = key ? useLocalStorage.bind(window, key) : useState;
    const [ elements, setElements ] = hook([]);

    const updateElements = async (entrypoint = undefined) => {
        let { data } = await axios.get(`${baseURL}${entrypoint ? `/${entrypoint}` : ''}/`);
        data = filter ? filter(data) : data;

        console.log(elements, data);
        setElements([...elements, { ...data, id: uuid() }]);
    };

    return [ elements, updateElements ];
};

export default useAxios;
