import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/cathAsyncErrors";
import userModel from "../models/user.model";
import OrderModel from "../models/orderModel";
import CourseModel from "../models/course.model";
import { generateLast12MonthsData } from "../utils/analytics.generator";


// get user analytics
export const getUsersAnalytics = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const users = await generateLast12MonthsData(userModel);

        res.status(200).json({
            success: true,
            users,
        });
    } catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
});

// get courses analytics
export const getCoursesAnalytics = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const courses = await generateLast12MonthsData(CourseModel as any);

        res.status(200).json({
            success: true,
            courses,
        });
    } catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
});

// get orders analytics
export const getorderAnalytics = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const orders = await generateLast12MonthsData(OrderModel as any);

        res.status(200).json({
            success: true,
            orders,
        });
    } catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
});