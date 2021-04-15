import React from "react";
import { Route, Switch } from "react-router-dom";

import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage";
import Homepage from "./pages/Homepage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

import ProtectedRoute from "./ProtectedRoute";

const Routes = () => (
    <Switch>
        <Route component={Homepage} exact path="/" />
        
        <ProtectedRoute exact path="/companies" component={CompaniesPage} />
        <ProtectedRoute exact path="/companies/:handle" component={CompanyDetailsPage} />
        <ProtectedRoute exact path="/jobs" component={JobsPage} />
        <ProtectedRoute exact path="/profile" component={ProfilePage} />
        
        <ProtectedRoute exact path="/login" component={LoginPage} loggedOut />
        <ProtectedRoute exact path="/signup" component={RegisterPage} loggedOut />

        <Route component={NotFoundPage} />
    </Switch>
);

export default Routes;
