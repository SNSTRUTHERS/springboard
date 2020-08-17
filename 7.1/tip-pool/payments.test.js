describe("Payments test (with setup and tear-down)", () => {
    beforeEach(() => {
        billAmtInput.value = "10";
        tipAmtInput.value = "5";
        
        serverNameInput.value = 'Alice';
    });

    it("should not create new payment entry on empty submission to submitPaymentInfo()", () => {
        billAmtInput.value = "";
        tipAmtInput.value = "";

        submitPaymentInfo();

        expect(Object.keys(allPayments).length).toEqual(0);
    });

    it("should return undefined on empty or < 0 inputs to createCurPayment()", () => {
        billAmtInput.value = "";
        tipAmtInput.value = "";

        expect(createCurPayment()).toBeUndefined();

        billAmtInput.value = "-2";
        tipAmtInput.value = "0";

        expect(createCurPayment()).toBeUndefined();
    });

    it("should add a new payment row to the table on appendPaymentTable()", () => {
        appendPaymentTable(createCurPayment());

        let td_list = document.querySelectorAll("#paymentTable tbody tr td");
        expect(td_list.length).toEqual(4);
        expect(td_list[0].innerText).toEqual('$10');
        expect(td_list[1].innerText).toEqual('$5');
        expect(td_list[2].innerText).toEqual('50%');
        expect(td_list[3].innerText).toEqual('X');
    });

    it("should correctly update the shift summary on updateSummary()", () => {
        const payment0 = createCurPayment();
        appendPaymentTable(payment0);
        allPayments["payment0"] = payment0;
        
        billAmtInput.value = "15";
        tipAmtInput.value = "3";
        const payment1 = createCurPayment();
        appendPaymentTable(payment1);
        allPayments["payment1"] = payment1;

        updateSummary();

        let td_list = document.querySelectorAll("#summaryTable tbody tr td");
        expect(td_list.length).toEqual(3);
        expect(td_list[0].innerText).toEqual('$25');
        expect(td_list[1].innerText).toEqual('$8');
        expect(td_list[2].innerText).toEqual('35%');
    });

    it("should add earnings to the current server's earning on submitPaymentInfo()", () => {
        submitServerInfo();
        submitPaymentInfo();

        let td_list = document.querySelectorAll("#serverTable tbody tr td");
        expect(td_list.length).toEqual(3);
        expect(td_list[0].innerText).toEqual('Alice');
        expect(td_list[1].innerText).toEqual('$5.00');
        expect(td_list[2].innerText).toEqual('X');
    });

    afterEach(() => {
        allPayments = {};

        billAmtInput.value = "";
        tipAmtInput.value = "";
        paymentTbody.innerHTML = "";

        let td_list = document.querySelectorAll("#summaryTable tbody tr td");
        for (let td of td_list)
            td.innerText = "";
        
        allServers = {};
        serverId = 0;
        serverTbody.innerHTML = "";
        serverNameInput.value = "";
    });
});