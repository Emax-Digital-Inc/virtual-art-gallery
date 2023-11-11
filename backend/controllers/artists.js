import redisClient from "../config/redisConn.js";
import ArtWork from "../models/artworks.js";

dotenv.config();

// npm i express multer dotenv multer-gridfs-storage

// Create a storage object with a given configuration
const storage = new GridFsStorage({
    url,
    file: (req, file) => {
      //If it is an image, save to photos bucket
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        return {
          bucketName: "photos",
          filename: `${Date.now()}_${file.originalname}`,
        }
      } else {
        //Otherwise save to default bucket
        return `${Date.now()}_${file.originalname}`
      }
    },
})

// Set multer storage engine to the newly created object
const upload = multer({ storage });

export const uploadArtWork = async(req, res, next) => {
  const { artData } = req.body;

  if (!artData) {
    res.status(400).json({
      message: "No art data supplied",
    });
  }
  if (
    !req.body.title ||
    !req.body.artists
  ) {
    res.status(400).json({
      message: "Please fill in all required fields",
    });
  }

  try {
    const arts = await ArtWork.create(artData).exec;
    if (!arts) {
      return res.status(400).json({
        message: "Failed to save your Art",
      });
    } else {
      res.status(201).json({
        message: " successful ",
        arts,
      });
    }
  } catch (error) {
    next(error);
  }

}

// exports.uploadArtWork = upload.single('image'), async(req, res) => {

//     try {
//         // Upload image controller
//         // exports.uploadImage = upload.single('image'), (req, res) => {
//         const newImage = new Image({
//           name: req.file.filename,
//           path: req.file.path
//         });
    
//         newImage.save((err, savedImage) => {
//           if (err) {
//             res.status(500).json({ error: err.message });
//           } else {
//             res.status(200).json({ message: 'Image uploaded successfully', image: savedImage });
//           }
//         });
//     // }
//     } catch (error) {
//         next(error);
//     }
// }

export const getArtsWork = async (req, res, next) => {
  try {
    const arts = await ArtWork.find(req.query).populate();
    const cacheKey = `api-v1-arts-${JSON.stringify(req.query)}`;
    if (arts.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(arts), {
        EX: 172800,
        NX: true,
      });
      res
        .status(200)
        .json({
          fromCache: false,
          message: "Successful",
          arts,
        });
    } else {
      res.status(404).json({ status: 404, message: "No arts found" });
    }
  } catch (error) {
    next(error);
  }
};

export const getArtWork = async (req, res, next) => {
  try {
    const cacheKey = `api-v1-art-${req.params.id}`;
    const { id } = req.params;
    const art = await ArtWork.findById(id).exec();

    if (art) {
      await redisClient.set(cacheKey, JSON.stringify(art), {
        EX: 172800, // cache expire in 2 days
        NX: true,
      });
      res.status(200).json({
        fromCache: false,
        message: "Successful",
        art,
      });
    } else {
      res.status(404).json("Art does not exist");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateArtWork = async(req, res, next) => {
  const { updateData } = req.body;
  const id = req.params.id;

  if (!updateData) {
    return res.status(404).json({
      message: "No update data found",
    });
  }
  const updatedArt = await ArtWork.findByIdAndUpdate(id, {...updateData}, {new: true});
  if (!updatedArt) {
    return res.status(400).json({
      message: "failed to update",
    });
  } else {
    return res.status(200).json({
      message: "successful",
      updatedArt,
    });
  }
}

export const deleteArtWork = async (req, res, next) => {
  const id = new ObjectId(req.params.id);
  const cacheKeys = `api-v1-art-*`;
  const cacheKey = `api-v1-art-${req.params.id}`;

  try {
    const deletedData = await ArtWork.findByIdAndDelete(id);
    await Promise.all([
      redisClient.del(cacheKey),
      scanKeys("0", cacheKeys),
    ]);
    return res.status(200).json({
      message: "ArtWork deleted successfully",
      deletedData,
    });
  } catch (error) {
    next(error);
  }
};