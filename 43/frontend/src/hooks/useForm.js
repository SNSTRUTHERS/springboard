import { useState } from "react";

/**
 * Sets up state & callbacks needed for operating a form.
 * 
 * @template {{ [s: string]: any }} T Specific object type containing form data.
 * 
 * @param {T} initData Data to initialize form data with.
 * @param {(formData: Readonly<T>) => (void | PromiseLike<void>)} submitCallback
 * Function to call on form submit.
 * @param {{
 *      [field: string] : (field: string, value: any, formData: Readonly<T>) => boolean | undefined
 * }} validators Set of functions to use when validating fields.
 * 
 * @returns {{
 *      formData: Readonly<T>,
 *      valid: Readonly<{ [s: string]: boolean }>,
 *      onChange: React.ChangeEventHandler<HTMLInputElement>,
 *      onSubmit: React.FormEventHandler<HTMLFormElement>,
 *      submitting: boolean
 * }} Form data, onChange event handler for form inputs, onSubmit event handler for form, and
 *    boolean listing whether the form is currently submitting.
 */
const useForm = (initData, submitCallback, validators = {}) => {
    const [ formData, setFormData ] = useState(initData);
    const [ valid, setValid ] = useState({});
    const [ submitting, setSubmitting ] = useState(false);

    const onChange = ({ nativeEvent: { target: { type } }, target: { name, value, checked } }) => {
        // validate fields
        if (validators[name] && typeof(validators[name]) === 'function')
            setValid({ ...valid, [name]: validators[name](name, value, formData) });

        // update field data
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        if (submitCallback && typeof submitCallback === 'function')
            await submitCallback(formData);
        
        setFormData(initData);
        setSubmitting(false);
    }

    return { formData, valid, onChange, onSubmit, submitting };
};

export default useForm;
