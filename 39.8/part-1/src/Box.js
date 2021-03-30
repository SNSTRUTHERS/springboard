import "./Box.css";

const Box = ({ id, handleRemove, color = "orange", width = 6, height = 6 }) => (
    <div
        className="Box" 
        style={{
        backgroundColor: color,
        width: `${width * 3}rem`,
        height: `${height * 3}rem`,
    }}>
        <button className="remove" onClick={() => handleRemove(id)}>X</button>
    </div>
);

export default Box;
