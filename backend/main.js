// To get all the Config needed from .env file
require('dotenv').config();

const express =  require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const PORT = process.env.APP_PORT;

//Create an instance of express
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

//AWS Config
AWS.config.credentials = new AWS.SharedIniFileCredentials('default');
const AWS_S3_HOST_NAME = process.env.AWS_S3_HOST_NAME;
const AWS_S3_BUCKETNAME = process.env.AWS_S3_BUCKETNAME;

const spaceEndPoint = new AWS.Endpoint(AWS_S3_HOST_NAME);

const s3 = new AWS.S3({
    endpoint: spaceEndPoint
})

// Create the Database Connection Pool
const pool = mysql.createPool({
    host: process.env.MYSQL_SERVER || 'localhost',
    port: parseInt(process.env.MYSQL_SVR_PORT) || 3306,
    database: process.env.MYSQL_SCHEMA,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: parseInt(process.env.MYSQL_CONN_LIMIT) || 4,
    timezone: process.env.DB_TIMEZONE || '+08:00'
})

//Make a Closure, Take in SQLStatement and ConnPool
const makeQuery = (sql, pool) => {
    return (async (args) => {
        const conn = await pool.getConnection();
        try {
            let results = await conn.query(sql, args || []);
            //Only need first array as it contains the query results.
            //index 0 => data, index 1 => metadata
            return results[0];
        }
        catch(err) {
            console.error('Error Occurred during Query', err);
        }
        finally{
            conn.release();
        }
    })
}

const UPDATE_TODOCOMPLETE = "UPDATE TODO set status_id = 1 where id = ? ";
const updateTodoComplete = makeQuery(UPDATE_TODOCOMPLETE, pool);

app.put('/completeTodo/:todoId', (req, res) => {
    updateTodoComplete([req.params.todoId])
        .then(data => {
            res.status(200).json(data);
        })
})

//Function to download from S3
async function downloadFromS3(params, res) {
    const metaData = await s3.headObject(params).promise();
    res.set({
        'X-Original-Name': metaData.Metadata.originalfilename,
        'X-Create-Time': metaData.Metadata.uploadDateTime
    })
    s3.getObject(params, (err, data) => {
        if(err)
            console.error(err, err.stack);
        res.send(data.Body);
    })
}

const GET_TODOIMAGEKEY_FROM_TODOID = "SELECT image_key from todo where id = ? ";
const getTodoImageFromTodo = makeQuery(GET_TODOIMAGEKEY_FROM_TODOID, pool);

app.get('/getTodoImage/:todoId', (req, res) => {
    const todoId = req.params.todoId;
    //Fetch Key from database using todoId
    getTodoImageFromTodo([todoId])
        .then(data => {
            let imageKey = data[0].image_key;

            if(imageKey)
            {
                let params = {
                    Bucket: AWS_S3_BUCKETNAME,
                    Key: imageKey
                }
    
                downloadFromS3(params, res);
            }
            else
            {
                res.status(404).json({ message: 'No Todo Image'});
            }
        })
})


//Create a method to upload, file parsed in from req must be image-file. (formData.set('image-file'))
const upload = multer({
    storage: multerS3({
        s3: s3, 
        bucket: AWS_S3_BUCKETNAME,
        acl: 'private', //Store file as public or private
        metadata: function(req, file, cb) {
            cb(null, {
                fileName: file.fieldname,
                originalFilename: file.originalname,
                uploadDateTime: new Date().toDateString()
            })
        },
        key: function(req, file, cb) {
            cb(null, new Date().getTime() + '_' + file.originalname )
        }
    })
}).single('image-file');

const UPDATE_TODOIMAGEKEY_TO_TODO = "UPDATE TODO set image_key = ? where id = ? ";
const updateTodoImageToTodo = makeQuery(UPDATE_TODOIMAGEKEY_TO_TODO, pool);

//Upload Image to S3
app.post('/uploadTodoImage', (req, res) => {
    
    upload(req, res, error => {
        if(error)
        {
            console.error(error);
            return res.status(500).json(error.message);
        }
        console.info('Todo image uploaded successfully')
        //Get the res.req.file.key and update Todo table
        let key = res.req.file.key.toString();
        updateTodoImageToTodo([key, parseInt(req.body.todoId)])
            .then(data=> {
                res.status(200).json({
                    message: 'File Uploaded and Updated to Todo Table'
                })
            })
    })
})

const SQL_INSERTTODO = "INSERT into Todo (task_name, due_date, priority_id, status_id) values ( ? , ?, ?, ? )";
const insertTodo = makeQuery(SQL_INSERTTODO, pool);

app.post('/createTodo', (req, res) => {
    
    insertTodo([req.body.task_name, req.body.due_date, req.body.priority_id, req.body.status_id ])
        .then(data => {
            res.status(200).json({ message: 'Todo created'});
        })
})

const SQL_INSERTSUBTODO = "INSERT into SubTodo (todo_id, sub_task_name, status_id) values ( ? , ? , ? )";
const insertSubTodo = makeQuery(SQL_INSERTSUBTODO, pool);

app.post('/createSubTodo/:todoId', (req, res) => {
    console.log('subtodo posts'. req.body);
    insertSubTodo([req.params.todoId, req.body.sub_task_name, req.body.status_id ])
        .then(data => {
            res.status(200).json({ message: 'Sub Todo Task created'});
        })
})

const SQL_GETTODO = "SELECT t.id, t.task_name, t.due_date, t.priority_id, p.priority, t.status_id, s.status, t.image_key, t.image_data " +  
    "from Todo t, Priority p, Status s where t.priority_id = p.id and t.status_id = s.id order by t.due_date asc, t.priority_id desc";
const getTodo = makeQuery(SQL_GETTODO, pool);

app.get('/GetTodo', (req, res) => {
    
    getTodo()
        .then(data => {
            res.status(200).json(data);
        })
})

const SQL_GETSUBTODO = "SELECT * from subTodo where todo_id = ? order by id";
const getSubTodo = makeQuery(SQL_GETSUBTODO, pool);

app.get('/GetSubTodo/:todoId', (req, res) => {
    const todoId = req.params.todoId;
    
    getSubTodo([todoId])
        .then(data => {
            res.status(200).json(data);
        })
})

const SQL_GETPRIORITY = "SELECT * from priority";
const getPriority = makeQuery(SQL_GETPRIORITY, pool);

//APP GET PRIORITY
app.get('/priority', (req, res) => {
    getPriority()
        .then(data => {
            res.status(200).json(data);
        })
})

//Start Express
pool.getConnection()
    .then(conn => {
        const param1 = Promise.resolve(conn);
        const param2 = conn.ping();
        return Promise.all( [ param1, param2 ] );
    })
    .then(results => {
        const conn = results[0];
        app.listen(PORT, () => {
            console.info(`Server Started on PORT ${PORT} at ${new Date()}`);
        })
        conn.release();
    })
    .catch(err => {
        console.error('Error in connection to mysql', err);
    })

















