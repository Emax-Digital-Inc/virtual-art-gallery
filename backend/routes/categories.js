import { Routes } from "express";
import { 
    createCategory, 
    deleteCategory, 
    getCategories, 
    getCategoryById, 
    updateCategory 
} from "../controllers/categories";

const categoryRoutes = Routes();

categoryRoutes.post("/category", createCategory);
categoryRoutes.get("/category", getCategories);
categoryRoutes.get("/category/:id", getCategoryById);
categoryRoutes.patch("/category", updateCategory);
categoryRoutes.delete("/category", deleteCategory);

export default categoryRoutes;