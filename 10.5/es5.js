// == SAME KEYS & VALUES ===========================================================================

function createInstructor(firstName, lastName){
    return {
        firstName: firstName,
        lastName: lastName
    }
}

// == COMPUTED PROPERTY NAMES ======================================================================

var favoriteNumber = 42;

var instructor = {
    firstName: "Colt"
}

instructor[favoriteNumber] = "That is my favorite!"

// == OBJECT METHODS ===============================================================================

var instructor = {
    firstName: "Colt",
    sayHi: function(){
        return "Hi!";
    },
    sayBye: function(){
        return this.firstName + " says bye!";
    }
};
