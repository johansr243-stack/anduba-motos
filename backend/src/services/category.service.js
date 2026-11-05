
import CategoryModel from "../models/Category.model.js";

const  dbinsertCategory = async(newCategory) => {
   return await CategoryModel.create(newCategory);
    
}

 const dbGetCategory = async ( ) => {
     return await CategoryModel.find().populate('registeringUserId', 'username');

 }

 const dbdeleteCategory = async (id) => {
    // return await CategoryModel.findOneAndDelete({_id: id})
    return await CategoryModel.findByIdAndDelete(id)
 }

 const dbpatchCategory = async (id, inputData)=> {
    return await CategoryModel.findOneAndUpdate({_id: id},
         inputData, {new: true})
 }


 const dbGetCategoryByid = async (id) => {
   return await CategoryModel.findOne({_id: id})
 }


export{
    dbinsertCategory,dbGetCategory,dbdeleteCategory,dbpatchCategory,dbGetCategoryByid
};