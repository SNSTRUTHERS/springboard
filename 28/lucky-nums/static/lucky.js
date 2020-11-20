const API_PREFIX = "http://localhost:5000";

/**
 * Handle responses from our lucky-num API.
 * 
 * @param {*} response JSON response from the lucky number API.
 */
const handleResponse = ({data}) => {
    const $luckyResults = $("#lucky-results");

    // reset error fields
    for (const field of ["color", "name", "year", "email"])
        $(`#${field}-err`).text("");
    
    // reset results
    $luckyResults.text('')

    // handle errors
    if (data["errors"]) {
        for (const field in data["errors"])
            $(`#${field}-err`).text(data["errors"][field][0]);
    } else {
        $luckyResults.text(`
Your lucky number is ${data.num.num}: ${data.num.fact}
Your birth year ${data.year.year} fact is: ${data.year.fact}`);
    }
};

/**
 * Retrieves data from form and make AJAX call to our API.
 * 
 * @param {Event} event The form submit event.
 */
const processForm = (event) => {
    event.preventDefault();

    axios.post(`${API_PREFIX}/api/get-lucky-num`, {
        name:  $("#name").val(),
        year:  $("#year").val(),
        email: $("#email").val(),
        color: $("#color").val()
    }).then(handleResponse);
};


$("#lucky-form").on("submit", processForm);
