# Unit 47.2
## Big-O Notation Practice

### Simplifying Expressions
Simplify the following Big-O expressions as much as possible:

1. $O(n + 10)$

    > $O(n)$

2. $O(100 \times n)$

    > $O(n)$

3. $O(25)$

    > $O(1)$

4. $O(n^2 + n^3)$

    > $O(n^3)$

5. $O(n + n + n + n)$

    > $O(n)$

6. $O(1000 \times \log(n) + n)$

    > $O(\log(n))$

7. $O(1000 \times n \times \log(n) + n)$

    > $O(n\log(n))$

8. $O(2^n + n^2)$

    > $O(2^n)$

9. $O(5 + 3 + 1)$

    > $O(1)$

10. $O(n + n^\frac{1}{2} + n^2 + n \times  \log(n)^{10}$

    > $O(n\log(n))$

### Calculating Time Complexity
Determine the time complexities for each of the following functions. If you’re not sure what these
functions do, copy and paste them into the console, and experiment with different inputs!

1.  ```js
    function logUpTo(n) {
        for (let i = 1; i <= n; i++) {
            console.log(i);
        }
    }
    ```

    > $O(n)$

2.  ```js
    function logAtLeast10(n) {
        for (let i = 1; i <= Math.max(n, 10); i++) {
            console.log(i);
        }
    }
    ```

    > $O(1)$

3.  ```js
    function logAtMost10(n) {
        for (let i = 1; i <= Math.min(n, 10); i++) {
            console.log(i);
        }
    }
    ```

    > $O(n)$

4.  ```js
    function onlyElementsAtEvenIndex(array) {
        let newArray = [];
        for (let i = 0; i < array.length; i++) {
            if (i % 2 === 0) {
                newArray.push(array[i]);
            }
        }
        return newArray;
    }
    ```

    > $O(n)$

5.  ```js
    function subtotals(array) {
        let subtotalArray = [];
        for (let i = 0; i < array.length; i++) {
            let subtotal = 0;
            for (let j = 0; j <= i; j++) {
                subtotal += array[j];
            }
            subtotalArray.push(subtotal);
        }
        return subtotalArray;
    }
    ```

    > $O(n^2)$

6.  ```js
    function vowelCount(str) {
        let vowelCount = {};
        const vowels = "aeiouAEIOU";

        for (let char of str) {
            if (vowels.includes(char)) {
                if (char in vowelCount) {
                    vowelCount[char] += 1;
                } else {
                    vowelCount[char] = 1;
                }
            }
        }

        return vowelCount;
    }
    ```

    > $O(n)$

### Short Answer
1. *True* or *false*: $n^2 + n$ is $O(n^2)$.
    
    **True**

2. *True* or *false*: $n^2 \times n$ is $O(n^3)$.
   
    **True**

3. *True* or *false*: $n^2 + n$ is $O(n)$.

    **False**

4. What's the time complexity of `Array.indexOf`?

    $O(n)$

5. What's the time complexity of `Array.includes`?

    $O(n)$

6. What's the time complexity of `Array.forEach`?

    $O(n)$

7. What's the time complexity of `Array.sort`?

    $O(n\log(n))$

8. What's the time complexity of `Array.unshift`?

    $O(n)$

9. What's the time complexity of `Array.push`?

    $O(1)$

10. What's the time complexity of `Array.splice`?

    $O(n)$

11. What's the time complexity of `Array.pop`?

    $O(1)$

12. What's the time complexity of `Object.keys`?

    $O(n)$

13. What's the space complexity of `Object.keys`?

    $O(n)$

