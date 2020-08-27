async function search_giphy(search_term, callback = null) {
    const response = await axios.get("http://api.giphy.com/v1/gifs/search",
        { "params": {
            "q": search_term,
            "api_key": "MhAodEJIJxQMxW9XqxKjyXfNYdLoOIym"
        }}
    );

    const { status, statusText, data: { data } } = response;

    switch (status) {
    case 200:
        if (callback)
            callback(data);
        break;

    default:
        alert(`Got erroneous status code from Giphy API: ${status} ${statusText}`);
        break;
    }
}

document.getElementById("search").addEventListener("submit", (event) => {
    event.preventDefault();
    search_giphy(document.getElementById("search_term").value, (data) => {
        const img_info = data[Math.floor(Math.random() * data.length)];

        console.log(img_info);
        const img = document.createElement("img");
        img.className = "col-12 col-sm-6 col-md-4 p-1";
        img.src = img_info.images.original.url;

        document.getElementById("images").appendChild(img);
    });
});

document.getElementById("rm_images").addEventListener("click", (event) => {
    let child = document.getElementById("images").children[0];
    while (child) {
        const sibling = child.nextElementSibling;
        child.remove();
        child = sibling;
    }
});
