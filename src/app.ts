import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import expressFileUpload from 'express-fileupload';

import payments from './controllers/accounts'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not in environment

app.use(cors());
app.use(expressFileUpload()); // Use express-fileupload before body-parser
app.use(bodyParser.json());


// Using the routes
app.use('/accounts', payments);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
