/**
 * @file dom_manipulation.js
 * @author Simon Struthers
 * Springboard Software Engineering track
 * Section 4.2 - DOM Manipulation
 */

// STEP 1: Select the section with an id of container without using querySelector.
var container_without_qselector = document.getElementById("container");

// STEP 2: Select the section with an id of container using querySelector.
var container_with_qselector = document.querySelector("section#container");

if (container_with_qselector !== container_without_qselector) {
    throw Error("container_with_qselector !== container_without_qselector");
}

// STEP 3: Select all of the list items with a class of “second”.
var second_list = document.getElementsByClassName("second");

// STEP 4: Select a list item with a class of third, but only the list item inside of the ol tag.
var third_inside_ol = document.querySelector("ol li.third");

// STEP 5: Give the section with an id of container the text “Hello!”.
container_without_qselector.innerText = "Hello!";

// STEP 6: Add the class main to the div with a class of footer.
var footer = document.querySelector("div.footer");
footer.classList.add("main");

// STEP 7: Remove the class main on the div with a class of footer.
footer.classList.remove("footer");

// STEP 8: Create a new li element.
var new_li_elem = document.createElement("li");

// STEP 9: Give the li the text "four".
new_li_elem.innerText = "four";

// STEP 10: Append the li to the ul element.
var ul = document.querySelector("ul");
ul.appendChild(new_li_elem);

// STEP 11: Loop over all of the lis inside the ol tag and give them a background color of “green”.
for (let li of document.querySelectorAll("ol li")) {
    li.style.backgroundColor = "green";
}

// STEP 12: Remove the div with a class of footer
footer.remove();
