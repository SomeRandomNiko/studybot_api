"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const digreg_1 = require("../digreg");
const middleware_1 = require("../middleware");
const digregRouter = express_1.default.Router();
digregRouter.get("/grades", middleware_1.requireLogin, (0, middleware_1.digreg)(), getGradesController);
function getGradesController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const grades = yield (0, digreg_1.getDigregGrades)(req.digregAccessToken).catch((err) => { var _a; return next({ status: (_a = err.response) === null || _a === void 0 ? void 0 : _a.status, message: err.message }); });
        if (!grades)
            return next({ status: 500, message: "An error occurred while fetching grades" });
        res.json(gradesTransformer(grades));
    });
}
function gradesTransformer(grades) {
    return grades.subjects.map(s => {
        return {
            subject: s.subject.name,
            absences: s.absences,
            averageSemester: weightedAverage(s.grades.flatMap(g => {
                return g.cancelled ? [] : [{ grade: parseFloat(g.grade), weight: g.weight }];
            })),
            grades: s.grades.flatMap(g => {
                return g.cancelled ? [] : [{
                        grade: parseFloat(g.grade),
                        weight: g.weight,
                        type: g.type,
                        description: g.description,
                        date: new Date(g.createdTimeStamp)
                    }];
            })
        };
    });
}
function weightedAverage(grades) {
    let totalWeight = 0;
    let totalWeightedMark = 0;
    grades.forEach(g => {
        totalWeightedMark += g.grade * g.weight;
        totalWeight += g.weight;
    });
    return totalWeightedMark / totalWeight;
}
exports.default = digregRouter;
