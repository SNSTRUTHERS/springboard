import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Col, Container, Row } from "reactstrap";

import JoblyApi from "../api";

import JobCard from "../JobCard";

import "./CompanyDetailsPage.css";

const CompanyDetailsPage = () => {
    const { handle } = useParams();

    const [ companyData, setCompanyData ] = useState(null);
    useEffect(() => {
        (async () => {
            setCompanyData(await JoblyApi.getCompanyDetails(handle));
        })();
    }, [ handle, setCompanyData ]);

    if (!companyData) {
        return <h1>Loading...</h1>;
    } else {
        const { name, description, numEmployees, jobs, logoURL } = companyData;

        return (
            <Container className="CompanyDetailsPage">
                <Row>
                    <Col md={logoURL ? 8 : 12}>
                        <h1>{name}</h1>
                        <h4 className="text-muted">{description}</h4>
                        <h5><b>Employees:</b> {numEmployees}</h5>
                    </Col>

                    {logoURL && <Col md={4} tag="img" src={logoURL} alt={handle} />}

                    <Col md={12}>
                        <hr />
                        <h2>Jobs</h2>
                        <Row>
                            {jobs.map((job) =>
                                <Col md={6}><JobCard data={job} hideCompany /></Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    }
};

export default CompanyDetailsPage;
