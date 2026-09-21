import Playground from "../models/Playground.js";

//GET
export async function getPlaygrounds(req, res) {
  try {
    const playgrounds = await Playground.find();
    res.json({ success: true, data: playgrounds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

//GET by ID
export async function getPlaygroundById(req, res) {
  try {
    const playground = await Playground.findById(req.params.id);
    if (!playground) {
      return res
        .status(404)
        .json({ success: false, error: "Playground not found" });
    }
    res.json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid id" });
  }
}

//POST
export async function createPlayground(req, res) {
  try {
    const playground = await Playground.create(req.body);
    res.status(201).json({ success: true, data: playground });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
