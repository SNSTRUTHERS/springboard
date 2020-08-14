/**
 * @file todos.js
 * @author Simon Struthers
 * Springboard Software Engineering track
 * Section 4.4 - localStorage
 */

// UL containing the TODO list
var ul = document.querySelector("ul");

// creates a new TODO list item node
function create_todo_node(text, done) {
    let li = document.createElement("li");
    li.appendChild(document.createElement("button"));
    
    let span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);

    if (done)
        li.classList.add("done");

    ul.appendChild(li);
}

// get TODO list from localStorage & add the items to the TODO list
var items = JSON.parse(localStorage.getItem("todo_list"));
if (items) {
    for (let item of items)
        create_todo_node(item.text, item.done);
} else {
    items = [];
}

// delegate UL click events to handle both strikethrough and item deletion
ul.addEventListener("click", e => {
    let li;

    if (e.target.tagName === "BUTTON" || e.target.tagName === "SPAN") {
        li = e.target.parentElement;
    } else if (e.target.tagName === "LI") {
        li = e.target;
    }

    // toggle strikethrough
    if (li) {
        // find index of li in items list
        let i = -1;
        let node = li;
        while (node != null) {
            node = node.previousElementSibling;
            i++;
        }
        
        // perform appropriate action
        if (e.target.tagName === "BUTTON") {
            li.remove();
            items.splice(i,1);
        } else {
            li.classList.toggle("done");
            items[i].done = !items[i].done;
        }
        
        // update localStorage
        localStorage.setItem("todo_list", JSON.stringify(items));
    }
});

// add a new item to the TODO list
var form = document.querySelector("form");
var text = document.getElementById("text");
form.addEventListener("submit", e => {
    e.preventDefault();

    // push new li, item object, and update localStorage
    create_todo_node(text.value, false);
    items.push({text: text.value, done: false});
    localStorage.setItem("todo_list", JSON.stringify(items));

    text.value = "";
});
