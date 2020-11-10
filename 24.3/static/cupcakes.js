const BASE_URL = "http://localhost:5000/api";

const $CUPCAKE_LIST = $("#cupcake-list");
const $NEW_CUPCAKE_FORM = $("#new-cupcake-form");

/**
 * Generates markup for a cupcake to display on the cupcake list.
 * @param {Cupcake} cupcake The cupcake 
 */
const generateCupcakeHTML = ({id, flavor, size, image, rating}) => {
    return `
    <div class="col mb-4">
        <div class="card h-100" data-cupcake-id="${id}">
            <div class="row no-gutters">
                <img class="card-img img-fluid col-md-4" src="${image}" alt="(no image provided)">

                <div class="col-md-8">
                    <div class="card-body text-center">
                        <p class="card-text">${flavor} / ${size} / ${rating}</p>
                        <button class="btn btn-danger">X</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

/**
 * Generates cupcake markup from cupcakes the server received on page load.
 */
const loadAndDisplayCupcakes = async () => {
    const response = await axios.get(`${BASE_URL}/cupcakes`);

    for (const cupcake_data of response.data.cupcakes) {
        const $new_cupcake = $(generateCupcakeHTML(cupcake_data));
        $CUPCAKE_LIST.append($new_cupcake);
    }
};

/**
 * Form submission -- creates new cupcake & adds to page & server.
 */
$NEW_CUPCAKE_FORM.on("submit", async (event) => {
    event.preventDefault();

    const flavor = $("#new-cupcake-flavor").val();
    const rating = $("#new-cupcake-rating").val();
    const size   = $("#new-cupcake-size").val();
    const image  = $("#new-cupcake-image").val();
    
    const response = await axios.post(`${BASE_URL}/cupcakes`, {
        flavor, rating, size, image
    });

    const $new_cupcake = $(generateCupcakeHTML(response.data.cupcake));
    $CUPCAKE_LIST.append($new_cupcake);
    $NEW_CUPCAKE_FORM.trigger("reset");
});

/**
 * Deletion -- removes cupcake from page & server.
 */
$CUPCAKE_LIST.on("click", ".btn-danger", async (event) => {
    event.preventDefault();

    const $cupcake = $(event.target).closest("div.card");
    const cupcake_id = $cupcake.attr("data-cupcake-id");

    await axios.delete(`${BASE_URL}/cupcakes/${cupcake_id}`);
    $cupcake.remove();
});


$(loadAndDisplayCupcakes);
