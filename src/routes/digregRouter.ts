import { AxiosError } from "axios";
import express, { NextFunction, Request, Response } from "express";
import { DigregApi, getDigregGrades, getDigregUpcomingLessons } from "../shared/digreg";
import { digreg, requireLogin } from "../middleware";
import { Temporal } from "@js-temporal/polyfill";

const digregRouter = express.Router();

digregRouter.get("/grades", requireLogin, digreg(), getGradesController);
digregRouter.get("/calendar/:dates?", requireLogin, digreg(), getCalendarController);

async function getCalendarController(req: Request, res: Response, next: NextFunction) {
    const calendar = await getDigregUpcomingLessons(req.digregAccessToken).catch((err: AxiosError) => next({ status: err.response?.status, message: err.message }));

    if (!calendar)
        return next({ status: 500, message: "An error occured while fetching the calendar" });

    res.json(calendarTransformer(calendar, req.params.dates?.split(",") || []));
}

function calendarTransformer(calendar: DigregApi.Calendar, dates: string[]) {
    const ret = [];

    for (const dateString in calendar) {
        if (!dates.includes(dateString))
            continue;
        const day = calendar[dateString];

        const dayRet = {
            date: Temporal.PlainDate.from(dateString),
            lessons: Object.values(day).flatMap(l => {

                if (!l)
                    return [];

                const startTime = new Temporal.PlainTime().add({ seconds: l.timeStartObject.ts, hours: 1 }).toString({ smallestUnit: "minute" });
                const endTime = new Temporal.PlainTime().add({ seconds: l.timeEndObject.ts, hours: 1 }).toString({ smallestUnit: "minute" });
                const contents = l.lessonContents.map(c => {
                    return {
                        type: c.typeName,
                        description: c.name,
                        isCritical: false
                    }
                });

                contents.push(...l.homeworkExams.map(h => {
                    return {
                        type: h.typeName,
                        description: h.name,
                        isCritical: true
                    }
                }));

                return [{
                    hour: l.hour,
                    startTime,
                    endTime,
                    subject: l.subject.name,
                    contents,
                    teachers: l.teachers.map(t => t.lastName + " " + t.firstName)
                }]
            })
        }
        ret.push(dayRet);
    }
    return ret;
}

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