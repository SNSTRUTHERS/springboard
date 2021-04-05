import React, { useRef } from "react";
import { useHistory } from "react-router-dom";

import Nav from "./Nav";

import "./ColorForm.css";

const ColorForm = ({ callAddColor }) => {
    const colorInput = useRef();
    const nameInput  = useRef();

    const history = useHistory();

    const onSubmit = (event) => {
        event.preventDefault();

        try {
            callAddColor({
                name: nameInput.current.value,
                color: colorInput.current.value
            });

            history.push(`/colors/${nameInput.current.value}`);
        } catch (error) {
            alert(error.message);
        }
    };

    return <>
        <Nav />
        <form className="ColorForm" onSubmit={onSubmit}>
            <input
                type="color"
                name="color"
                ref={colorInput}
                required
            />
            <br />
            
            <input
                type="text"
                name="name"
                placeholder="Name"
                ref={nameInput}
                required
            />
            <br />

            <input
                type="submit"
                value="Add Color"
            />
        </form>
    </>;
};

export default ColorForm;
