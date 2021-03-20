const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
    test("Creates correct partial query string & does proper name substitution.", () => {
        let result = sqlForPartialUpdate(
            { item1: "hello" },
            { item1: 'item1', itemWithCamelCase: 'item_with_underscores' }
        );

        expect(result).toEqual({
            setCols: `"item1"=$1`,
            values: [ 'hello' ]
        });

        result = sqlForPartialUpdate(
            { itemWithCamelCase: "world" },
            { item1: 'item1', itemWithCamelCase: 'item_with_underscores' }
        );

        expect(result).toEqual({
            setCols: `"item_with_underscores"=$1`,
            values: [ 'world' ]
        });

        result = sqlForPartialUpdate(
            { item1: 'hello', itemWithCamelCase: "world" },
            { item1: 'item1', itemWithCamelCase: 'item_with_underscores' }
        );

        expect(result).toEqual({
            setCols: `"item1"=$1, "item_with_underscores"=$2`,
            values: [ 'hello', 'world' ]
        });
    });
});
