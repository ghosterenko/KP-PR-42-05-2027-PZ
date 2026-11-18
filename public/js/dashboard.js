document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user_greeting').textContent = `Привет, ${user.name}`;

    const form = document.getElementById('project_form');
    const list = document.getElementById('my_projects_list');
    const statusMessage = document.getElementById('status_message');

    function loadMyProjects() {
        fetch(`/api/my-projects/${user.id}`)
            .then(res => res.json())
            .then(projects => {
                list.innerHTML = '';
                if (projects.length === 0) {
                    list.innerHTML = '<p>У вас пока нет проектов</p>';
                    return;
                }
                projects.forEach(p => {
                    const row = document.createElement('div');
                    row.className = 'list_row';
                    row.innerHTML = `
                        <div class="row_info">
                            <strong>${p.title}</strong>
                            <p style="font-size:12px; color:#666; margin: 5px 0;">${p.description}</p>
                        </div>
                        <button onclick="deleteProject(${p.id})" class="btn_delete">Удалить</button>
                    `;
                    list.appendChild(row);
                });
            });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            link: document.getElementById('link').value,
            userId: user.id,
            authorName: user.name
        };

        fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            form.reset();
            statusMessage.textContent = 'Проект успешно добавлен';
            setTimeout(() => statusMessage.textContent = '', 3000);
            loadMyProjects();
        });
    });

    window.deleteProject = (id) => {
        if(confirm('Точно удалить?')) {
            fetch(`/api/projects/${id}?userId=${user.id}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) loadMyProjects();
                    else alert('Вы не можете удалить чужой проект');
                });
        }
    };

    document.getElementById('logout_btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    loadMyProjects();
});