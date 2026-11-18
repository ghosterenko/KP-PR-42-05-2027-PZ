const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Наши тестовые пользователи
const USERS = [
    { id: 1, login: 'admin', password: '123', name: 'Администратор' },
    { id: 2, login: 'ivan', password: '123', name: 'Иван Иванов' }
];

const getProjects = () => JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8') || '[]');
const saveProjects = (data) => fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf8');

// Вход (просто проверяем, есть ли такой юзер)
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = USERS.find(u => u.login === login && u.password === password);
    
    if (user) {
        // Отдаем данные пользователя обратно в браузер (без пароля)
        res.json({ success: true, user: { id: user.id, name: user.name } });
    } else {
        res.status(401).json({ error: 'Неверный логин или пароль' });
    }
});

// Получить ВСЕ проекты (для главной)
app.get('/api/projects', (req, res) => {
    res.json(getProjects());
});

// Получить ТОЛЬКО СВОИ проекты (для кабинета)
app.get('/api/my-projects/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const projects = getProjects();
    const myProjects = projects.filter(p => p.userId === userId);
    res.json(myProjects);
});

// Добавить проект
app.post('/api/projects', (req, res) => {
    const { title, description, link, userId, authorName } = req.body;
    const projects = getProjects();

    const newProject = {
        id: Date.now(),
        userId: userId,         // Кто создал
        authorName: authorName, // Имя автора для главной
        title,
        description,
        link: link || '#'
    };

    projects.push(newProject);
    saveProjects(projects);
    res.status(201).json(newProject);
});

// Удалить проект (с проверкой "свой/чужой")
app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId); // Берем ID юзера из запроса

    let projects = getProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    
    // Проверка прав
    if (project.userId !== userId) {
        return res.status(403).json({ error: 'Вы не можете удалить чужой проект!' });
    }

    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));