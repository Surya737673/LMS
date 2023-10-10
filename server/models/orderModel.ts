import mongoose, { Model, Schema } from "mongoose";

export interface IOrder extends Document {
    courseId: string;
    userId: string;
    payment_info: Object;
}

const orderSchem = new Schema<IOrder>({
    courseId: {
        type:String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    payment_info:{
        type:Object
    }
},{timestamps: true});

const OrderModel: Model<IOrder> = mongoose.model('Order', orderSchem);

export default OrderModel;