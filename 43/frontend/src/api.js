import axios from "axios";
import jwt_decode from "jwt-decode";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

// ============================================================================================== //

/** 
 * @typedef {{
 *      handle: string,
 *      name: string,
 *      description: string,
 *      numEmployees: number,
 *      logoUrl: string,
 *      jobs?: {
 *          id: number,
 *          title: string,
 *          salary: number,
 *          equity: string
 *      }
 * }} APICompany
 */

/**
 * @typedef {{
 *      id: number,
 *      title: string,
 *      equity: string,
 *      salary: number,
 *      companyHandle: string,
 *      companyName: string
 * }} APIJob
 */

/**
 * @typedef {{
 *      email: string,
 *      firstName: string,
 *      lastName: string
 *      applications: number[]
 * }} APIUser
 */

/**
 * @typedef {{
 *      "get": {
 *          "companies": {
 *              minEmployees?: number,
 *              maxEmployees?: number,
 *              name?: string
 *          }
 *      },
 *      "post": {
 *          "token": {
 *              username: string,
 *              password: string
 *          },
 *          "auth/register": { user: {
 *              username: string,
 *              password: string,
 *              firstName: string,
 *              lastName: string,
 *              email: string
 *          }},
 *          "companies": {
 *              handle: string,
 *              name: string,
 *              description: string,
 *              numEmployees: number,
 *              logoUrl: string
 *          }
 *      },
 *      "patch": {
 *          [ path: `companies/${string}` ]: {
 *              name: string,
 *              description: string,
 *              numEmployees: number,
 *              logoUrl: string
 *          }
 *      },
 *      "put": {},
 *      "delete": {
 *          [ path: `companies/${string}` ]: void
 *      }
 * }} APIRequestParamsMap
 */

/**
 * @typedef {{
 *      "get": {
 *          "companies": APICompany,
 *          [ path: `companies/${string}` ]: APICompany
 *      },
 *      "post": {
 *          "auth/token": { token: string },
 *          "auth/register": { token: string },
 *          "companies": {
 *              companies: APICompany[]
 *          }
 *      },
 *      "patch": {
 *          [ path: `companies/${string}` ]: APICompany
 *      },
 *      "put": {},
 *      "delete": {
 *          [ path: `companies/${string}` ]: { deleted: string }
 *      }
 * }} APIResponseDataMap
 */

// ============================================================================================== //

/** 
 * Set of methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 */
const JoblyApi = {
    /**
     * Makes a generic API request.
     * 
     * @template {keyof APIResponseDataMap}         Method
     * @template {keyof APIResponseDataMap[Method]} Endpoint
     * 
     * @param {Endpoint}                              endpoint The API endpoint to access.
     * @param {APIRequestParamsMap[Method][Endpoint]} data     Parameters to pass to the endpoint.
     * @param {Method}                                method   HTTP verb for the request.
     * 
     * @returns {Promise<APIResponseDataMap[Method][Endpoint]>}
     * Data corresponding to the given request.
     * 
     * @throws {string[]} List of errors.
     */
    async request(endpoint, { token, ...data } = {}, method = "get") {
        console.debug("API Call:", endpoint, token, data, method);

        // there are multiple ways to pass an authorization token, this is how you pass it in the
        // header. this has been provided to show you another way to pass the token. you are only
        // expected to read this code for this project.
        const url = `${BASE_URL}/${endpoint}`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const params = (method === "get") ?
            data :
            {}
        ;

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    },

// == INDIVIDUAL API ROUTES ===================================================================== //

    /**
     * Starts a new login session via given credentials.
     * 
     * @param {string} username The username to log in to.
     * @param {string} password The user's password.
     * 
     * @returns A user token for use in future requests.
     */
    async logIn(username, password) {
        const { token } = await this.request("auth/token", { username, password }, 'post');
        return token;
    },

    async register(username, password, firstName, lastName, email) {
        const { token } = await this.request("auth/register", {
            username, password, firstName, lastName, email
        }, 'post');
        return token;
    },

    /**
     * Retrieves profile details of a given user.
     * 
     * @param {string} token 
     * 
     * @returns {Promise<APIUser>} Object containing user details.
     */
    async getUserDetails(token) {
        const { username } = jwt_decode(token);
        const { user } = await this.request(`users/${username}`, { token });
        return user;
    },

    /**
     * 
     * @param {string} token Token of the user whose details are being updated.
     * @param {{
     *      password: string,
     *      firstName?: string,
     *      lastName?: string,
     *      email?: string
     * }} details 
     */
    async updateUserDetails(token, details) {
        const { username } = jwt_decode(token);
        await this.request(`users/${username}`, { token, ...details }, 'patch');
    },

    /**
     * Searches for companies in the database.
     * 
     * @param {{
     *      minEmployees?: number,
     *      maxEmployees?: number,
     *      name: string
     * }} searchQuery Query to send to the server.
     * 
     * @returns {Promise<APICompany[]>} List of companies matching the search query.
     */
    async searchCompanies(searchQuery) {
        const { companies } = await this.request("companies", searchQuery, 'get');
        return companies;
    },

    /**
     * Searches for jobs in the database.
     * 
     * @param {{
     *      minSalary?: number,
     *      hasEquity?: boolean,
     *      title: string
     * }} searchQuery Query to send to the server.
     * 
     * @returns {Promise<APIJob[]>} List of jobs matching the search query.
     */
    async searchJobs(searchQuery) {
        const { jobs } = await this.request("jobs", searchQuery, 'get');
        return jobs;
    },

    /**
     * Retrieves details of a company by a given handle.
     * 
     * @param {string} handle Company handle.
     * 
     * @returns {Promise<APICompany>}
     */
    async getCompanyDetails(handle) {
        const { company } = await this.request(`companies/${handle}`);
        return company;
    },

    /**
     * Applies for a given job.
     * 
     * @param {string} token Token of the user who is applying for a job.
     * @param {number} jobId ID of the job to apply for.
     */
    async applyForJob(token, jobId) {
        const { username } = jwt_decode(token);
        await this.request(`users/${username}/jobs/${jobId}`, { token }, 'post');
    }

// ============================================================================================== //

};

export default JoblyApi;
