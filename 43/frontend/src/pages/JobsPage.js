import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    Button,
    Col,
    Collapse,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Row
} from "reactstrap";

import useForm from "../hooks/useForm";

import JobCard from "../JobCard";
import FA from "../FA";

import JoblyApi from "../api";

const JobsPage = () => {
    // grab form params from URL query string
    const searchParams = new URL(document.URL).searchParams;

    const [ jobs, setJobs ] = useState([]);
    const { formData, valid, onChange } = useForm({
        minSalary: searchParams.get('minSalary') || "",
        hasEquity: !!searchParams.get('hasEquity'),
        title: searchParams.get('title') || ""
    }, undefined, {
        minSalary: (_, value) => (value !== '') ? !!value.match(/^[0-9]+$/g) : undefined
    });

    const [ showOptions, setShowOptions ] = useState(
        !!(searchParams.get('minSalary') || searchParams.get('hasEquity'))
    );
    
    // use to add form params to query string in URL
    const history = useHistory();

    // grab jobs from API & update URL
    useEffect(() => {
        if (formData.title.length) {
            // assemble URL with form fields
            const url = new URL(document.URL);
            url.search = "";
            url.searchParams.append("title", formData.title);
            url.searchParams.append("minSalary", formData.minSalary);
            url.searchParams.append("hasEquity", formData.hasEquity);

            console.log(formData);

            // remove invalid fields from form data
            const searchQuery = formData;
            if (!valid.minSalary) {
                delete searchQuery.minSalary;
                url.searchParams.delete("minSalary");
            }
            if (!formData.hasEquity) {
                delete searchQuery.hasEquity;
                url.searchParams.delete("hasEquity");
            }
            
            // request companies from API
            JoblyApi.searchJobs(searchQuery).then((jobs) =>
                setJobs(jobs)
            ).catch((errors) =>
                console.error(errors)
            );

            // add form fields to URL
            history.replace(`${url.pathname}${url.search}`);
        } else {
            setJobs([]);
        }
    }, [ formData, history, valid ]);

    // get valid, invalid, or null classes based on validation setting for minSalary field.
    const minSalaryValidClass = `${
        valid.minSalary ? 'is-valid' : valid.minSalary === false ? 'is-invalid' : ''
    }`;

    return (
        <Container>
            <Form style={{ marginTop: "0.5em" }}>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            Job Title
                        </InputGroupText>
                    </InputGroupAddon>
                    
                    <Input name="title" value={formData.title} onChange={onChange} />

                    <InputGroupAddon addonType="append">
                        <InputGroupText>
                            <FA fas icon="search" />
                        </InputGroupText>
                    </InputGroupAddon>

                    <InputGroupAddon addonType="append">
                        <Button
                            onClick={() => setShowOptions(!showOptions)}
                        ><FA icon="bars" /></Button>
                    </InputGroupAddon>
                </InputGroup>

                <Collapse isOpen={showOptions}>
                    <Row form>
                        <Col md="1" />
                        <Col md="5">
                            <FormGroup>
                                <Label for="min-salary">Minimum Salary</Label>
                                <Input
                                    className={minSalaryValidClass}
                                    type="text"
                                    name="minSalary"
                                    id="min-salary"
                                    value={formData.minSalary}
                                    onChange={onChange}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="5">
                            <FormGroup check inline>
                                <Label check>
                                    Has Equity{' '}
                                    <Input
                                        type="checkbox"
                                        name="hasEquity"
                                        checked={formData.hasEquity}
                                        value={formData.hasEquity}
                                        onChange={onChange}
                                    />
                                </Label>
                            </FormGroup>
                        </Col>

                        <Col md="1" />
                    </Row>
                </Collapse>
            </Form>

            <hr />

            {jobs.length ?
                <Row>{
                    jobs.map((jobData) => (
                        <Col md="6"><JobCard data={jobData} /></Col>
                    ))
                }</Row> :
                <i>{
                    formData.title === '' ?
                        "Type in a job title to search for!" :
                        `No jobs found with title "${formData.title}" found.`
                }</i>
            }
        </Container>
    );
};

export default JobsPage;
