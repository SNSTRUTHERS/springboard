describe("Helpers test", () => {
    beforeEach(() => {
        allPayments = {
            payment0: {
                tipAmt: 2,
                billAmt: 25,
                tipPercent: 8
            },

            payment1: {
                tipAmt: 5,
                billAmt: 35,
                tipPercent: 14
            },

            payment2: {
                tipAmt: 4,
                billAmt: 40,
                tipPercent: 10
            }
        };
        
        billAmtInput.value = "10";
        tipAmtInput.value = "5";
    });

    it("should sum property with all values into a single number in sumPaymentTotal()", () => {
        expect(sumPaymentTotal("billAmt")).toEqual(100);
        expect(sumPaymentTotal("tipAmt")).toEqual(11);
        expect(sumPaymentTotal("tipPercent")).toEqual(32);
    });

    it("should find the rounded tip percentage in calculateTipPercent()", () => {
        for (let key in allPayments)
            expect(
                calculateTipPercent(allPayments[key].billAmt, allPayments[key].tipAmt)
            ).toEqual(allPayments[key].tipPercent);
    });

    it("should delete the table row when clicking its X button via deleteBtnOnClick()", () => {
        appendPaymentTable(createCurPayment());

        const x_button = paymentTbody.querySelector("td:last-child");
        deleteBtnOnClick({ target: x_button });

        expect(paymentTbody.querySelectorAll("tr").length).toEqual(0);
    });

    afterEach(() => {
        allPayments = {};

        billAmtInput.value = "";
        tipAmtInput.value = "";
        paymentTbody.innerHTML = "";
    });
});