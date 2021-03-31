import { useState } from "react";

/**
 * Hook for toggling between whether this component is facing up or down.
 * 
 * @returns {[
 *     boolean,
 *     () => void
 * ]} Callback function to flip the associated component over.
 */
const useFlip = () => {
    const [isFacingUp, setIsFacingUp] = useState(true);
    return [ isFacingUp, () => setIsFacingUp((isUp) => !isUp) ];
};

export default useFlip;
