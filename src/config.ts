import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 8080,
    mongodbURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/studybot',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    digregClientId: process.env.DIGREG_CLIENT_ID || '',
    digregClientSecret: process.env.DIGREG_CLIENT_SECRET || '',
}