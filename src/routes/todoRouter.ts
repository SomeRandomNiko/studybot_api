import express, { NextFunction, Request, Response } from "express";
import { addTodoItem, deleteAllTodoItems, getStudyTimer, getTodoItem, getTodoList, removeTodoItem, setStudyTimer, updateTodoItem } from "../shared/database";
import { requireLogin } from "../middleware";

const todoRouter = express.Router();

todoRouter.use(requireLogin);
todoRouter.post("/", postTodoController);
todoRouter.get("/all", getAllTodosController);
todoRouter.delete("/all", deleteAllTodosController);
todoRouter.get("/:id", getTodoController);
todoRouter.put("/:id", putTodoController);
todoRouter.delete("/:id", deleteTodoController);

async function postTodoController(req: Request, res: Response, next: NextFunction) {
    const todo = req.body;
    if (!todo)
        return next({ status: 400, message: "No Todo provided" });
    await addTodoItem(req.discordId, todo);
    res.sendStatus(200);
}

async function getAllTodosController(req: Request, res: Response, next: NextFunction) {
    const todos = await getTodoList(req.discordId);
    if (!todos)
        return next({ status: 404, message: "Could not get TodoList from Database" });

    res.json(todos);
}

async function deleteAllTodosController(req: Request, res: Response, next: NextFunction) {
    await deleteAllTodoItems(req.discordId);
    res.sendStatus(200);
}

async function getTodoController(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id)
        return next({ status: 400, message: "No id provided" });
    const todo = await getTodoItem(req.discordId, id);
    if (!todo)
        return next({ status: 404, message: "Could not get Todo from Database" });

    res.json(todo);
}

async function putTodoController(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id)
        return next({ status: 400, message: "No id provided" });
    const todo = req.body;
    if (!todo)
        return next({ status: 400, message: "No Todo provided" });
    await updateTodoItem(req.discordId, id, todo);
    res.json(200);
}

async function deleteTodoController(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id)
        return next({ status: 400, message: "No id provided" });
    await removeTodoItem(req.discordId, id);
    res.sendStatus(200);
}





export default todoRouter;