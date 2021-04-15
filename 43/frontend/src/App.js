/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-throw-literal */
import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import jwt_decode from "jwt-decode";

import JoblyApi from "./api";

import NavBar from "./NavBar";
import Routes from "./Routes";

import UserContext from "./UserContext";

import useLocalStorage from "./hooks/useLocalStorage";

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

const App = () => {
    const [ token, setToken ] = useLocalStorage("", "currentUser");
    const [ appliedJobs, setAppliedJobs ] = useState([]);

    // get current user from local storage
    const currentUser = token ? jwt_decode(token) : null;
    const [ userDetails, setUserDetails ] = useState({});

    // job IDs the user already applied for
    useEffect(() => {
        if (currentUser) {
            JoblyApi.getUserDetails(token).then(({ applications, ...details }) => {
                setAppliedJobs(applications);
                setUserDetails(details);
            }).catch(() => {});
        }
    }, [ token, setAppliedJobs, setUserDetails ]);

    // register for new account
    async function signUp({ username, password, firstName, lastName, email }) {
        if (currentUser)
            throw ["Already logged in"];
        
        const token = await JoblyApi.register(username, password, firstName, lastName, email);
        setToken(token);
    };

    // log in
    async function logIn({ username, password }) {
        if (currentUser)
            throw ["Already logged in"];
        
        const token = await JoblyApi.logIn(username, password);
        setToken(token);
    };

    // log off
    async function logOut() {
        if (!currentUser)
            throw ["Not logged in"];

        setToken("");
        setUserDetails({});
    };

    // apply for job
    async function applyForJob(jobId) {
        if (!currentUser)
            throw ["Not logged in"];
        
        await JoblyApi.applyForJob(token, jobId);
        setAppliedJobs([ ...appliedJobs, jobId ]);
    };

    // edit user details
    async function updateUserDetails(details) {
        if (!currentUser)
            throw ["Not logged in"];
        
        await JoblyApi.updateUserDetails(token, details);
        setUserDetails({ ...userDetails, ...details });
    }

    return (
        <UserContext.Provider value={{
            appliedJobs, signUp, logIn, logOut, applyForJob, updateUserDetails,
            currentUser: currentUser ? { ...currentUser, ...userDetails } : null
        }}>
            <div className="App">
                <BrowserRouter>
                    <NavBar />
                    <main><Routes /></main>
                </BrowserRouter>
            </div>
        </UserContext.Provider>
    );
};

export default App;
