// Same keys & values
const createInstructor = (firstName, lastName) => ({ firstName, lastName });

// Computed property names
let favoriteNumber = 42;
let instructor = {
    firstName: "Colt",
    [favoriteNumber]: "That is my favorite!"
};

// Object methods
instructor = {
    firstName: "Colt",
    sayHi() {
        return "Hi!";
    },
    sayBye() {
        return this.firstName + " says bye!";
    }
};

// createAnimal
const createAnimal = (species, verb, noise) => ({
    species,
    [verb]: () => noise
});
