// == ASSIGNING VARIABLES TO OBJECT PROPERTIES =====================================================

var obj = {
    numbers: {
        a: 1,
        b: 2
    }
};
  
var a = obj.numbers.a;
var b = obj.numbers.b;

// == ARRAY SWAP ===================================================================================

var arr = [1, 2];
var temp = arr[0];
arr[0] = arr[1];
arr[1] = temp;
