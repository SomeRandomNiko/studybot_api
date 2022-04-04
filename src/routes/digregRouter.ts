import { AxiosError } from "axios";
import express, { NextFunction, Request, Response } from "express";
import config from "../config";
import { DigregApi, getDigregGrades } from "../digreg";
import { digreg, requireLogin } from "../middleware";

const digregRouter = express.Router();

digregRouter.get("/grades", requireLogin, digreg(), getGradesController);

async function getGradesController(req: Request, res: Response, next: NextFunction) {
    const grades = await getDigregGrades(req.digregAccessToken).catch((err: AxiosError) => next({ status: err.response?.status, message: err.message }));

    if (!grades)
        return next({ status: 500, message: "An error occurred while fetching grades" });

    res.json(gradesTransformer(grades));
}

function gradesTransformer(grades: DigregApi.Grades) {
    return grades.subjects.map(s => {
        return {
            subject: s.subject.name,
            absences: s.absences,
            averageSemester: weightedAverage(s.grades.flatMap(g => {
                return g.cancelled ? [] : [{ grade: parseFloat(g.grade), weight: g.weight }]
            })),
            grades: s.grades.flatMap(g => {
                return g.cancelled ? [] : [{
                    grade: parseFloat(g.grade),
                    weight: g.weight,
                    type: g.type,
                    description: g.description,
                    date: new Date(g.createdTimeStamp)
                }]
            })
        }
    })
}

function weightedAverage(grades: { grade: number, weight: number }[]): number {
    let totalWeight = 0;
    let totalWeightedMark = 0;
    grades.forEach(g => {
        totalWeightedMark += g.grade * g.weight;
        totalWeight += g.weight;
    });
    return totalWeightedMark / totalWeight;
}




export default digregRouter;