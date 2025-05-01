
const express = require('express');
const pool = require('../db.js');
const router = express.Router();

// GET all breaks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breaks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 FULL ERROR OBJECT:', JSON.stringify(err, null, 2));
    res.status(500).json({
      error: err.message || 'Unknown error',
      debug: err
    });
  }
});




// POST a new break (admin only)
router.post('/', async (req, res) => {
  const { name, break_type, admin_code } = req.body;
  if (admin_code !== process.env.ADMIN_CODE) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO breaks (name, break_type) VALUES ($1, $2) RETURNING *',
      [name, break_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET teams for a specific break
router.get('/:id/teams', async (req, res) => {
  const breakId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM break_teams WHERE break_id = $1 ORDER BY team_name',
      [breakId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new teams to a break (admin only)
router.post('/:id/teams', async (req, res) => {
  const breakId = req.params.id;
  const { teams, admin_code } = req.body;

  if (admin_code !== process.env.ADMIN_CODE) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const inserts = await Promise.all(
      teams.map(team =>
        pool.query(
          'INSERT INTO break_teams (break_id, team_name, cost) VALUES ($1, $2, $3) RETURNING *',
          [breakId, team.name, team.cost]
        )
      )
    );
    res.status(201).json(inserts.map(result => result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
