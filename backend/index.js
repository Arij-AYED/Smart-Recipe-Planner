require ('dotenv').config();
const express = require('express');
const mongoose = require ('mongoose');
const authRoutes = require ('./routes/auth');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//Connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err)=>console.error('MongoDB error:',err));


//use auth routes
app.use('/api',authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




