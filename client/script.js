const url = 'http://localhost:3000/todos';
const table = document.getElementById('table');
const oldTodos = [];

window.onload = async function () {
    const data = await loadAllTodos();
    for (let todo of data) {
        const { id, title, status } = todo;
        oldTodos.push({ id: id, title: title, status: status });
        table.innerHTML += createNewRow(id, title, status);
    }
};


async function loadAllTodos() {
    const response = await fetch(url);
    const data = response.json();
    return data;
}

async function addTodo(e) {
    if (!(e.key === 'Enter' || e.keyCode === 13)) {
        return;
    }
    const [title, status] = [e.target.value, false];
    if (title.trim().length == 0) {
        return;
    }
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            title: title.trim(),
            status: status
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    if (response.status == 201) {
        const data = await response.json();
        const { id } = data;
        table.innerHTML += createNewRow(id, title, status);
        oldTodos.push({ id: id, title: title });
        e.target.value = "";
    } else {
        alert('an error occured while adding a new todo');
    }
}


function getRowData(row) {
    const id = +row.getAttribute('data-id');
    const title = row.children[1].innerText;
    const status = row.children[0].checked;
    return { id, title, status };
}

async function updateTodo(event) {
    const row = event.target.parentNode;
    const { id, title, status } = getRowData(row);
    const idx = oldTodos.findIndex((e) => e.id == id);
    if (oldTodos[idx].title != title || oldTodos[idx].status != status) {
        const response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify({
                id: id,
                title: title.trim(),
                status: status
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if (response.status == 200) {
            oldTodos[idx].title = title;
            oldTodos[idx].status = status;
        } else {
            alert('an error occured while updating a todo');
        }
    }
    
}
async function deleteTodo(event) {
    const row = event.target.parentNode;
    const { id } = getRowData(row);
    const response = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify({
            id: id,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    if (response.status == 200) {
        row.remove()
    } else {
        alert('an error occured while removing a todo');
    }

}



function createNewRow(id, title, status) {
    return `
        <div class="row" data-id="${id}">
            <input type="checkbox" ${status ? 'checked' : ''} onclick="updateTodo(event)">
            <span contenteditable="true" onblur="updateTodo(event)">${title}</span>
            <button onclick="deleteTodo(event)" class="del-button"> Delete </button>
        </div>
    `;
}


