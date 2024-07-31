const express = require('express');
const app = express();
const router = require ('./routes/router');
const port = 3000;


app.use(express.json());

app.use('/', router);
app.use((error, req, res, next) => {
    console.log(error);
    res.statusCode = error.status;
    res.end(error.msg);
});

app.listen(port, ()=> console.log(`server running at http://localhost:${port}`));
