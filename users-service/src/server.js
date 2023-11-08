const express = require('express');
const pool = require('./db');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const { rows: [newUser] } = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING user_id, name',
            [name, email]
        );

        await axios.post('http://localhost:5001/user-created', {
            user_id: newUser.user_id,
            action_description: `Новый пользователь: ${newUser.name}`
        });

        res.json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const { rows: [currentUser] } = await pool.query(
            'SELECT name, email FROM users WHERE user_id = $1',
            [id]
        );

        if (!currentUser) {
            return res.status(404).json({ error: 'Пользователь не существует' });
        }

        let actionDescription = '';

        for (const key in req.body) {
            if (req.body[key] !== currentUser[key]) {
                actionDescription += `${key} изменено с '${currentUser[key]}' на '${req.body[key]}'`;
            }
        }

        if (!actionDescription) {
            return res.status(400).json({ error: 'Данные не были изменены' });
        }

        const { rows: [updatedUser] } = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE user_id = $3 RETURNING *',
            [name, email, id]
        );

        await axios.post('http://localhost:5001/user-updated', {
            user_id: id,
            action_description: actionDescription,
        });

        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});


app.get('/users', async (req, res) => {
    try {
        const users = await pool.query('SELECT user_id, name, email FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка обработки запроса' });
    }
});

const PORT = process.env.PORT || 6666;

app.listen(PORT, () => console.log(`Users service started on port: ${PORT}`));
