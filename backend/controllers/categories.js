/**
 * @module controllers/categories
 * @requires models/categories
 * @exports Category
 * @description This module contains the controllers for categories.
 */
import Category from "../models/categories.js";

/**
 * Creates a new category.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} A promise that resolves to the created category.
 */
export async function createCategory(req, res, next) {
  const { name } = req.body;
  try {
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieves all categories from the database.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @return {Promise} A promise that resolves to the retrieved categories.
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieves a category by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise} The resolved promise with the category data.
 */
export async function getCategoryById(req, res, next) {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(category);
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates a category in the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @return {Promise} A promise that resolves to the updated category.
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a category.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @return {object} The deleted category.
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(204);
  } catch (error) {
    next(error);
  }
}
