import express, { NextFunction, Request, Response } from "express";
import { getStudyTimer, setStudyTimer } from "../database";
import { requireLogin } from "../middleware";

const timerRouter = express.Router();

timerRouter.get("/", requireLogin, getTimerController);
timerRouter.post("/", requireLogin, postTimerController);

async function getTimerController(req: Request, res: Response, next: NextFunction) {
    const timer = await getStudyTimer(req.discordId);
    if (!timer)
        return next({ status: 404, message: "Could not get StudyTimer from Database" });
    res.json(timer);
}

async function postTimerController(req: Request, res: Response, next: NextFunction) {
    const timer = req.body;
    if (!timer)
        return next({ status: 400, message: "No StudyTimer provided" });
    await setStudyTimer(req.discordId, timer);
    res.sendStatus(200);
}



export default timerRouter;