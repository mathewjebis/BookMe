import mongoose from 'mongoose';

export const connectDB = async () =>{
    await mongoose.connect("mongodb+srv://realmeuser1310_db_user:PaviMat1310@cluster0.tkemzec.mongodb.net/BookMe?appName=Cluster0")
    .then(()=>{
        console.log("DB CONNECTED")
    })
}