import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import swaggerUi from 'swagger-ui-express';
import * as database from './database';
import { errorHandler } from './middleware';
import loginRouter from './routes/loginRouter';
import authRouter from './routes/authRouter';

const swaggerDocument = require('../swagger.json');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

// Setup swagger api documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
database.connect().then(() => console.log('Connected to database')).catch(console.log);

app.use("/login", loginRouter);
app.use("/auth", authRouter);

app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});