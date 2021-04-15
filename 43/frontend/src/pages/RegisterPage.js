import React, { useContext } from "react";
import { useHistory } from "react-router";
import { Button, Container, Form, FormGroup, Label, Input } from "reactstrap";

import FA from "../FA";

import useForm from "../hooks/useForm";

import UserContext from "../UserContext";

const RegisterPage = () => {
    const { signUp } = useContext(UserContext);
    const history = useHistory();
    const { onChange, onSubmit, submitting } = useForm({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: ""
    }, async (formData) => {
        try {
            await signUp(formData);
            history.push("/");
        } catch(errors) {
            alert(errors.join(" "));
        }
    });

    return (
        <Container>
            <Form onSubmit={onSubmit}>
                <h1>Sign Up to Job.ly</h1>
                
                <FormGroup>
                    <Label for="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="password">Password</Label>
                    <Input
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
                        id="first-name"
                        name="firstName"
                        type="text"
                        required
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="last-name">Last Name</Label>
                    <Input
                        id="last-name"
                        name="lastName"
                        type="text"
                        required
                        onChange={onChange}
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        onChange={onChange}
                    />
                </FormGroup>

                <Button color="primary" disabled={submitting}>{ submitting ? 
                    <FA fas icon="circle-o-notch" spin /> :
                    "Create Account"
                }</Button>
            </Form>
        </Container>
    );
};

export default RegisterPage;
