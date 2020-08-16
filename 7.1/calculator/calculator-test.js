
it('should calculate the monthly rate correctly', () => {
    let values = {
        amount: 20000,
        years: 15,
        rate: 1.05
    };
    expect(calculateMonthlyPayment(values)).toBe("1750.00");

    values = {
        amount: 12500,
        years: 20,
        rate: 38.2
    };
    expect(calculateMonthlyPayment(values)).toBe("39791.67");
});


it("should return a result with 2 decimal places", () => {
    const values = {
        amount: 150,
        years: 1,
        rate: 1.05
    };
    
    expect(calculateMonthlyPayment(values)).toMatch(/^[0-9]+\.[0-9][0-9]$/);
});

it("should verify user input", () => {
    let values = {
        amount: 150,
        years: 0,
        rate: 1.05
    };

    expect(() => calculateMonthlyPayment(values)).toThrowError();

    values.years = -2;
    expect(() => calculateMonthlyPayment(values)).toThrowError();

    values.years = 1;
    values.rate = 0;
    
    expect(() => calculateMonthlyPayment(values)).toThrowError();

    values.years = -1;
    expect(() => calculateMonthlyPayment(values)).toThrowError();
});
