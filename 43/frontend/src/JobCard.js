import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardHeader, CardBody } from "reactstrap";

import UserContext from "./UserContext";

import FA from "./FA";

const JobCard = ({
    body,
    color,
    data: { id, equity, salary, title, companyName, companyHandle },
    hideCompany,
    inverse
}) => {
    const [ loading, setLoading ] = useState(false);
    const { appliedJobs, applyForJob } = useContext(UserContext);

    const onClick = async () => {
        setLoading(true);
        try {
            await applyForJob(id);
        } catch (errors) {
            window.alert(errors.message + " " + JSON.stringify(errors));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Card body={body} color={color} inverse={inverse}>
            <CardHeader tag="h4" className="mb-2 text-muted">{title}</CardHeader>

            <CardBody>
                {hideCompany || <>
                    Listed by <Link to={`/companies/${companyHandle}`}>{companyName}</Link><br />
                </>}
                <b>Salary:</b> {salary ? `$${salary}` : <i>unknown</i>}<br />
                <b>Equity:</b> {equity ? `${(Number(equity) * 100).toFixed(2)}%` : '0.00%'}
                <hr />
                
                <Button
                    disabled={loading || (!appliedJobs || !!appliedJobs.includes(id))}
                    onClick={onClick}
                >{loading ?
                    <FA fas icon="circle-o-notch" spin /> :
                    (appliedJobs && appliedJobs.includes(id) ? "Applied" : "Apply")
                }</Button>
            </CardBody>
        </Card>
    );
};

export default JobCard;
