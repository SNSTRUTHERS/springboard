/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
    const response = await axios.get("http://api.tvmaze.com/search/shows", {params: { q: query }});

    const shows = [];
    for (let show of response.data)
        shows.push({
            id: show.show.id,
            name: show.show.name,
            summary: show.show.summary,
            image: show.show.image ? show.show.image.medium : null
        });

    return shows;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
    const $showsList = $("#shows-list");
    $showsList.empty();

    const default_show_image = "https://tinyurl.com/tv-missing";

    for (let show of shows) {
        let $item = $(
            `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
                <div class="card" data-show-id="${show.id}">
                    <img class="card-img-top" src="${show.image ? show.image : default_show_image}">
                    <div class="card-body">
                        <h5 class="card-title">${show.name}</h5>
                        <p class="card-text">${show.summary}</p>
                        <button class="btn btn-primary" data-toggle="modal" data-target="#episodes-area">
                            Episodes
                        </button>
                    </div>
                </div>
            </div>
        `);

        $showsList.append($item);
    }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
    evt.preventDefault();

    let query = $("#search-query").val();
    if (!query) return;

    $("#episodes-area").hide();

    let shows = await searchShows(query);
    populateShows(shows);
});

$("#shows-list").on("click", "button", async function (event) {
    // clear episodes list
    clearEpisodesList();

    // get episodes
    const showId = $(event.target).parents(".Show").get(0).dataset["showId"];
    const episodes = await getEpisodes(showId);

    // populate episodes list
    populateEpisodes(episodes);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
    // get episodes from tvmaze
    const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

    // get info we want from each episode in the response
    const episodes = [];
    for (let episode of response.data) {
        episodes.push({
            id: episode.id,
            name: episode.name,
            season: episode.season,
            number: episode.number
        });
    }

    return episodes;
}

function clearEpisodesList() {
    const $episodesList = $("#episodes-list");
    $episodesList.empty();
}

/** Populate episodes list
 * 
 */
function populateEpisodes(episodes) {
    const $episodesList = $("#episodes-list");

    if (episodes.length > 0) {
        for (let episode of episodes) {
            let $item = $(
                `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
            `);
            $episodesList.append($item);
        }
    } else {
        $episodesList.html("<i>No episodes available</i>");
    }
}
