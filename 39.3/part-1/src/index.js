import food from './foods';
import { choice, remove } from './helpers';

const randFruit = choice(food);
console.log(`I'd like one ${randFruit}, please.`);
console.log(`Here you go: ${randFruit}`);
console.log("Delicious! May I have another?");
console.log(`I'm sorry, we're all out. We have ${remove(food, randFruit).length} fruits left.`);
