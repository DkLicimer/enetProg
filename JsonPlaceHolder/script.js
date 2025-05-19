const API_URL = 'https://jsonplaceholder.typicode.com';

const usersDiv = document.getElementById('users');
const albumsDiv = document.getElementById('albums');
const photosDiv = document.getElementById('photos');


function showSection(sectionId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error('Неизвестная или отсутствующая секция:', sectionId);
        const defaultSectionId = 'users-view';

        if (sectionId !== defaultSectionId) {
             console.warn(`Попытка вернуться к секции по умолчанию: ${defaultSectionId}`);
             loadUsers(); 
        } else {
            console.error(`Критическая ошибка: Секция по умолчанию (${defaultSectionId}) не найдена в DOM`);
            usersDiv.innerHTML = '';
            albumsDiv.innerHTML = '';
            photosDiv.innerHTML = '';
            document.body.innerHTML = '<div style="text-align:center; padding: 50px; color: red;"><h1>Ошибка загрузки</h1><p>Не удалось инициализировать приложение. Пожалуйста, убедитесь, что все необходимые элементы HTML присутствуют и попробуйте обновить страницу.</p></div>';
        }
    }
}


async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Ошибка загрузки данных с эндпоинта ${endpoint}:`, error);
        return null;
    }
}

async function loadUsers() {
    showSection('users-view'); 
    usersDiv.innerHTML = 'Загрузка пользователей...'; 

    const users = await fetchData('/users');

    usersDiv.innerHTML = '';

    if (users === null) {
        usersDiv.innerHTML = '<p>Не удалось загрузить пользователей. Попробуйте позже.</p>';
        return;
    }

    if (users.length === 0) {
        usersDiv.innerHTML = '<p>Список пользователей пуст.</p>';
        return;
    }

    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user.name;
        userElement.addEventListener('click', () => loadAlbums(user.id));
        usersDiv.appendChild(userElement);
    });
}

async function loadAlbums(userId) {
    showSection('albums-view'); 

    albumsDiv.innerHTML = 'Загрузка альбомов...'; 

    const albums = await fetchData(`/albums?userId=${userId}`); 

    albumsDiv.innerHTML = ''; 

    const backToUsersButton = document.createElement('button');
    backToUsersButton.textContent = '← Назад к пользователям';
    backToUsersButton.classList.add('back-button');
    backToUsersButton.addEventListener('click', loadUsers);
    albumsDiv.appendChild(backToUsersButton); 

    if (albums === null) {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Не удалось загрузить альбомы. Попробуйте позже.';
        albumsDiv.appendChild(errorMsg); 
        return;
    }

    if (albums.length === 0) {
         const emptyMsg = document.createElement('p');
         emptyMsg.textContent = 'Нет альбомов для этого пользователя.';
         albumsDiv.appendChild(emptyMsg); 
        return;
    }

    albums.forEach(album => {
        const albumElement = document.createElement('div');
        albumElement.textContent = album.title;
        albumElement.addEventListener('click', () => loadPhotos(album.id, userId));
        albumsDiv.appendChild(albumElement);
    });
}

async function loadPhotos(albumId, userId) {
    showSection('photos-view');

    photosDiv.innerHTML = 'Загрузка фотографий...'; 

    const photos = await fetchData(`/photos?albumId=${albumId}`); 

    photosDiv.innerHTML = ''; 

    const backToAlbumsButton = document.createElement('button');
    backToAlbumsButton.textContent = '← Назад к альбомам';
    backToAlbumsButton.classList.add('back-button');
    backToAlbumsButton.addEventListener('click', () => loadAlbums(userId)); 
    photosDiv.appendChild(backToAlbumsButton); 


     if (photos === null) {
         const errorMsg = document.createElement('p');
         errorMsg.textContent = 'Не удалось загрузить фотографии. Попробуйте позже.';
         photosDiv.appendChild(errorMsg); 
        return;
    }

    if (photos.length === 0) {
         const emptyMsg = document.createElement('p');
         emptyMsg.textContent = 'Нет фотографий в этом альбоме.';
         photosDiv.appendChild(emptyMsg); 
        return;
    }

    photos.forEach(photo => {
        const photoElement = document.createElement('img');
        photoElement.src = photo.thumbnailUrl;
        photoElement.alt = photo.title; 
        photosDiv.appendChild(photoElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});