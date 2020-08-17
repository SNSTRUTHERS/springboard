describe("Servers test (with setup and tear-down)", () => {
    beforeEach(() => {
        // initialization logic
        serverNameInput.value = 'Alice';
    });

    it('should add a new server to allServers on submitServerInfo()', () => {
        submitServerInfo();

        expect(Object.keys(allServers).length).toEqual(1);
        expect(allServers['server' + serverId].serverName).toEqual('Alice');
    });

    it('should not create new server entry on empty submission to submitServerInfO()', () => {
        serverNameInput.value = "";
        submitServerInfo();

        expect(Object.keys(allServers).length).toEqual(0);
    });

    it('should correctly display servers in table on updateServerTable()', () => {
        submitServerInfo();
        updateServerTable();

        let td_list = document.querySelectorAll("#serverTable tbody tr td");
        expect(td_list.length).toEqual(3);
        expect(td_list[0].innerText).toEqual('Alice');
        expect(td_list[1].innerText).toEqual('$0.00');
        expect(td_list[2].innerText).toEqual('X');
    });

    afterEach(() => {
        // teardown logic
        allServers = {};
        serverId = 0;
        serverTbody.innerHTML = "";
        serverNameInput.value = "";
    });
});
