const express = require('express');
const db = require('../service/db');
const router = express.Router();


const cors = require('cors');
const clientPort = 5500;
router.use(cors({
    origin: [`http://localhost:${clientPort}`, `http://127.0.0.1:${clientPort}`]
}));
router.get('/todos', async (req, res, next) => {
    try {
        const result = await getAllTodos();
        res.send(result);
    } catch (error) {
        next(error);
    }
});
router.get('/todos/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getTodoWithId(id);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/todos', async (req, res, next) => {
    try {
        const { body } = req;
        const result = await saveTodo(body);
        const id = await result.insertId;
        res.statusCode = 201;
        res.send({ msg: 'Created', id: id });
    } catch (error) {
        next(error);
    }
});

router.put('/todos', async (req, res, next) => {
    try {
        const { body } = req;
        await updateTodo(body);
        res.send({ msg: 'Updated' });
    } catch (error) {
        next(error);
    }
});

router.delete('/todos', async (req, res, next) => {
    try {
        const { body } = req;
        await deleteTodo(body);
        res.send({ msg: 'Deleted' });
    } catch (error) {
        next(error);
    }
});

async function getAllTodos() {
    const result = await db.query('select id, title, status from todo');
    checkDbConnection(result);
    return result;
}

async function getTodoWithId(id) {
    checkValidId(id);
    const result = await db.query('select id, title, status from todo where id = ?', [id]);
    checkDbConnection(result);
    checkIdExist(result);
    return result;
}

async function saveTodo(body) {
    const { title, status } = body;
    checkTitleAndStatus(body);
    const result = await db.query('insert into todo (title, status) values (?, ?);', [title, status]);
    return result;
}

async function updateTodo(body) {
    const { id, title, status } = body;
    checkValidId(id);
    if (title != undefined) {
        await db.query('update todo set title = ? where id = ?;', [title, id]);
    }
    if (status != undefined) {
        await db.query('update todo set status = ? where id = ?;', [status, id]);
    }
}

async function deleteTodo(body) {
    const { id } = body;
    checkValidId(id);
    await db.query('delete from todo where id = ?;', [id]);
}



function checkDbConnection(result) {
    if (!result) {
        const error = new Error();
        error.status = 500;
        error.msg = 'database is down';
        throw error;
    }
}

function checkIdExist(result) {
    if (result.length == 0) {
        const error = new Error();
        error.status = 404;
        error.msg = 'id not found';
        throw error;
    }
}

function checkTitleAndStatus(body) {
    const error = new Error();
    const { title, status } = body;
    if (title === undefined || status === undefined || typeof (status) != 'boolean') {
        error.status = 422;
        error.msg = 'wrong format';
        throw error;
    }

}

function checkValidId(id) {
    const error = new Error();
    if (isNaN(id)) {
        error.status = 422;
        error.msg = 'id does not exist or wrong id format';
        throw error;
    }
}

module.exports = router;
