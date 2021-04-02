import React from "react";
import { Link } from "react-router-dom";

const Page = ({ imageURL, alt }) => (
    <div className="Page">
        <img src={imageURL} alt={alt} style={{ height: "70vh" }} /><br />
        <Link to="/">Go Back</Link>
    </div>
);

export default Page;
