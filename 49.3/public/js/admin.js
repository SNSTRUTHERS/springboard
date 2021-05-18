async function getUsers() {
    const response = await fetch("/users");
    return await response.json();
}

function renderTable(users) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const thtr = document.createElement('tr');
    const fields = [];

    for (const field in users[0]) {
        fields.push(field);

        const th = document.createElement('th');
        th.scope = "col";
        th.innerText =
            field[0].toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $&")
        ;
        
        thtr.appendChild(th);
    }
    thead.appendChild(thtr);

    for (const user of users) {
        const tr = document.createElement('tr');
        for (const field of fields) {
            const td = document.createElement('td');
            td.innerText = user[field];

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);

    table.className = 'table table-striped table-hover';
    return table;
}

const main = document.getElementsByTagName("main")[0];

getUsers().then((users) => {
    console.log(users);
    const table = renderTable(users);
    main.innerHTML = "";
    main.appendChild(table);
});
