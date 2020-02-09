
// ============= Main and Listeners ===============

getNotesJSON().then(displayNotes)



query('#note-list').addEventListener('click', controlButtons)


// ================= Functions ====================

function getNotesJSON() {
    return fetch("http://localhost:3000/notes/", { "method": "GET" })
        .then(results => results.json())
    // .then(data => print(data))
}

function postNote(noteObj) {
    return fetch("http://localhost:3000/notes/", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(noteObj)
    })
        .then(response => { console.log(`Posted note responded with status: ${response.status}`) })
}

// id should the id assigned to the note on the server
function deleteNodeById(id) {
    id = String(id)
    return fetch(`http://localhost:3000/notes/${id}`, { method: "DELETE" })
        .then(response => { console.log(`DELETE request responded with status: ${response.status}`) })
}

// notesJSON respresents the object returned by the server, which is an array of note objects
function displayNotes(notesJSON) {
    let notesSection = query('#note-list')
    let noteElems = notesJSON.map(createNoteElem)
    for (elem of noteElems.reverse()) {
        notesSection.appendChild(elem)
    }
}



// ================= Helpers =======================
const sampleNoteOb = {
    "title": "This is a longer title",
    "body": "This is a sample note hardcoded into main.js for testing in the console.\n This is another sentence!",
    "date": moment().format(),
    "pinned": false
}

function query(selector) {
    return document.querySelector(selector)
}

function print(value) {
    console.log(value)
    return value
}
function createElement(type, classList, id = '') {
    let element = document.createElement(type)
    element.classList.add(...classList)
    element.id = id
    return element
}

// innerHTML should mostly be text, mostly just needed HTML to
// add a <br> in the address later on
function createTextElem(type, text, classList) {
    let elem = createElement(type, classList)
    elem.innerHTML = text
    return elem
}

function createNoteElem(noteObj) {
    let container = createElement('div', ['note', 'shadow'])
    container.id = String(noteObj.id)
    let titleContainer = createElement('div', ['title-div'])
    let titleElem = createTextElem('p', noteObj.title, ['title'])
    titleContainer.appendChild(titleElem)
    titleContainer.appendChild(createNoteControlElems())
    container.appendChild(titleContainer)
    let noteBodySplit = noteObj.body.split('\n')
    let elements = noteBodySplit.map(par => createTextElem('p', par, ['note-par']))
    for (elem of elements) {
        container.appendChild(elem)
    }
    let dateElem = createTextElem('p', moment(noteObj.date).format('MMM Do, YYYY'), ['date'])
    container.appendChild(dateElem)
    return container
}

function createNoteControlElems() {
    let container = createElement('div', ['controls'])
    let pinButton = createElement('button', ['pin', 'to-top', 'button-sm'])
    let editButton = createElement('button', ['edit', 'edt', 'button-sm'])
    let trashButton = createElement('button', ['trash', 'delete', 'button-sm'])
    pinButton.innerHTML = "<i class='material-icons md-18 to-top'>arrow_upward</i>"
    editButton.innerHTML = "<i class='material-icons md-18 edt'>edit</i>"
    trashButton.innerHTML = "<i class='material-icons md-18 delete'>delete</i>"
    pinButton.title = "Pin to top"
    editButton.title = "Edit note"
    trashButton.title = "Delete note"
    container.appendChild(pinButton)
    container.appendChild(editButton)
    container.appendChild(trashButton)
    return container
}

function togglePinnedNoteObect(noteElem) {
    let pinned
    if (noteElem.matches('.pinned')) {
        pinned = false
        noteElem.classList.remove('pinned')
    }
    else {
        pinned = true
        noteElem.classList.add('pinned')
    }

    return fetch(`http://localhost:3000/notes/${noteElem.id}`,
        {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ "pinned": pinned })
        })
        .then(response => { console.log(`PATCH request responded with status: ${response.status}`) })
}


function pinNote(event) {

}

function editNote(event) {

}

function deleteNote(noteElem) {
    let yn = prompt("Delete (y) or cancel (n)?")
    if (yn === 'y') {
        deleteNodeById(noteElem.id)
        noteElem.remove()
    }
}

function controlButtons(event) {
    let note, id
    if (event.target.closest('.note')) {
        note = event.target.closest('.note')
        id = note.id
    }
    if (event.target.matches('.delete')) {
        deleteNote(note)
    }
    else if (event.target.matches('.to-top')) {
        pinNote(event)
        print('pin')
    }
    else if (event.target.matches('.edt')) {
        editNote(event)
        print('edit')
    }
}

function createForm(title = '', body = '') {
    const displayContainer = query('#display-container')
    let formHTML = `<form id='take-note-form'>
    <div class='flex-container'>
      <label for='title-input'>Note title:</label>
      <input id='title-input' type='text' title='title-input' class='input shadow'>
    </div>
    <div class='flex-container'>
      <label for='note-input'>Note body:</label>
      <textarea id='body-input' class='input shadow' rows='5' cols='33' placeholder='Take a note . . .'></textarea>
      <div id='submit-container'>
        <button id='add-note'  class='button-success button-block shadow'>Add note</button>
      </div>
    </div>
  </form>`

    displayContainer.innerHTML = formHTML

    const titleInput = query('#title-input')
    titleInput.value = title
    const bodyInput = query('#body-input')
    bodyInput.value = body

    query('#take-note-form').addEventListener('submit', function (event) {
        event.preventDefault()
        let noteObj = {}
        noteObj.body = query('#body-input').value.trim()
        noteObj.title = query('#title-input').value
        noteObj.date = moment().format()
        postNote(noteObj).then(getNotesJSON)
    })
}