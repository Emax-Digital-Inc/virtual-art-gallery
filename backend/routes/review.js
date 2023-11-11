import { Routes } from "express";
import { 
    averageRating, 
    createReview, 
    getReview, 
    getReviews 
} from "../controllers/review";

const reviewRoutes = Routes();

reviewRoutes.post("/reviews", createReview);
reviewRoutes.get("/reviews", getReviews);
reviewRoutes.get("/reviews", getReview);
reviewRoutes.get("/reviews", averageRating);
  
export default reviewRoutes;