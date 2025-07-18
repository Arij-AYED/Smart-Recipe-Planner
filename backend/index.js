require ('dotenv').config();
const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors'); // allows frontend to access backend

const adminRoutes=require('./routes/admin');
const authRoutes = require ('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

//Connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err)=>console.error('MongoDB error:',err));


//use auth routes
app.use('/api',authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); 


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




