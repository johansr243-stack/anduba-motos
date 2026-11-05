import express from 'express'
import cors from 'cors'

import dbConnection from './config/mongo.config.js';

import userRoutes from './routes/user.routes.js'
import productsRoutes from './routes/product.routes.js';
import mcRoutes from './routes/motorcycle.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import serviceRoutes from './routes/service.routes.js'
import categoryroutes from './routes/category.routes.js'
import shoppingcarroutes from './routes/shoppingcar.routes.js'
import historyRoutes from './routes/history.routes.js'
import orderRoutes from './routes/order.routes.js'
import serviceRecordRoutes from './routes/serviceRecord.routes.js'
import authRoutes from './routes/auth.routes.js' // importacion rutas auth
import rolesRoutes from './routes/roles.routes.js'
import reviewRoutes from './routes/review.routes.js'
import reportRoutes from './routes/report.routes.js'


const app = express();

const PORT = process.env.PORT || 3001

//coneccion a la base de datos

dbConnection();

app.use(express.json());  // habilita la lectura de los formatos json

app.use(cors())

// Servir la carpeta uploads de manera estática
app.use('/uploads', express.static('uploads'));

app.get("/health", function(req,res){

    res.json({
        msg:"funciona"
    })
});


//endpoints agrupados

app.use("/api/users", userRoutes)
app.use("/api/services",serviceRoutes );
app.use('/api/products', productsRoutes);
app.use('/api/motorcycles', mcRoutes)
app.use( '/api/appointment', appointmentRoutes)
app.use('/api/category', categoryroutes)
app.use("/api/auth", authRoutes)
app.use('/api/shoppingcar', shoppingcarroutes)
app.use('/api/history', historyRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/serviceRecord', serviceRecordRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/reports', reportRoutes)



// Levantar el servidor
app.listen(PORT, function () {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
