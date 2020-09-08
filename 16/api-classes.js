const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/**
 * This class maintains the list of individual Story instances
 *  It also has some methods for fetching, adding, and removing stories
 */
class StoryList {
    constructor(stories) {
        this.stories = stories;
    }

    /**
     * This method is designed to be called to generate a new StoryList.
     *  It:
     *  - calls the API
     *  - builds an array of Story instances
     *  - makes a single StoryList instance out of that
     *  - returns the StoryList instance.*
     * 
     * Note the presence of `static` keyword: this indicates that getStories
     * is **not** an instance method. Rather, it is a method that is called on the
     * class directly. Why doesn't it make sense for getStories to be an instance method?
     * 
     * Because getStories() itself returns a new StoryList
     */
    static async getStories() {
        // query the /stories endpoint (no auth required)
        const response = await axios.get(`${BASE_URL}/stories`);

        // turn the plain old story objects from the API into instances of the Story class
        const stories = response.data.stories.map(story => new Story(story));

        // build an instance of our own class using the new array of stories
        const storyList = new StoryList(stories);
        return storyList;
    }

    /**
     * Method to make a POST request to /stories and add the new story to the list
     * - user - the current instance of User who will post the story
     * - newStory - a new story object for the API with title, author, and url
     *
     * Returns the new story object
     */
    async addStory(user, newStory) {
        const response = await axios.post(`${BASE_URL}/stories`, {
            token: user.loginToken,
            story: newStory
        });

        newStory = new Story(response.data.story);
        this.stories.unshift(newStory);
        user.ownStories.unshift(newStory);
        return newStory;
    }

    /**
     * Method to make a DELETE request to remove a given story and to update the StoryList.
     * 
     * @param {*} user the current instance of User
     * @param {*} storyId the ID of the story to delete
     */
    async removeStory(user, storyId) {
        await axios({
            method: 'DELETE',
            url: `${BASE_URL}/stories/${storyId}`,
            data: {
                token: user.loginToken
            }
        });

        this.stories = this.stories.filter((elem) => elem.storyId !== storyId);
        user.ownStories = user.ownStories.filter((elem) => elem.storyId !== storyId);
    }
}


/**
 * The User class to primarily represent the current user.
 *  There are helper methods to signup (create), login, and getLoggedInUser
 */
class User {
    constructor(userObj) {
        this.username = userObj.username;
        this.name = userObj.name;
        this.createdAt = userObj.createdAt;
        this.updatedAt = userObj.updatedAt;

        // these are all set to defaults, not passed in by the constructor
        this.loginToken = "";
        this.favorites = [];
        this.ownStories = [];
    }

    /* Create and return a new user.
    *
    * Makes POST request to API and returns newly-created user.
    *
    * - username: a new username
    * - password: a new password
    * - name: the user's full name
    */
    static async create(username, password, name) {
        const response = await axios.post(`${BASE_URL}/signup`, {
            user: {
                username,
                password,
                name
            }
        });

        // build a new User instance from the API response
        const newUser = new User(response.data.user);

        // attach the token to the newUser instance for convenience
        newUser.loginToken = response.data.token;

        return newUser;
    }

    /* Login in user and return user instance.

    * - username: an existing user's username
    * - password: an existing user's password
    */
    static async login(username, password) {
        const response = await axios.post(`${BASE_URL}/login`, {
            user: {
                username,
                password
            }
        });

        // build a new User instance from the API response
        const existingUser = new User(response.data.user);

        // instantiate Story instances for the user's favorites and ownStories
        existingUser.favorites = response.data.user.favorites.map(s => new Story(s));
        existingUser.ownStories = response.data.user.stories.map(s => new Story(s));

        // attach the token to the newUser instance for convenience
        existingUser.loginToken = response.data.token;

        return existingUser;
    }

    /** Get user instance for the logged-in-user.
     *
     * This function uses the token & username to make an API request to get details
     *   about the user. Then it creates an instance of user with that info.
     */
    static async getLoggedInUser(token, username) {
        // if we don't have user info, return null
        if (!token || !username) return null;

        // call the API
        const response = await axios.get(`${BASE_URL}/users/${username}`, {
            params: {
                token
            }
        });

        // instantiate the user from the API information
        const existingUser = new User(response.data.user);

        // attach the token to the newUser instance for convenience
        existingUser.loginToken = token;

        // instantiate Story instances for the user's favorites and ownStories
        existingUser.favorites = response.data.user.favorites.map(s => new Story(s));
        existingUser.ownStories = response.data.user.stories.map(s => new Story(s));
        return existingUser;
    }

    /**
     * Updates this User instance with new details from the server.
     */
    async updateDetails() {
        // receive updated user details from server
        const { data: { user: {
            name, createdAt, updatedAt, favorites, stories
        }}} = await axios.get(`${BASE_URL}/users/${this.username}`, { params: {
            token: this.loginToken
        }});

        // update user properties from API response
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.favorites = favorites.map((elem) => new Story(elem));
        this.ownStories = stories.map((elem) => new Story(elem));

        return this;
    }

    /** Favorites a story.
     * 
     * @param {String} storyId - ID of the story being favorited
     */
    async favoriteStory(storyId) {
        await axios.post(
            `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
            {
                token: this.loginToken
            }
        );

        return await this.updateDetails();
    }

    /** Unfavorites a story.
     * 
     * @param {String} storyId - ID of the story being unfavorited
     */
    async unfavoriteStory(storyId) {
        await axios({
            method: 'DELETE',
            url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
            data: {
                token: this.loginToken
            }
        });

        return await this.updateDetails();
    }

    /**
     * Sends a PATCH request to the server to update this User instance's information.
     * @param {*} userObj - User properties to update this instance with.
     */
    async update(userObj) {
        const {data: {user: { name }}} = await axios({
            method: 'PATCH',
            url: `${BASE_URL}/users/${this.username}`,
            data: {
                user: userObj,
                token: this.loginToken
            }
        });

        this.name = name;
        return this;
    }

    /**
     * Removes this User instance from the server.
     */
    async remove() {
        await axios.delete(
            `${BASE_URL}/users/${this.username}`,
            { data: {
                token: this.loginToken
            }}
        );
    }
}

/**
 * Class to represent a single story.
 */
class Story {
    /**
     * The constructor is designed to take an object for better readability / flexibility
     * - storyObj: an object that has story properties in it
     */
    constructor(storyObj) {
        this.author = storyObj.author;
        this.title = storyObj.title;
        this.url = storyObj.url;
        this.username = storyObj.username;
        this.storyId = storyObj.storyId;
        this.createdAt = storyObj.createdAt;
        this.updatedAt = storyObj.updatedAt;
    }

    /**
     * Make a PATCH request to update this story on the server.
     * 
     * @param {User} user - a User instance
     * @param {*} storyObj - object containing story properties to update
     */
    async update(user, storyObj) {
        const {data: {story: { author, title, url, updatedAt }}} = await axios.patch(
            `${BASE_URL}/stories/${this.storyId}`,
            {
                token: user.loginToken,
                story: storyObj
            }
        );

        this.author = author;
        this.title = title;
        this.url = url;
        this.updatedAt = updatedAt;

        return this;
    }
}
