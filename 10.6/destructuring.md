# Destructuring Exercise
## Answers - Simon Struthers

## Object Destructuring

> What does the following code print/return?
> ```js
> let facts = {numPlanets: 8, yearNeptuneDiscovered: 1846};
> let {numPlanets, yearNeptuneDiscovered} = facts;
>
> console.log(numPlanets); // ?
> console.log(yearNeptuneDiscovered); // ?
> ```

```
> console.log(numPlanets);
8
> console.log(yearNeptuneDiscovered);
1846
```


> What does the following code print/return?
> ```js
> let planetFacts = {
>     numPlanets: 8,
>     yearNeptuneDiscovered: 1846,
>     yearMarsDiscovered: 1659
> };
>
> let {numPlanets, ...discoveryYears} = planetFacts;
>
> console.log(discoveryYears); // ?
> ```

```
> console.log(discoveryYears);
{
    yearNeptuneDiscovered: 1846,
    yearMarsDiscoverd: 1659
}
```


> What does the following code print/return?
> ```js
> function getUserData({firstName, favoriteColor="green"}){
>     return 'Your name is ${firstName} and you like ${favoriteColor}`;
> }
>
> getUserData({firstName: "Alejandro", favoriteColor: "purple"}); // ?
> getUserData({firstName: "Melissa"}); // ?
> getUserData({}); // ?
> ```

```
> getUserData({firstName: "Alejandro", favoriteColor: "purple"});
Your name is Alejandro and you like purple
> getUserData({firstName: "Melissa"});
Your name is Melissa and you like green
> getUserData({});
Your name is undefined and you like green
```


## Array Destructuring

> What does the following code print/return?
> ```js
> let [first, second, third] = ["Maya", "Marisa", "Chi"];
>
> console.log(first); // ?
> console.log(second); // ?
> console.log(third); // ?
> ```

```
> console.log(first);
Maya
> console.log(second);
Marisa
> console.log(third);
Chi
```


> What does the following code print/return?
> ```js
> let [raindrops, whiskers, ...aFewOfMyFavoriteThings] = [
>     "Raindrops on roses",
>     "whiskers on kittens",
>     "Bright copper kettles",
>     "warm woolen mittens",
>     "Brown paper packages tied up with strings"
> ];
>
> console.log(raindrops); // ?
> console.log(whiskers); // ?
> console.log(aFewOfMyFavoriteThings); // ?
> ```

```
> console.log(raindrops);
Raindrops on roses
> console.log(whiskers);
whispers on kittens
> console.log(aFewOfMyFavoriteThings);
[
    "Bright copper kettles",
    "warm woolen mittens",
    "Brown paper packages tied up with strings"
]
```


> What does the following code print/return?
> ```js
> let numbers = [10, 20, 30];
> [numbers[1], numbers[2]] = [numbers[2], numbers[1]];
>
> console.log(numbers) // ?
> ```

```
> console.log(numbers) // ?
[10, 30, 20]
```
