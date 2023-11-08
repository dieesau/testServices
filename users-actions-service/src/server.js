const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.post('/user-created', async (req, res) => {
    try {
        const { user_id, action_description } = req.body;
        const result = await pool.query(
            'INSERT INTO users_actions (user_id, action_type_id, action_description) VALUES ($1, $2, $3) RETURNING user_id',
            [user_id, 1, action_description]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});

app.post('/user-updated', async (req, res) => {
    try {
        const { user_id, action_description } = req.body;
        const result = await pool.query(
            'INSERT INTO users_actions (user_id, action_type_id, action_description) VALUES ($1, $2, $3) RETURNING *',
            [user_id, 2, action_description]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});

app.get('/user-history', async (req, res) => {
    try {
        const { userId, page, pageSize } = req.query;
        const query = `
            SELECT * FROM users_actions
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT $2
            OFFSET $3
        `;
        const result = await pool.query(query, [userId, pageSize, (page - 1) * pageSize]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`User Actions service started on port: ${PORT}`));
