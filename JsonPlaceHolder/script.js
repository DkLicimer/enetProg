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