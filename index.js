const path = require('path');
const express = require('express');
const {config,engine} = require('express-edge');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require("connect-flash");
const edge = require("edge.js");

const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser');
const loginController = require("./controllers/login");
const loginUserController = require('./controllers/loginUser');
const logoutController = require("./controllers/logout");

const app = new express();

//connect to database
mongoose.connect('mongodb://localhost:27017/node-blog', { useNewUrlParser: true })
    .then(() => 'You are now connected to Mongo!')
    .catch(err => console.error('Something went wrong', err));

const mongoStore = connectMongo(expressSession);
app.use(expressSession({
    secret: 'secret',
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}));
app.use(connectFlash());
app.use(fileUpload());
app.use(express.static('public'));
app.use(engine);
app.set('views', __dirname + '/views');

app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//add controller to url
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated')
const auth = require("./middleware/auth");
const storePost = require('./middleware/storePost')

app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/create", auth, createPostController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.get('/auth/login', redirectIfAuthenticated, loginController);
app.get("/auth/logout", redirectIfAuthenticated, logoutController);

app.post("/posts/store",auth,storePost, storePostController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);




app.listen(4000, () => {
    console.log('App listening on port 4000');
});