import React, { useContext } from "react";
import { useHistory } from "react-router";
import { Button, Container, Form, FormGroup, Label, Input } from "reactstrap";

import FA from "../FA";

import useForm from "../hooks/useForm";

import UserContext from "../UserContext";

const LoginPage = () => {
    const { logIn } = useContext(UserContext);
    const history = useHistory();
    const { onChange, onSubmit, submitting } = useForm({
        username: "",
        password: ""
    }, async (formData) => {
        try {
            await logIn(formData);
            history.push("/");
        } catch (errors) {
            alert(errors.join(" "));
        }
    });

    return (
        <Container>
            <Form onSubmit={onSubmit}>
                <h1>Log On to Job.ly</h1>
                
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

                <Button color="primary" disabled={submitting}>{ submitting ? 
                    <FA fas icon="circle-o-notch" spin /> :
                    "Log In"
                }</Button>
            </Form>
        </Container>
    );
};

export default LoginPage;
