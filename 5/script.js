/**
 * @file SCRIPT.js
 * @author Simon Struthers
 * @date 4 August 2020
 * Springboard Software Engineering track
 * Section 5.0 - Simon's Meme Generator
 */

// bool to keep track of unsaved work
var unsaved_work = false;

const builtin_templates = {
    "award": {
        "id": "award",
        "name": "Here's Your Award",
        "image": "award.jpg",
        "boxes": [
            {
                name: "Person's Name",
                font: "Arial",
                x: 0.75,
                y: 0.15,
                w: 0.45,
                h: 0.1,
                size: 45,
                color: "#ffffff",
                outline: "#000000",
                width: 0,
                rot: 0
            },
            {
                name: "Award Text",
                font: "Arial",
                x: 0.17,
                y: 0.715,
                w: 0.18,
                h: 0.3,
                size: 32,
                color: "#000000",
                outline: "#ffffff",
                width: 0,
                rot: 5
            }
        ]
    },
    
    "junior_senior": {
        "id": "junior_senior",
        "name": "Junior Dev/Senior Dev",
        "image": "junior_senior.jpg",
        "boxes": [
            {
                name: "Nick's Name",
                font: "Arial",
                x: 0.05,
                y: 0.05,
                w: 0.3,
                h: 0.1,
                size: 32,
                color: "#ffffff",
                outline: "#000000",
                width: 0,
                rot: 0
            },
            {
                name: "Shawn's Name",
                font: "Arial",
                x: 0.45,
                y: 0.3,
                w: 0.3,
                h: 0.1,
                size: 32,
                color: "#ffffff",
                outline: "#000000",
                width: 0,
                rot: 0
            }
        ]
    },
    
    "strut": {
        "id": "strut",
        "name": "I'm Walkin' 'Ere",
        "image": "strut.jpg",
        "boxes": [
            {
                name: "Strutter Label",
                font: "Arial",
                x: 0.06,
                y: 0.25,
                w: 0.35,
                h: 0.1,
                size: 36,
                color: "#000000",
                outline: "#ffffff",
                width: 0,
                rot: 0
            },
            {
                name: "Shooter Label",
                font: "Arial",
                x: 0.98,
                y: 0.32,
                w: 0.35,
                h: 0.1,
                size: 36,
                color: "#ffffff",
                outline: "#000000",
                width: 0,
                rot: 0
            }
        ]
    },

    "white_knight": {
        "id": "white_knight",
        "name": "A White Knight Approaches",
        "image": "white_knight.jpg",
        "boxes": [
            {
                name: "Top Text",
                font: "Impact",
                x: 0,
                y: 0,
                w: 1,
                h: 0.25,
                size: 80,
                color: "#ffffff",
                outline: "#000000",
                width: 25,
                rot: 0
            },
            {
                name: "Bottom Text",
                font: "Impact",
                x: 0,
                y: 1,
                w: 1,
                h: 0.25,
                size: 80,
                color: "#ffffff",
                outline: "#000000",
                width: 25,
                rot: 0
            }
        ]
    }
};

// add user templates to image template in new memes form
const builtin_templates_optgroup = document.querySelector(
    "#image_template optgroup[label=\"Builtin Templates\"]"
);
const user_templates_optgroup = document.querySelector(
    "#image_template optgroup[label=\"User Templates\"]"
);

// Add builtin templates
for (let template in builtin_templates) {
    let opt = document.createElement("option");
    opt.setAttribute("value", template);
    opt.innerText = builtin_templates[template]["name"];

    builtin_templates_optgroup.appendChild(opt);
}

// meme list & function to add a new node to the meme list
const meme_list = document.getElementById("meme_list");
function create_meme_list_node(meme) {
    for (let meme_item of memes) {
        if (meme_item.name === meme.name) {
            const ind = memes.indexOf(meme_item);
            meme_list.removeChild(meme_list.children[ind]);
            memes.splice(ind, 1);
            break;
        }
    }

    let li = document.createElement("li");
    li.style.setProperty("--image", `url(${meme.image})`);
    li.innerText = meme.name;

    let x_button = document.createElement("div");
    x_button.className = "x_button";
    li.appendChild(x_button);

    meme_list.appendChild(li);

    memes.push(meme);
}

// removes a meme from the meme list & database
function remove_meme(meme) {
    const ind = memes.indexOf(meme);
    if (ind >= 0) {
        // remove from database
        db.transaction("memes", "readwrite")
            .objectStore("memes")
            .delete(meme.name)
            .addEventListener("success", event => {
            
            meme_list.removeChild(meme_list.children[ind]);
            memes.splice(ind, 1);
        });
    }
}

// I'm using indexedDB instead of localStorage for more storage space
var db;
var templates = {};
var memes = [];
if (!window.indexedDB)
    console.warn(
        "Your browser doesn't support indexedDB; saved memes & templates won't be available"
    );
else {
    let open_req = window.indexedDB.open("simons_meme_generator_db", 2);
    open_req.addEventListener("error", event => {
        console.warn("Couldn't open saved memes & templates database.");
    });
    open_req.addEventListener("blocked", event => {
        alert(`Couldn't open saved memes & templates database;
close other tabs with this site open before proceeding.`);
    });
    open_req.addEventListener("success", event => {
        db = event.target.result;
        
        // read in templates
        let trans = db.transaction(['templates', 'memes'], 'readonly');
        trans.objectStore('templates').getAll().addEventListener("success", event => {
            const items = event.target.result;
            for (let item of items) {
                templates[item['id']] = item;

                let opt = document.createElement("option");
                opt.setAttribute("value", item['id']);
                opt.innerText = item['name'];
        
                user_templates_optgroup.appendChild(opt);
            }
        });

        // read in memes
        trans.objectStore('memes').getAll().addEventListener("success", event => {
            for (let meme of event.target.result)
                create_meme_list_node(meme);
        });
    });
    open_req.addEventListener("upgradeneeded", event => { 
        db = event.target.result;

        let template_store = db.createObjectStore("templates", { keyPath: "id" });
        template_store.createIndex("name", "name", { unique: false });
        template_store.createIndex("image", "image", { unique: false });
        template_store.createIndex("boxes", "boxes", { unique: false });

        let meme_store = db.createObjectStore("memes", { keyPath: "name" });
        meme_store.createIndex("box_text", "box_text", { unique: false });
    });
}

const meme_name_input = document.getElementById("meme_name");
if (meme_name_input.getAttribute("disabled") !== "")
    meme_name_input.setAttribute("disabled", "");

const save_meme_btn = document.getElementById("save_meme");
if (save_meme_btn.getAttribute("disabled") !== "")
    save_meme_btn.setAttribute("disabled", "");
save_meme_btn.addEventListener("click", event => {
    const meme_name = meme_name_input.value;
    if (!meme_name) {
        alert("This meme must have a name to be saved.");
        return;
    }

    const meme_image = current_image.src;

    const meme_bg = document.getElementById("meme_background");
    let meme_text = [];
    for (let child of meme_bg.children)
        meme_text.push(child.innerHTML);

    let trans = db.transaction('memes', 'readonly');
    trans.objectStore('memes').getAllKeys().addEventListener("success", event => {
        const items = event.target.result;
        if (items.includes(meme_name) &&
            !confirm(`Meme with name "${meme_name}" already exists. Overwrite?`)
        )
            return;

        let new_meme = { "name": meme_name, "image": meme_image, "boxes": [] };
        let i = 0;
        for (let box of box_properties.children) {
            if (box === box_properties.lastChild)
                break;
            
            new_meme.boxes.push({
                name: box.childNodes[0].textContent,
                font: box.querySelector(".font").value,
                size: parseFloat(box.querySelector(".size").value),
                x: parseFloat(box.querySelector(".x").value),
                y: parseFloat(box.querySelector(".y").value),
                w: parseFloat(box.querySelector(".w").value),
                h: parseFloat(box.querySelector(".h").value),
                color: box.querySelector(".color").value,
                outline: box.querySelector(".outline").value,
                width: parseFloat(box.querySelector(".width").value) *
                    (box.querySelector(".shadow").checked ? 1 : -1),
                rot: parseFloat(box.querySelector(".rot").value),
                text: meme_text[i]
            });
            i++;
        }

        let trans = db.transaction('memes', 'readwrite');
        let req = trans.objectStore('memes').put(new_meme);
        req.addEventListener("error", event => {
            alert(`Failed to save meme "${meme_name}"!`);
        });
        req.addEventListener("success", event => {
            unsaved_work = false;
            create_meme_list_node(new_meme);
        });
    });
});

const save_image_btn = document.getElementById("save_image");
if (save_image_btn.getAttribute("disabled") !== "")
    save_image_btn.setAttribute("disabled", "");
save_image_btn.addEventListener("click", event => {
    const canvas = document.getElementsByTagName("canvas")[0];
    canvas.width = current_image.width;
    canvas.height = current_image.height;

    const context = canvas.getContext("2d");
    context.fillStyle = "#000000";
    context.drawImage(current_image, 0, 0);

    context.textAlign = "center";
    context.shadowColor = "#000000";

    const meme_bg = document.getElementById("meme_background");

    let i = 0;
    for (let box of box_properties.children) {
        context.font = 
            `${parseFloat(box.querySelector(".size").value)}px ${box.querySelector(".font").value}`
        ;
        context.fillStyle = box.querySelector(".color").value;
        
        const width = parseFloat(box.querySelector(".width").value) *
            (box.querySelector(".shadow").checked ? 1 : -1);
        
        // set up shadow or outline
        context.shadowBlur = 0;
        context.lineWidth = 0;
        if (width < 0)
            context.lineWidth = -width;
        else
            context.shadowBlur = width;

        context.fillText(meme_bg.children[i].innerText);

        context.shadowBlur = 0;
        context.lineWidth = 0;

        context.strokeText(meme_bg.children[i].innerText);
        
        i++;
    }

    canvas.style.display = "block";
});

const save_template_btn = document.getElementById("save_template");
if (save_template_btn.getAttribute("disabled") !== "")
    save_template_btn.setAttribute("disabled", "");
save_template_btn.addEventListener("click", event => {
    const name = prompt("Name this meme template:");
    if (!name)
        return;
    
    let i = 0;
    for (let j in templates) { i++ }
    const id = `template${i}`;
    
    const meme_image = current_image.src;
    let new_template = { "id": id, "name": name, "image": meme_image, "boxes": [] };
    for (let box of box_properties.children) {
        if (box === box_properties.lastChild)
            break;
        
        new_template.boxes.push({
            name: box.childNodes[0].textContent,
            font: box.querySelector(".font").value,
            size: parseFloat(box.querySelector(".size").value),
            x: parseFloat(box.querySelector(".x").value),
            y: parseFloat(box.querySelector(".y").value),
            w: parseFloat(box.querySelector(".w").value),
            h: parseFloat(box.querySelector(".h").value),
            color: box.querySelector(".color").value,
            outline: box.querySelector(".outline").value,
            width: parseFloat(box.querySelector(".width").value) *
                (box.querySelector(".shadow").checked ? 1 : -1),
            rot: parseFloat(box.querySelector(".rot").value)
        });
    }

    let trans = db.transaction('templates', 'readwrite')
        .objectStore('templates')
        .put(new_template)
    ;
    trans.addEventListener("error", event => {
        alert(`Failed to save new template "${name}"`)
    });
    trans.addEventListener("success", event => {
        let opt = document.createElement("option");
        opt.setAttribute("value", id);
        opt.innerText = name;
        user_templates_optgroup.appendChild(opt);

        templates[id] = new_template;
    });
});

// current image being used as image macro
var current_image = null;

// new meme form containing div
const new_meme_div = document.getElementById("new_meme_form");

// resets which form input is required to proceed with creating a new meme
function reset_new_meme_required(option) {
    if (!option) {
        option = new_meme_div.querySelector(`form input[type="radio"]`);
        option.checked = true;
    }

    for (let div of new_meme_div.querySelectorAll("form div")) {
        if (div.id === `${option.id}_subform`) {
            div.querySelector("input, select").setAttribute("required", "true");
        } else {
            div.querySelector("input, select").removeAttribute("required");
        }
    }
}

// set up radio buttons to configure required form items
for (let option of new_meme_div.querySelectorAll(`form input[type="radio"]`)) {
    option.addEventListener("change", () => {
        reset_new_meme_required(option);
    });
}

// update the width & height of the meme background based on the resizer's height
function update_meme_bg_size() {
    if (!current_image)
        return;

    unsaved_work = true;
    
    const mlheight = parseInt(document.body.style.getPropertyValue("--mlh"));
    const new_height = window.innerHeight - mlheight - 37;

    const aspect_ratio = current_image.width / current_image.height
    const new_width = new_height * aspect_ratio;
    meme_bg.style.width = `${new_width}px`;

    let comp_style = getComputedStyle(meme_bg);
    let w = parseInt(comp_style.width);

    const percentage = w / current_image.width;
    meme_bg.style.height = `${current_image.height * percentage}px`;

    comp_style = getComputedStyle(meme_bg);
    w = parseInt(comp_style.width);
    const h = parseInt(comp_style.height);

    for (let child of meme_bg.children) {
        child.style.setProperty("--pw", `${w}px`);
        child.style.setProperty("--ph", `${h}px`);

        let size = parseInt(child.style.getPropertyValue("--size"));
        if (isNaN(size) || size < 0)
            size = 0;
        
            child.style.fontSize = `${percentage * size}px`;

        const ow = parseInt(child.style.getPropertyValue("--ow"));
        if (ow < 0) /* solid outline */ {
            child.style.webkitTextStrokeWidth = `${percentage * -ow}px`;
            child.style.textShadow = "";
        } else if (ow > 0) /* shadow */ {
            child.style.textShadow = 
                `${child.style.webkitTextStrokeColor} 0 0 ${percentage * ow}px`
            ;
            child.style.webkitTextStrokeWidth = "";
        } else {
            child.style.webkitTextStrokeWidth = "";
            child.style.textShadow = "";
        }
    }
}

// generate new text box along with properties
function create_text_box(meme_bg, text_box) {
    unsaved_work = true;

    // create editable text box element for meme background
    let div = document.createElement("div");

    div.style.fontFamily = `"${text_box.font}"`;
    div.style.setProperty('--x', text_box.x);
    div.style.setProperty('--y', text_box.y);
    div.style.setProperty('--w', text_box.w);
    div.style.setProperty('--h', text_box.h);

    div.setAttribute("contenteditable", "true");
    
    div.style.setProperty('--size', text_box.size);
    div.style.color = text_box.color;
    div.style.webkitTextStrokeColor = text_box.outline;
    div.style.setProperty('--ow', text_box.width);
    div.style.setProperty('--rot', `${text_box.rot}deg`);

    // regex replace
    if (text_box.text) {
        let match = text_box.text.match(/(.*?)(?:\<br\>)+/);
        if (match)
            div.innerHTML = match[1];
        else
            div.innerHTML = text_box.text;
    }

    meme_bg.appendChild(div);

    // create attribute divs for box properties
    div = document.createElement("div");
    div.appendChild(document.createTextNode(text_box.name));

    let child = document.createElement("div");

    // Rect attributes (x, y, w, h)
    let input = document.createElement("span");
    input.innerText = "Rect";
    input.className = "label";
    child.appendChild(input);
    const elems = [ "x", "y", "w", "h" ];
    for (let i = 0; i < 4; i++) {
        input = document.createElement("input");
        input.setAttribute("type", "number");
        input.setAttribute("step", "0.001");
        input.setAttribute("min", "0");
        input.setAttribute("max", "1");

        input.value = text_box[elems[i]];
        input.classList.add("small_box");
        input.classList.add(elems[i]);
        child.appendChild(input);
    }
    input = document.createElement("br");
    child.appendChild(input);

    // Font attributes (font, size)
    input = document.createElement("span");
    input.innerText = "Font";
    input.className = "label";
    child.appendChild(input);
    
    // font selection box
    input = document.createElement("select");
    const opts = [
        "Arial",
        "Arial Black",
        "Comic Sans MS",
        "Courier New",
        "Georgia",
        "Impact",
        "Lucida Console",
        "Palatino",
        "Tahoma",
        "Times New Roman",
        "Trebuchet MS",
        "Verdana"
    ];
    for (let opt of opts) {
        let option = document.createElement("option");
        option.setAttribute("value", opt);
        option.innerText = opt;
        input.appendChild(option);
    }
    input.value = text_box.font;
    input.className = "font";
    child.appendChild(input);
    
    // font size
    input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("min", "1");
    input.value = text_box.size;
    input.classList.add("size");
    input.classList.add("small_box");
    child.appendChild(input);

    input = document.createElement("br");
    child.appendChild(input);

    // Color attributes (text color & outline color)
    input = document.createElement("span");
    input.innerText = "Color";
    input.className = "label";
    child.appendChild(input);
    input = document.createElement("input");
    input.setAttribute("type", "color");
    input.value = text_box.color;
    input.className = "color";
    child.appendChild(input);
    input = document.createElement("input");
    input.setAttribute("type", "color");
    input.value = text_box.outline;
    input.className = "outline";
    child.appendChild(input);
    input = document.createElement("br");
    child.appendChild(input);

    // Outline attributes (shadow/outline + width)
    input = document.createElement("span");
    input.innerText = "Outline";
    input.className = "label";
    child.appendChild(input);
    
    input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.value = text_box.width;
    input.classList.add("shadow");
    if (text_box.width == 0)
        input.setAttribute("disabled", "");
    else if (text_box.width > 0)
        input.checked = true;
    child.appendChild(input);
    input = document.createElement("span");
    input.innerText = "Shadow";
    child.appendChild(input);

    input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("min", "0");
    input.value = text_box.width;
    input.classList.add("width");
    input.classList.add("small_box");
    child.appendChild(input);
    input = document.createElement("br");
    child.appendChild(input);

    // Transform attributes (rotation)
    input = document.createElement("span");
    input.innerText = "Rotation";
    input.className = "label";
    child.appendChild(input);
    input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("step", "0.5");
    input.setAttribute("min", "0");
    input.setAttribute("max", "360");
    input.value = text_box.rot;
    input.className = "rot";
    child.appendChild(input);
    input = document.createElement("br");
    child.appendChild(input);

    div.appendChild(child);

    box_properties.appendChild(div);

    // X button
    child = document.createElement("div");
    child.className = "x_button";
    div.appendChild(child);
}

// div containing text box properties
const box_properties = document.getElementById("box_properties");
box_properties.addEventListener("click", event => {
    const meme_bg = document.getElementById("meme_background");

    if (event.target.classList.contains("x_button")) {
        let i = 0;
        let sibling = event.target.parentElement.previousElementSibling;
        while (sibling) {
            i++;
            sibling = sibling.previousElementSibling;
        }

        event.target.parentElement.remove();
        meme_bg.removeChild(meme_bg.children[i]);

        unsaved_work = true;
    } else if (event.target.parentElement === box_properties) {
        if (event.target == box_properties.lastChild) {
            let text_box_name = prompt(
                "Input text box name:",
                `Text Box ${box_properties.children.length}`
            );
            if (!text_box_name)
                return;
            
            event.target.remove();
            create_text_box(meme_bg, {
                name: text_box_name,
                font: "Arial",
                size: 36,
                x: 0,
                y: 0,
                w: 1,
                h: 0.25,
                color: "#ffffff",
                outline: "#000000",
                width: 0,
                rot: 0
            });
            update_meme_bg_size();
            box_properties.lastChild.classList.add("active");
            for (let child of meme_bg.children)
                child.classList.remove("active");
            meme_bg.lastChild.classList.add("active");
            box_properties.appendChild(event.target);

            unsaved_work = true;
            return;
        }

        let i = 0;
        let sibling = event.target.previousElementSibling;
        while (sibling) {
            i++;
            sibling = sibling.previousElementSibling;
        }

        for (let child of meme_bg.children)
            child.classList.remove("active");

        event.target.classList.toggle("active");
        if (event.target.classList.contains("active"))
            meme_bg.children[i].classList.add("active");
        else
            meme_bg.children[i].classList.remove("active");
        
        unsaved_work = true;
    }
});
box_properties.addEventListener("input", event => {
    const meme_bg = document.getElementById("meme_background");
    const input = event.target;

    let i = 0;
    let sibling = event.target.parentElement.parentElement.previousElementSibling;
    while (sibling) {
        i++;
        sibling = sibling.previousElementSibling;
    }

    const text_box = meme_bg.children[i];

    if (input.classList.contains("font")) {
        text_box.style.fontFamily = input.value;
    } else if (input.classList.contains("x")) {
        if (input.value > 1)
            input.value = 1;
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--x", input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("y")) {
        if (input.value > 1)
            input.value = 1;
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--y", input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("w")) {
        if (input.value > 1)
            input.value = 1;
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--w", input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("h")) {
        if (input.value > 1)
            input.value = 1;
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--h", input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("size")) {
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--size", input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("color")) {
        text_box.style.color = input.value;
    } else if (input.classList.contains("outline")) {
        text_box.style.webkitTextStrokeColor = input.value;
        update_meme_bg_size();
    } else if (input.classList.contains("rot")) {
        if (input.value > 360)
            input.value = 360;
        if (input.value < 0)
            input.value = 0;
        text_box.style.setProperty("--rot", `${input.value}deg`);
        update_meme_bg_size();
    } else if (input.classList.contains("width")) {
        if (input.value < 0)
            input.value = 0;
        else if (input.value == 0)
            input.previousElementSibling.previousElementSibling.setAttribute("disabled", "");
        else
            input.previousElementSibling.previousElementSibling.removeAttribute("disabled");

        const mul = input.previousElementSibling.previousElementSibling.checked ? 1 : -1;
        text_box.style.setProperty("--ow", mul * input.value);
        update_meme_bg_size();
    } else if (input.classList.contains("shadow")) {
        text_box.style.setProperty("--ow", parseInt(text_box.style.getPropertyValue("--ow")) * -1);
        update_meme_bg_size();
    }
});

// new meme creation process
const workspace = document.getElementById("workspace");
function new_meme(img_url, text_boxes, after = () => {}) {
    new_meme_div.classList.remove("active");

    current_image = new Image();
    current_image.addEventListener("load", (event) => {
        // remove previous meme background if it exists
        if (document.getElementById("meme_background"))
            workspace.removeChild(document.getElementById("meme_background"));
        
        // remove previous box properties
        let child = box_properties.firstElementChild;
        while (child) {
            let next_child = child.nextElementSibling;
            child.remove();
            child = next_child;
        }

        // enable sidebar inputs
        meme_name_input.removeAttribute("disabled");
        save_meme_btn.removeAttribute("disabled");
        save_image_btn.removeAttribute("disabled");
        save_template_btn.removeAttribute("disabled");

        // create new meme background
        meme_bg = document.createElement("div");
        meme_bg.id = "meme_background";
        meme_bg.style.setProperty("--image", `url(${img_url})`);

        workspace.appendChild(meme_bg);
        unsaved_work = true;

        for (let text_box of text_boxes) {
            create_text_box(meme_bg, text_box);
        }

        let btn = document.createElement("div");
        btn.innerText = "New Text Box";
        box_properties.appendChild(btn);

        // set meme_bg focus in/out handlers
        meme_bg.addEventListener("focusin", event => {
            for (let div of meme_bg.children) {
                if (div == event.target)
                    div.classList.add("active");
                else
                    div.classList.remove("active");
            }
        });

        update_meme_bg_size();
        after();
    });
    
    current_image.src = img_url;
}

// register submission listener for new meme form
const new_meme_form = document.querySelector("#new_meme_form form");
new_meme_form.addEventListener("submit", event => {
    event.preventDefault();

    let img_url;
    let text_boxes = [
        {
            name: "Top Text",
            font: "Impact",
            x: 0,
            y: 0,
            w: 1,
            h: 0.25,
            size: 80,
            color: "#ffffff",
            outline: "#000000",
            width: 25,
            rot: 0
        },
        {
            name: "Bottom Text",
            font: "Impact",
            x: 0,
            y: 1,
            w: 1,
            h: 0.25,
            size: 80,
            color: "#ffffff",
            outline: "#000000",
            width: 25,
            rot: 0
        }
    ];

    switch (new_meme_div.querySelector(`form input[type="radio"]:checked`).value) {
    case "url":
        img_url = document.getElementById("image_link").value;
        if (img_url.match(/\.(jpeg|jpg|jfif|pjpeg|pjp|gif|png|tif|tiff|webp|svg)$/) != null) {
            alert(`Invalid image URL: ${file.name}`);
            return;
        }
        break;

    case "file":
        let file_reader = new FileReader();
        let file = document.getElementById("image_file").files[0];

        file_reader.addEventListener("load", event => {
            if ([
                    "image/png",
                    "image/gif",
                    "image/jpeg",
                    "image/webp",
                    "image/tiff",
                    "image/svg+xml"
                ].includes(file.type)
            )
                new_meme(file_reader.result, text_boxes);
            else
                alert(`Invalid image file: ${file.name}`);
        });
        file_reader.addEventListener("error", event => {
            alert(`Failed to load file ${file.name}`);
        });
        file_reader.readAsDataURL(file);
        return;

    case "template":
        let template = document.getElementById("image_template").value;
        if (builtin_templates[template]) {
            img_url = builtin_templates[template].image;
            text_boxes = builtin_templates[template].boxes;
        } else {
            img_url = templates[template].image;
            text_boxes = templates[template].boxes;
        }
        break;
    }

    new_meme(img_url, text_boxes);
});

document.querySelector("#new_meme_form .x_button").addEventListener("click", event => {
    new_meme_div.classList.remove("active");
});

// open & edit previous memes in memes list
meme_list.addEventListener("click", event => {
    if (event.target.classList.contains("x_button")) /* delete current meme */ {
        if (!confirm(`Are you sure you want to delete "${event.target.parentElement.innerText}"?`))
            return;

        let i = 0;
        let sibling = event.target.parentElement.previousElementSibling;
        while (sibling) {
            sibling = sibling.previousElementSibling;
            i++;
        }

        remove_meme(memes[i]);
    } else if (event.target != meme_list) /* load saved meme */ {
        if (unsaved_work && !confirm("Continue without saving the current meme?"))
            return;

        let i = 0;
        let sibling = event.target.previousElementSibling;
        while (sibling) {
            sibling = sibling.previousElementSibling;
            i++;
        }

        meme_name_input.value = memes[i].name;
        new_meme(memes[i].image, memes[i].boxes, () => { unsaved_work = false; });
    }
});

// open new meme form
const new_meme_button = document.getElementById("new_meme_button");
new_meme_button.addEventListener("click", event => {
    if (unsaved_work && !confirm("Continue without saving the current meme?"))
        return;
    
    new_meme_div.classList.add("active");
    
    reset_new_meme_required(new_meme_div.querySelector("form input[type=\"radio\"]:checked"));
    new_meme_div.querySelector("form select").selectedIndex = "0";
});

// click and drag the slider div to resize memes list
const meme_list_container = document.getElementById("meme_list_container");
const meme_list_resizer = document.getElementById("meme_list_resizer");
const ul_container = document.getElementById("ul_container");
meme_list_resizer.addEventListener("mousedown", event => {
    const mlheight = parseInt(document.body.style.getPropertyValue("--mlh"));

    let pos1 = 0, pos2 = event.clientY, h = mlheight;
    let prev_mousemove = document.onmousemove, prev_mouseup = document.onmouseup;
    const meme_bg = document.getElementById("meme_background");

    document.body.style.cursor = "row-resize";

    document.onmousemove = event => {
        pos1 = pos2 - event.clientY;
        pos2 = event.clientY;

        let new_height = h + pos1;
        h = new_height;

        if (new_height <= 64)
            ul_container.style.overflowX = "hidden";
        else
            ul_container.style.overflowX = "";

        // clip height
        if (new_height < 0) new_height = 0;        
        if (new_height > 225) new_height = 225;

        document.body.style.setProperty("--mlh", `${new_height}px`);
        
        const prev_meme_saved = unsaved_work;
        update_meme_bg_size();
        unsaved_work = prev_meme_saved;
    };
    document.onmouseup = event => {
        document.onmousemove = prev_mousemove;
        document.onmouseup = prev_mouseup;
        document.body.style.cursor = "";
    };
});

// window resize != modifying the current meme; preserved unsaved_work state
window.addEventListener("resize", event => {
    const prev_meme_saved = unsaved_work;
    update_meme_bg_size();
    unsaved_work = prev_meme_saved;
});
