import express from 'express';
import config from './config';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('../swagger.json');

const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});