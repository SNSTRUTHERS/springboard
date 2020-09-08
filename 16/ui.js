$(async function() {
    // cache some selectors we'll be using quite a bit
    const $body = $("body");
    const $allStoriesList = $("#all-articles-list");
    const $submitForm = $("#submit-form");
    const $articlesContainer = $(".articles-container");
    const $favoriteArticles = $("#favorite-articles");
    const $filteredArticles = $("#filtered-articles");
    const $loginForm = $("#login-form");
    const $createAccountForm = $("#create-account-form");
    const $myArticles = $("#my-articles");
    const $navLogin = $("#nav-login");
    const $navLogOut = $("#nav-logout");
    const $navSubmit = $("#nav-submit");
    const $navWelcome = $("#nav-welcome");
    const $navUserProfile = $("#nav-user-profile");
    const $userProfile = $("#user-profile");
    const $editArticleForm = $("#edit-article-form");

    $userProfile.hide();

    // global storyList variable
    let storyList = null;

    // global currentUser variable
    let currentUser = null;

    await checkIfLoggedIn();

    /**
     * Event listener for logging in.
     *  If successfully we will setup the user instance
     */
    $loginForm.on("submit", async function(evt) {
        evt.preventDefault(); // no page-refresh on submit

        // grab the username and password
        const username = $("#login-username").val();
        const password = $("#login-password").val();

        // call the login static method to build a user instance
        const userInstance = await User.login(username, password);
        // set the global user to the user instance
        currentUser = userInstance;
        loginAndSubmitForm();
    });

    /**
     * Event listener for signing up.
     *  If successfully we will setup a new user instance
     */
    $createAccountForm.on("submit", async function(evt) {
        evt.preventDefault(); // no page refresh

        // grab the required fields
        let name = $("#create-account-name").val();
        let username = $("#create-account-username").val();
        let password = $("#create-account-password").val();

        // call the create method, which calls the API and then builds a new user instance
        const newUser = await User.create(username, password, name);
        currentUser = newUser;
        loginAndSubmitForm();
    });

    /**
     * Log Out Functionality
     */
    $navLogOut.on("click", function() {
        // empty out local storage
        localStorage.clear();
        // refresh the page, clearing memory
        location.reload();
    });

    /**
     * Event Handler for Clicking Login
     */
    $navLogin.on("click", function() {
        // Show the Login and Create Account Forms
        $loginForm.slideToggle();
        $createAccountForm.slideToggle();
        $allStoriesList.toggle();
    });

    /**
     * Event handler for navigation submit
     */
    $navSubmit.on("click", () => {
        if (currentUser) {
            $submitForm.slideToggle();
        }
    });

    /**
     * Event handler clicking for on your profile
     */
    $navUserProfile.on("click", () => {
        $userProfile.slideToggle();
    });

    /**
     * Event handler for Navigation to Homepage
     */
    $body.on("click", "#nav-all", async function() {
        hideElements();
        await generateStories();
        $allStoriesList.show();
    });

    /**
     * On page load, checks local storage to see if the user is already logged in.
     * Renders page information accordingly.
     */
    async function checkIfLoggedIn() {
        // let's see if we're logged in
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");

        // if there is a token in localStorage, call User.getLoggedInUser
        //  to get an instance of User with the right details
        //  this is designed to run once, on page load
        currentUser = await User.getLoggedInUser(token, username);
        await generateStories();

        if (currentUser) {
            generateProfile();
            showNavForLoggedInUser();
        }
    }

    /**
     * A rendering function to run to reset the forms and hide the login info
     */
    function loginAndSubmitForm() {
        syncCurrentUserToLocalStorage();
        location.reload();
    }

    /**
     * Build a user profile based on the global user.
     */
    function generateProfile() {
        $("#profile-name").text(`Name: ${currentUser.name}`);
        $("#profile-username").text(`Username: ${currentUser.username}`);
        $("#profile-account-date").text(`Account Created: ${currentUser.createdAt.slice(0, 10)}`);

        $navUserProfile.text(`${currentUser.username}`);
    }

    /**
     * A rendering function to call the StoryList.getStories static method,
     *  which will generate a storyListInstance. Then render it.
     */
    async function generateStories() {
        // get an instance of StoryList
        const storyListInstance = await StoryList.getStories();
        // update our global variable
        storyList = storyListInstance;
        // empty out that part of the page
        $allStoriesList.empty();

        // loop through all of our stories and generate HTML for them
        for (const story of storyList.stories) {
            const result = generateStoryHTML(story);
            $allStoriesList.append(result);
        }
    }

    function generateFavorites() {
        $favoriteArticles.empty();

        // if user has no favorites, display message
        if(currentUser.favorites.length === 0)
            $favoriteArticles.append("<h5>You have no favorite articles.</h5>");
        else {
            for (const story of currentUser.favorites) {
                const favoriteHTML = generateStoryHTML(story, getHostName(story.url), true);
                $favoriteArticles.append(favoriteHTML);
            }
        }
    }

    function generateMyStories() {
        $myArticles.empty();

        // if user has no favorites, display message
        if(currentUser.ownStories.length === 0)
            $myArticles.append("<h5>You have not posted any articles.</h5>");
        else {
            for (const story of currentUser.ownStories) {
                const ownStoryHTML = generateStoryHTML(
                    story,
                    getHostName(story.url),

                );
                $myArticles.append(ownStoryHTML);
            }
        }
    }
    
    /**
     * A function to render HTML for an individual Story instance
     * 
     * @param {*} storyObject    - the story object to generate markup for.
     * @param {String} hostName  - the host name of the story.
     * @param {Boolean} favorite - whether to mark the story as favorited or not.
     */
    function generateStoryHTML(
        { storyId, url, title, author, username },
        hostName = getHostName(url),
        favorite = currentUser && 
                   currentUser.favorites.some((elem) => elem.storyId === storyId)
    ) {
        return $(`
        <li id="${storyId}" class="id-${storyId}">
            ${currentUser ? `
                <span class="star">
                    <i class="${favorite ? "fas" : "far"} fa-star"></i>
                </span>
            ` : ""
            }
            ${(currentUser &&
               currentUser.ownStories.some((elem) => elem.storyId === storyId)) ? `
                <span class="pencil">
                    <i class="fas fa-pencil-alt"></i>
                </span>
                <span class="trash-can">
                    <i class="fas fa-trash-alt"></i>
                </span>
                ` : ""
            }

            <a class="article-link" href="${url}" target="a_blank">
                <strong>${title}</strong>
            </a>

            <small class="article-author">by ${author}</small>
            <small class="article-hostname ${hostName}">(${hostName})</small>
            <small class="article-username">posted by ${username}</small>
        </li>
        `);
    }

    /* hide all elements in elementsArr */
    function hideElements() {
        const elementsArr = [
            $submitForm,
            $allStoriesList,
            $favoriteArticles,
            $filteredArticles,
            $myArticles,
            $loginForm,
            $createAccountForm,
            $editArticleForm
        ];
        elementsArr.forEach(($elem) => $elem.hide());
    }

    function showNavForLoggedInUser() {
        $navLogin.hide();
        
        $(".main-nav-links, #user-profile").toggleClass("hidden");

        $navWelcome.show();
        $navLogOut.show();
    }

    /* simple function to pull the hostname from a URL */
    function getHostName(url) {
        let hostName;
        if (url.indexOf("://") > -1) {
            hostName = url.split("/")[2];
        } else {
            hostName = url.split("/")[0];
        }
        if (hostName.slice(0, 4) === "www.") {
            hostName = hostName.slice(4);
        }
        return hostName;
    }

    /* sync current user information to localStorage */
    function syncCurrentUserToLocalStorage() {
        if (currentUser) {
            localStorage.setItem("token", currentUser.loginToken);
            localStorage.setItem("username", currentUser.username);
        }
    }

    /** Submit Article event handler */
    $submitForm.on("submit", async function(event) {
        event.preventDefault();

        // grab info from the form
        const title = $("#title").val();
        const url = $("#url").val();
        const hostName = getHostName(url);
        const author = $("#author").val();
        const username = currentUser.username;

        const story = await storyList.addStory(currentUser, {
            title, author, url, username
        });

        // generate & add story to HTML
        const $li = generateStoryHTML(story, hostName);
        $allStoriesList.prepend($li);

        // hide + reset form
        $submitForm.slideUp("slow");
        $submitForm.trigger("reset");
    });

    /** Starring Favorites event handler */
    $articlesContainer.on("click", ".star", async function(event) {
        if (currentUser) {
            const $target = $(event.target);
            const $closestListItem = $target.closest("li");
            const storyId = $closestListItem.attr("id");

            let favoriting;
            if ($target.hasClass("fas"))
                favoriting = false;
            else if ($target.hasClass("far"))
                favoriting = true;
            
            if (favoriting !== undefined) {
                $target.removeClass().addClass("fa fa-spinner fa-spin fa-fw");

                if (favoriting) {
                    await currentUser.favoriteStory(storyId);
                    $target.removeClass().addClass("fas fa-star");
                } else {
                    await currentUser.unfavoriteStory(storyId);
                    $target.removeClass().addClass("far fa-star");
                }
            }
        }
    });

    /** Edit Story event handler */
    $articlesContainer.on("click", ".pencil", function(event) {
        if (currentUser) {
            const $target = $(event.target);
            const $closestListItem = $target.closest("li");
            const storyId = $closestListItem.attr("id");
            const title = $closestListItem.find(".article-link strong").text();

            hideElements();
            $editArticleForm.show().data("story-id", storyId);
            $("#edit-title").attr('placeholder', title);
        }
    });

    /** Edit Story submit event handler */
    $editArticleForm.on("submit", async function(event) {
        event.preventDefault();

        const storyId = $editArticleForm.data("story-id");
        const story = storyList.stories.find((elem) => elem.storyId === storyId);

        await story.update(currentUser, {
            title: $("#edit-title").val()
        });

        location.reload();
    })

    /** Delete Story event handler */
    $articlesContainer.on("click", ".trash-can", async function(event) {
        event.preventDefault();

        const $target = $(event.target);
        if ($target.hasClass("fa-trash-alt")) {
            const $closestListItem = $target.closest("li");
            const storyId = $closestListItem.attr("id");
            const title = $closestListItem.find(".article-link strong").text();

            if (confirm(`Are you sure you want to delete article "${title}"`)) {
                $target.removeClass().addClass("fa fa-spinner fa-spin fa-fw");
                await storyList.removeStory(currentUser, storyId);

                $closestListItem.remove();
            }
        }
    });
    
    /** Event Handler for navigation to Favorites */
    $("#nav-favorites").on("click", function() {
        if (currentUser) {
            hideElements();
            generateFavorites();
            $favoriteArticles.show();
        }
    });

    /** Event handler for navigation to My Stories */
    $("#nav-my-stories").on("click", function() {
        if (currentUser) {
            hideElements();
            generateMyStories();
            $myArticles.show();
        }
    });
});
