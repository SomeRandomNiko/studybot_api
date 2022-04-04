"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDigregTokens = exports.getDiscordTokens = exports.getTodoList = exports.getStudyTimer = exports.setStudyTimer = exports.updateTodoItem = exports.removeTodoItem = exports.addTodoItem = exports.disconnectDigreg = exports.setDigregTokens = exports.setDiscordTokens = exports.createUser = exports.getUser = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const StudyTimerSchema = new mongoose_1.default.Schema({
    studyTime: { type: Number, default: 0 },
    breakTime: { type: Number, default: 0 },
});
const TodoListSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    done: { type: Boolean, required: true, default: false },
    dueDate: { type: Date, required: false }
});
const UserSchema = new mongoose_1.default.Schema({
    discordId: { type: String, required: true, unique: true },
    discordAccessToken: { type: String, required: true },
    discordRefreshToken: { type: String, required: true },
    discordTokenExpires: { type: Date, required: true },
    digregConnected: { type: Boolean, required: true },
    digregId: { type: Number, required: false, unique: true },
    digregAccessToken: { type: String, required: false },
    digregRefreshToken: { type: String, required: false },
    digregTokenExpires: { type: Date, required: false },
    todoList: [TodoListSchema],
    studyTimer: { type: StudyTimerSchema, default: { breakTime: 0, studyTime: 0 } },
});
const UserModel = mongoose_1.default.model("user", UserSchema);
function connect() {
    return mongoose_1.default.connect(config_1.default.mongodbURI);
}
exports.connect = connect;
function getUser(discordId) {
    return UserModel.findOne({ discordId: discordId });
}
exports.getUser = getUser;
function createUser(discordId, discordAccessToken, discordRefreshToken, discordTokenExpires) {
    return UserModel.create({
        discordId: discordId,
        digregConnected: false,
        discordAccessToken: discordAccessToken,
        discordRefreshToken: discordRefreshToken,
        discordTokenExpires: discordTokenExpires,
        todoList: [],
        studyTimer: { breakTime: 5, studyTime: 25 },
    });
}
exports.createUser = createUser;
function setDiscordTokens(discordId, discordAccessToken, discordRefreshToken, discordTokenExpires) {
    return UserModel.updateOne({ discordId: discordId }, {
        discordAccessToken: discordAccessToken,
        discordRefreshToken: discordRefreshToken,
        discordTokenExpires: discordTokenExpires
    });
}
exports.setDiscordTokens = setDiscordTokens;
function setDigregTokens(discordId, digregAccessToken, digregTokenExpires, digregId, digregRefreshToken) {
    const data = {
        digregConnected: true,
        digregId: digregId,
        digregAccessToken: digregAccessToken,
        digregRefreshToken: digregRefreshToken,
        digregTokenExpires: digregTokenExpires
    };
    if (!digregRefreshToken)
        delete data.digregRefreshToken;
    if (!digregId)
        delete data.digregId;
    return UserModel.updateOne({ discordId: discordId }, data);
}
exports.setDigregTokens = setDigregTokens;
function disconnectDigreg(discordId) {
    return UserModel.updateOne({ discordId: discordId }, {
        digregConnected: false,
        digregId: null,
        digregAccessToken: null,
        digregRefreshToken: null,
        digregTokenExpires: null
    });
}
exports.disconnectDigreg = disconnectDigreg;
function addTodoItem(discordId, todoItem) {
    return UserModel.updateOne({ discordId: discordId }, {
        $push: { todoList: todoItem }
    });
}
exports.addTodoItem = addTodoItem;
function removeTodoItem(discordId, todoItemId) {
    return UserModel.updateOne({ discordId: discordId }, {
        $pull: { todoList: { _id: todoItemId } }
    });
}
exports.removeTodoItem = removeTodoItem;
function updateTodoItem(discordId, todoItemId, todoItem) {
    return UserModel.updateOne({ discordId: discordId, "todoList._id": todoItemId }, {
        $set: { "todoList.$": todoItem }
    });
}
exports.updateTodoItem = updateTodoItem;
function setStudyTimer(discordId, studyTimer) {
    return UserModel.updateOne({ discordId: discordId }, {
        $set: { studyTimer: studyTimer }
    });
}
exports.setStudyTimer = setStudyTimer;
function getStudyTimer(discordId) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return user === null || user === void 0 ? void 0 : user.studyTimer;
    });
}
exports.getStudyTimer = getStudyTimer;
function getTodoList(discordId) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return user === null || user === void 0 ? void 0 : user.todoList;
    });
}
exports.getTodoList = getTodoList;
function getDiscordTokens(discordId) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return {
            discordAccessToken: user === null || user === void 0 ? void 0 : user.discordAccessToken,
            discordRefreshToken: user === null || user === void 0 ? void 0 : user.discordRefreshToken,
            discordTokenExpires: user === null || user === void 0 ? void 0 : user.discordTokenExpires
        };
    });
}
exports.getDiscordTokens = getDiscordTokens;
function getDigregTokens(discordId) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return {
            digregAccessToken: user === null || user === void 0 ? void 0 : user.digregAccessToken,
            digregRefreshToken: user === null || user === void 0 ? void 0 : user.digregRefreshToken,
            digregTokenExpires: user === null || user === void 0 ? void 0 : user.digregTokenExpires
        };
    });
}
exports.getDigregTokens = getDigregTokens;
