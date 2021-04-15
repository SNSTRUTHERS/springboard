import React, { useContext } from "react";
import { useHistory } from "react-router";
import { Button, Container, Form, FormGroup, Label, Input } from "reactstrap";

import FA from "../FA";

import useForm from "../hooks/useForm";

import UserContext from "../UserContext";

const ProfilePage = () => {
    const { currentUser, updateUserDetails } = useContext(UserContext);

    const history = useHistory();

    const { valid, onChange, onSubmit, submitting } = useForm({
        password: "",
        firstName: "",
        lastName: "",
        email: ""
    }, async (formData) => {
        try {
            const submitData = { ...formData };
            if (!submitData.firstName.length)
                delete submitData.firstName;
            if (!submitData.lastName.length)
                delete submitData.lastName;
            if (!submitData.email.length)
                delete submitData.email;

            await updateUserDetails(submitData);
            history.push("/");
        } catch (errors) {
            window.alert(errors.join("\n"));
        }
    }, {
        // we don't know if the password input by the user is actually correct, so don't make the
        // UI display a checkmark in that case; only show invalid passwords
        password: (_, value) =>
            (value.length >= 5 && value.length <= 20) ? undefined : false,
        firstName: (_, value) =>
            value.length ? value.length <= 30 : undefined,
        lastName: (_, value) =>
            value.length ? value.length <= 30 : undefined,
        email: (_, value) =>
            value.length ? (value.length >= 6 && value.length <= 60) : undefined
    });

    // get valid, invalid, or null classes based on validation setting for a given prop
    const generateValidClass = (prop) => `${
        valid[prop] ? 'is-valid' : valid[prop] === false ? 'is-invalid' : ''
    }`;

    return (
        <Container>
            <Form onSubmit={onSubmit}>
                <h1>Edit Profile Details</h1>
                
                <FormGroup>
                    <Label for="username">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        disabled
                        value={currentUser.username}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="password">Password</Label>
                    <Input
                        className={generateValidClass('password')}
                        id="password"
                        name="password"
                        type="password"
                        required
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="first-name">First Name</Label>
                    <Input
                        className={generateValidClass('firstName')}
                        id="first-name"
                        name="firstName"
                        type="text"
                        placeholder={currentUser.firstName}
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="last-name">Last Name</Label>
                    <Input
                        className={generateValidClass('lastName')}
                        id="last-name"
                        name="lastName"
                        type="text"
                        placeholder={currentUser.lastName}
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                        className={generateValidClass('email')}
                        id="email"
                        name="email"
                        type="email"
                        placeholder={currentUser.email}
                        onChange={onChange}
                    />
                </FormGroup>

                <Button
                    color="primary"
                    disabled={submitting || Object.getOwnPropertyNames(valid).some((name) =>
                        valid[name] === false
                    )}
                >{ submitting ? 
                    <FA fas icon="circle-o-notch" spin /> :
                    "Submit Changes"
                }</Button>
            </Form>
        </Container>
    );
};

export default ProfilePage;
