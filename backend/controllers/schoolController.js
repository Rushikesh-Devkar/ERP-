const School = require('../models/School');

exports.getSchool = async (req, res) => {
  try {
    const school = await School.getActive();
    res.json(school || {});
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.upsertSchool = async (req, res) => {
  try {
    const payload = req.body;
    const doc = await School.getActive();
    if (!doc) {
      const created = await School.create(payload);
      return res.status(201).json(created);
    }
    Object.assign(doc, payload);
    await doc.save();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

