const MOOD_MAP = new Map([
    [ 'happy', '(ʘ‿ʘ)' ],
    [ 'giddy', '(⊙▽⊙)' ],
    [ 'angry', '(ಠ_ಠ)' ],
    [ 'bored', '(-__-)' ],
    [ 'laugh', '(^○^)' ]
]);

const moodStore = Redux.createStore((
    state = localStorage.getItem("mood") || "happy",
    { type, ...action }
) => {
    switch (type) {
    case 'SET_MOOD':
        state = action.mood;
        break;

    default:
        break;
    }

    document.getElementById("face").innerText = MOOD_MAP.get(state) || MOOD_MAP.get('happy');
    localStorage.setItem("mood", state);
    return state;
});

document.getElementById("moods").onclick = (event) => {
    moodStore.dispatch({
        type: "SET_MOOD",
        mood: event.target.dataset["mood"]
    });
};
