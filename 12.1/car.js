class Vehicle {
    make;
    model;
    year;

    constructor(make, model, year) {
        this.make = make;
        this.model = model;
        this.year = year;
    }

    honk() {
        return "Beep.";
    }

    toString() {
        return `This vehicle is a ${this.make} ${this.model} from ${this.year}.`;
    }
}

class Car extends Vehicle {
    numWheels = 4;

    constructor(make, model, year) {
        super(make, model, year);
    }
}

class Motorcycle extends Vehicle {
    numWheels = 2;

    constructor(make, model, year) {
        super(make, model, year);
    }

    revEngine() {
        return "VROOM!!!";
    }
}

class Garage {
    vehicles = [];
    capacity;

    constructor(capacity) {
        this.capacity = capacity;
    }

    add(vehicle) {
        if (!(vehicle instanceof Vehicle)) {
            console.log("Only vehicles are allowed in here!");
            return;
        }

        if (this.vehicles.length === this.capacity) {
            console.log("Sorry, we're full.");
            return;
        }

        this.vehicles.push(vehicle);
    }
}
