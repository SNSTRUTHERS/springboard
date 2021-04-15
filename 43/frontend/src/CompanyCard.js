import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, CardImg, CardSubtitle, CardText } from "reactstrap";

const CompanyCard = ({
    body,
    color,
    data: { handle, name, description, numEmployees, logoURL },
    inverse
}) => (
    <Card body={body} color={color} inverse={inverse}>
        <CardHeader tag="h4" className="mb-2 text-muted">{name}</CardHeader>
        
        <CardImg width="100%" src={logoURL} />

        <CardBody>
            <CardSubtitle
                className="mb-2 text-muted"
                tag="h5"
            ><b>Employees:</b> {numEmployees}</CardSubtitle>
            <CardText>{description}</CardText>
            <Button tag={Link} to={`/companies/${handle}`}>See Details</Button>
        </CardBody>
    </Card>
);

export default CompanyCard;
