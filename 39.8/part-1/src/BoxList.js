import { useState } from "react";
import Box from './Box';
import NewBoxForm from './NewBoxForm';
import "./BoxList.css";

const BoxList = () => {
    const [ boxes, setBoxes ] = useState([]);

    const createBox = (box) => setBoxes([ ...boxes, box ]);
    const removeBox = (boxID) => setBoxes(boxes.filter(({ id }) => id !== boxID ));

    const boxComponents = boxes.map((box) =>
        <Box
            key={box.id}
            id={box.id}
            width={box.width}
            height={box.height}
            color={box.color}
            handleRemove={removeBox}
        />
    );

    return (
        <div className="BoxList">
            <NewBoxForm createBox={createBox} />
            {boxComponents}
        </div>
    );
}

export default BoxList;
