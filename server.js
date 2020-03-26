const express = require('express');
const connectDB = require('./config/db'); 

const app = express();

//connect DB
connectDB();

//init middleware
app.use(express.json({ extendend: false}));

app.get('/', (req, res) => res.send('Expresss API Running')); //creats a endpoit for web pages

//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
