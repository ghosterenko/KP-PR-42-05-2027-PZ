document.getElementById('login_form').addEventListener('submit', (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error_msg');

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
        if (res.status === 200) {
            localStorage.setItem('user', JSON.stringify(res.body.user));
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.textContent = res.body.error;
        }
    })
    .catch(() => errorMsg.textContent = 'Ошибка сервера');
});