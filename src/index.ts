import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import swaggerUi from 'swagger-ui-express';
import * as database from './database';
import { errorHandler } from './middleware';
import userRouter from './routes/userRouter';
import digregRouter from './routes/digregRouter';
import timerRouter from './routes/timerRouter';

const swaggerDocument = require('../swagger.json');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*"}));

// Setup swagger api documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
database.connect().then(() => console.log('Connected to database')).catch(console.log);

app.use("/user", userRouter);
app.use("/digreg", digregRouter);
app.use("/timer", timerRouter);

app.get("/", (req: Request, res: Response) => res.send("studybot api server"));

app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});