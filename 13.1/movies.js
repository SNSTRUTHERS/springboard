$("#movie-form").on("submit", function(event) {
    event.preventDefault();

    const title = $("#movie-title").val();
    const rating = Number($("#movie-rating").val());

    if (title.length < 2) {
        alert("Movie title must be at least 2 characters long");
        return;
    }

    $("#movie-list").append(
        `<li>
            <b>${title}</b> <br><i>${rating.toFixed(1)} / 10</i>
            <button class="rm-button"></button>
        </li>`
    );

    $("#movie-title").val("");
    $("#movie-rating").val("");
});

$("#movie-list").on("click", ".rm-button", function(event) {
    const target = $(event.target).parent();
    target.fadeOut(function() {
        target.remove();
    });
});
