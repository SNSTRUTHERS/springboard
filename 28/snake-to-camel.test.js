describe("#snakeToCamel", () => {
  it("passes_standard_cases", function() {
    expect(snakeToCamel("awesome_sauce")).toBe("awesomeSauce");
    expect(snakeToCamel("a_man_a_plan")).toBe("aManAPlan");
    expect(snakeToCamel("HOW_ABOUT_NOW?")).toBe("HOWABOUTNOW?");

    // BONUS

    // expect(snakeToCamel("__awesome_sauce__")).toBe("__awesomeSauce__");
    // expect(snakeToCamel("__awesome_sauce")).toBe("__awesomeSauce");
  });
});
