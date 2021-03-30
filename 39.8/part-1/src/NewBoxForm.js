import { useState } from "react";
import { v4 as uuid } from "uuid";
import "./NewBoxForm.css";

const INITIAL_FORM_DATA = {
    height: 1,
    width: 1,
    color: "#000000"
};

const NewBoxForm = ({ createBox }) => {
    const [ formData, setFormData ] = useState(INITIAL_FORM_DATA);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((formData) => ({ ...formData, [name]: value }));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        createBox({ ...formData, id: uuid() });
        setFormData(INITIAL_FORM_DATA);
    };

    return (
        <form className="NewBoxForm" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="width">Width</label>
                <input
                    onChange={handleChange}
                    type="number"
                    name="width"
                    min="1"
                    value={formData.width}
                    id="width"
                />
            </div>

            <div>
                <label htmlFor="height">Height</label>
                <input
                    onChange={handleChange}
                    type="number"
                    name="height"
                    min="1"
                    value={formData.height}
                    id="height"
                />
            </div>
            
            <div>
                <label htmlFor="color">Background Color</label>
                <input
                    onChange={handleChange}
                    type="color"
                    name="color"
                    value={formData.color}
                    id="color"
                />
            </div>

            <input id="NewBoxForm-submit" type="submit" value="Add Box" />
        </form>
    );
}

export default NewBoxForm;
