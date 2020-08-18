// == ASSIGNING VARIABLES TO OBJECT PROPERTIES =====================================================

let obj = {
    numbers: {
        a: 1,
        b: 2
    }
};

const { numbers: { a, b }} = obj;

// == ARRAY SWAP ===================================================================================

let arr = [1, 2];
[ arr[0], arr[1] ] = [ arr[1], arr[0] ];
