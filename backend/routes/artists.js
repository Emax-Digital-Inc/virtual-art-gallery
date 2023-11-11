/**
 * @module routes/artists
 * @requires express
 * @requires controllers/artists
 * @requires middlewares/artists
 * @exports artistsRoutes
 * @description This module contains the routes definitions for artists.
 */

import { Router } from "express";
import { 
    deleteArtWork, 
    getArtWork, 
    getArtsWork, 
    uploadArtWork 
} from "../controllers/artists.js";

const artistsRoutes = Router();

artistsRoutes.post("/art", uploadArtWork);
artistsRoutes.get("/art", getArtsWork),
artistsRoutes.get("/art/:id", getArtWork),
artistsRoutes.delete("/art/:id", deleteArtWork);

export default artistsRoutes;