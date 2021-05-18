/** @type {HTMLFormElement} */
const form = document.getElementById("register-form");

/**
 * Validates a given input in our signup form.
 * @param {HTMLInputElement} formField An input element in the form.
 */
function validateField(formField) {
    const { name, value } = formField;

    formField.classList.remove("is-valid");
    formField.classList.remove("is-invalid");

    // empty fields aren't validated
    if (value !== '') {
        let valid = formField.checkValidity();

        switch (name) {
        case 'firstName':
        case 'lastName':
            if (valid && value.includes(' ')) {
                valid = false;
                formField.setCustomValidity("Spaces are not allowed.");
            }
            break;
        }
        
        formField.classList.add(`is-${valid ? '' : 'in'}valid`);
    }
}

form.oninput = (event) => validateField(event.target);

form.onsubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const formData = {};
    for (const child of form.children) {
        if (child.classList.contains('form-group')) {
            const field = child.getElementsByTagName('input')[0];
            formData[field.name] = field.value;
        }
    }

    console.log(JSON.stringify(formData));
    const response = await fetch("/users", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (response.ok)
        document.location = `${new URL(document.location).origin}/admin.html`;
    else
        alert(`ERROR: ${data.message}`);
};

// auto-validate form fields on page load
for (const child of form.children) {
    if (child.classList.contains('form-group')) {
        const field = child.getElementsByTagName('input')[0];
        validateField(field);
    }
}
