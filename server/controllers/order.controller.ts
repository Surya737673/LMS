import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/cathAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel, { IUser } from "../models/user.model";
import OrderModel, { IOrder } from "../models/orderModel";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendEmail";
import NotificationModel from "../models/notificationModel";
import CourseModel from "../models/course.model";
import { getAllOrdersService, newOrder } from "../services/order.service";

// create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);

      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 400));
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0,6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.messag, 500));
      }

      let  courseIdConvert = course?._id.toString()
      user?.courses.push({courseId:courseIdConvert});

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });

    //   if purchase is zero it will not work 
      if(course.purchased == 0){
         course.purchased +=1 
      }else{
        course.purchased ? course.purchased +=1 : course.purchased;
      }
      
      await course.save();

      newOrder(data, res, next);

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all orders --only for admin
export const getAllOrders = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try{
      getAllOrdersService(res);
  } catch(error:any){
      return next(new ErrorHandler(error.message, 400))
  }
})
