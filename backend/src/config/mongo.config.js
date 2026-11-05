
import mongoose from "mongoose";

const DB_MONGO = process.env.DB_URI || 'mongodb://127.0.0.1/Ecommerce'





async function dbConnection (){
    
    try {
        await mongoose.connect(DB_MONGO)
        console.log('connected')
        
    } catch (error) {
        console.error(error)
        console.error('connection failed')
        
    };


};


export default dbConnection
