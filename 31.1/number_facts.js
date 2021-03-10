const BASE_URL = "http://numbersapi.com";

// 1.1: Get Numbers API fact about favorite number

const FAVORITE_NUMBER = 7;
fetch(`${BASE_URL}/${FAVORITE_NUMBER}?json`)
    .then((response) => response.json())
    .then((data) => console.log(data)
);

// 1.2: Get facts for multiple numbers in a batch request

const FAVORITE_NUMBERS = [ 7, 11, 13 ];
fetch(`${BASE_URL}/${FAVORITE_NUMBERS}?json`)
    .then((response) => response.json())
    .then((data) => console.log(data))
;

// 1.3: Get 4 facts about favorite number
const CURSOR = document.getElementById('cursor');
Promise.all(
    Array.from({ length: 4 }, () => fetch(`${BASE_URL}/${FAVORITE_NUMBER}?json`))
).then((requests) => {
    requests.forEach((request) => request.json().then(({text}) => {
        cursor.insertAdjacentText('beforebegin', '   - ' + text + '\n');
    }))
});
