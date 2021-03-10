const BASE_URL = "http://numbersapi.com";

(async () => {
    // 1.1: Get Numbers API fact about favorite number

    const FAVORITE_NUMBER = 7;
    let data = await (await fetch(`${BASE_URL}/${FAVORITE_NUMBER}?json`)).json();
    console.log(data);

    // 1.2: Get facts for multiple numbers in a batch request

    const FAVORITE_NUMBERS = [ 7, 11, 13 ];
    data = await (await fetch(`${BASE_URL}/${FAVORITE_NUMBERS}?json`)).json();
    console.log(data);

    // 1.3: Get 4 facts about favorite number
    
    const CURSOR = document.getElementById('cursor');
    
    const ITEMS = Array.from({ length: 4 }, () => fetch(`${BASE_URL}/${FAVORITE_NUMBER}?json`));
    const JSONS = [];
    for await (const request of ITEMS)
        JSONS.push(request.json());
    
    for await (const { text } of JSONS)
        CURSOR.insertAdjacentText('beforebegin', '   - ' + text + '\n');
})();
