// routes/breaks.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/breaks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breaks WHERE active = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/breaks - Admin creates a new break and 30 teams
router.post('/', async (req, res) => {
  const { name, teams, discountPerExtra } = req.body;

  if (!name || !Array.isArray(teams) || teams.length !== 30) {
    return res.status(400).json({ error: 'Invalid data submitted' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertBreakQuery = `
      INSERT INTO breaks (name, active, discount_per_extra_team, created_at)
      VALUES ($1, true, $2, NOW())
      RETURNING id
    `;
    const result = await client.query(insertBreakQuery, [name, discountPerExtra]);
    const breakId = result.rows[0].id;

    const insertTeamQuery = `
      INSERT INTO teams (break_id, team_name, price, is_taken)
      VALUES ($1, $2, $3, false)
    `;

    for (const team of teams) {
      await client.query(insertTeamQuery, [breakId, team.team, team.price]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Break and teams created', breakId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting break and teams:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

module.exports = router;
