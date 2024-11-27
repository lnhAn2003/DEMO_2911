import { TaskController } from "../controllers/task.controller";
import { Request, Response } from "express";

jest.mock("../data-source");

describe("TaskController", () => {
    it("Should fetch all tasks", async () => {
        const req = {} as Request;
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await TaskController.getAllTasks(req, res);

        expect(res.json).toHaveBeenCalled();
    })
})