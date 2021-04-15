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

import CompanyCard from "../CompanyCard";
import FA from "../FA";

import JoblyApi from "../api";

const CompaniesPage = () => {
    // grab form params from URL query string
    const searchParams = new URL(document.URL).searchParams;

    // validates employee fields
    const employeeFieldValidator = (name, value, formData) => {
        switch (name) {
        case 'minEmployees':
        case 'maxEmployees':
            let myValid;
            if (value !== '') {
                const me = Number(value);
                const other = (name === 'minEmployees') ? 'maxEmployees' : 'minEmployees';

                myValid = !!value.match(/^[0-9]+$/g);
                if (formData[other] && valid[other]) {
                    myValid = myValid && (name === 'minEmployees' ?
                        me <= Number(formData[other]) :
                        me >= Number(formData[other])
                    );
                }
            }
            return myValid;

        default:
            break;
        }
    };

    const [ companies, setCompanies ] = useState([]);
    const { formData, valid, onChange } = useForm({
        minEmployees: searchParams.get('minEmployees') || "",
        maxEmployees: searchParams.get('maxEmployees') || "",
        name: searchParams.get('name') || ""
    }, undefined, {
        minEmployees: employeeFieldValidator,
        maxEmployees: employeeFieldValidator
    });

    const [ showOptions, setShowOptions ] = useState(
        !!(searchParams.get('minEmployees') || searchParams.get('maxEmployees'))
    );
    
    // use to add form params to query string in URL
    const history = useHistory();

    // grab companies from API & update URL
    useEffect(() => {
        if (formData.name.length) {
            // assemble URL with form fields
            const url = new URL(document.URL);
            url.search = "";
            url.searchParams.append("name", formData.name);
            url.searchParams.append("minEmployees", formData.minEmployees);
            url.searchParams.append("maxEmployees", formData.maxEmployees);

            // remove invalid fields from form data
            const searchQuery = formData;
            if (!valid.minEmployees) {
                delete searchQuery.minEmployees;
                url.searchParams.delete("minEmployees");
            }
            if (!valid.maxEmployees) {
                delete searchQuery.maxEmployees;
                url.searchParams.delete("maxEmployees");
            }
            
            // request companies from API
            JoblyApi.searchCompanies(searchQuery).then((companies) =>
                setCompanies(companies)
            ).catch((errors) =>
                console.error(errors)
            );

            // add form fields to URL
            history.replace(`${url.pathname}${url.search}`);
        } else {
            setCompanies([]);
        }
    }, [ formData, history, valid ]);

    // get valid, invalid, or null classes based on validation setting for a given prop
    const generateValidClass = (prop) => `${
        valid[prop] ? 'is-valid' : valid[prop] === false ? 'is-invalid' : ''
    }`;

    return (
        <Container>
            <Form style={{ marginTop: "0.5em" }}>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            Company Name
                        </InputGroupText>
                    </InputGroupAddon>
                    
                    <Input name="name" value={formData.name} onChange={onChange} />

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
                                <Label for="min-employees">Minimum Employees</Label>
                                <Input
                                    className={generateValidClass('minEmployees')}
                                    type="text"
                                    name="minEmployees"
                                    id="min-employees"
                                    value={formData.minEmployees}
                                    onChange={onChange}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="5">
                            <FormGroup>
                                <Label for="max-employees">Maximum Employees</Label>
                                <Input
                                    className={generateValidClass('maxEmployees')}
                                    type="text"
                                    name="maxEmployees"
                                    id="max-employees"
                                    value={formData.maxEmployees}
                                    onChange={onChange}
                                />
                            </FormGroup>
                        </Col>

                        <Col md="1" />
                    </Row>
                </Collapse>
            </Form>

            <hr />

            {companies.length ?
                <Row>{
                    companies.map((companyData) => (
                        <Col md="6"><CompanyCard data={companyData} /></Col>
                    ))
                }</Row> :
                <i>{
                    formData.name === '' ?
                        "Type in a company name to search for!" :
                        `No companies found with name "${formData.name}" found.`
                }</i>
            }
        </Container>
    );
};

export default CompaniesPage;
