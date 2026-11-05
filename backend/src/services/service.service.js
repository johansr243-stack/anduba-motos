

import servicemodel from "../models/service.models.js";

const  dbinsertService = async(newService) => {
   return await servicemodel.create(newService);
    
}

 const dbGetServices = async ( ) => {
     return await servicemodel.find();

 }

 const dbdeleteservice = async (id) => {
    return await servicemodel.findOneAndDelete({_id: id})
 }

 const dbpatchservice = async (id, inputData)=> {
    return await servicemodel.findOneAndUpdate({_id: id},
         inputData, {new: true})
 }


 const dbGetServicesByid = async (id) => {
   return await servicemodel.findOne({_id: id})
 }


export{
    dbinsertService,dbGetServices,dbdeleteservice,dbpatchservice,dbGetServicesByid
};