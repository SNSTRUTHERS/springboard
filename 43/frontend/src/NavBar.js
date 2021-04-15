import React, { useContext } from "react";
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarBrand,
    NavLink,
    UncontrolledDropdown
} from "reactstrap";
import { Link, NavLink as RRNavLink, useHistory } from "react-router-dom";

import UserContext from "./UserContext";

import "./NavBar.css";

const NavBar = () => {
    const { currentUser, logOut } = useContext(UserContext);
    const history = useHistory();

    const onLogOutClick = () => {
        logOut();
        history.push("/");
    };
    
    return (
        <Navbar color="dark" dark className="NavBar">
            <NavbarBrand to="/" tag={Link}>Job.ly</NavbarBrand>

            <Nav>
                {currentUser ? <>
                    <NavLink tag={RRNavLink} exact to="/companies">Companies</NavLink>
                    <NavLink tag={RRNavLink} exact to="/jobs">Jobs</NavLink>
                    <UncontrolledDropdown className="Dropdown" nav inNavbar>
                        <DropdownToggle nav caret>
                            <i>{currentUser.username}</i>
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropdownItem tag={Link} to="/profile">Edit Profile</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                                className="text-danger"
                                onClick={onLogOutClick}
                            >Log Out</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </> : <>
                    <NavLink to="/login" tag={RRNavLink}>Log In</NavLink>
                    <NavLink to="/signup" tag={RRNavLink}>Sign Up</NavLink>
                </>}
            </Nav>
        </Navbar>
    );
};

export default NavBar;
