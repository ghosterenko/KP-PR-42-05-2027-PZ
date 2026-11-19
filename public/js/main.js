document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects_container');
    const authLink = document.getElementById('auth_link');

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        authLink.textContent = `Кабинет (${user.name})`;
        authLink.href = 'dashboard.html';
    }

    fetch('/api/projects')
        .then(res => res.json())
        .then(projects => {
            container.innerHTML = '';
            if (projects.length === 0) {
                container.innerHTML = '<p>Пока нет добавленных проектов</p>';
                return;
            }

            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project_card';
                card.innerHTML = `
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div style="font-size:12px; color:#666; margin:10px 0;">Автор: <b>${project.authorName}</b></div>
                    <a href="${project.link}" target="_blank">Смотреть проект</a>
                `;
                container.appendChild(card);
            });
        });
});
