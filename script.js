// JavaScript to handle dynamic loading of Surah cards
const surahList = document.getElementById('surahList');
const loadMoreButton = document.getElementById('loadMoreSurahs');
const surahSearch = document.getElementById('surahSearch');
let currentSurahCount = 0;
const surahsPerLoad = 10;
let allSurahs = [];
let currentAudio = null;

async function fetchAllSurahs() {
    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await response.json();
        allSurahs = data.chapters;
    } catch (error) {
        console.error('Error fetching surahs:', error);
    }
}

// Fetch audio URL for a specific surah
async function fetchAudioUrl(surahNumber) {
    try {
        const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${surahNumber}`);
        const data = await response.json();
        return data.audio_file.audio_url;
    } catch (error) {
        console.error('Error fetching audio URL:', error);
    }
}

async function loadMoreSurahs() {
    const remainingSurahs = Math.min(surahsPerLoad, allSurahs.length - currentSurahCount);

    for (let i = 0; i < remainingSurahs; i++) {
        const surah = allSurahs[currentSurahCount];
        const audioUrl = await fetchAudioUrl(surah.id);
        const surahCard = document.createElement('div');
        surahCard.className = 'bg-white rounded-lg shadow-md p-4 transition duration-300 hover:shadow-lg';
        surahCard.innerHTML = `
            <h4 class="text-xl font-semibold mb-2">${surah.name_simple}</h4>
            <p class="mb-2">${surah.translated_name.name}</p>
            <p class="mb-4">Verses: ${surah.verses_count}</p>
            <div class="audio-player" data-surah-id="${surah.id}">
                <audio src="${audioUrl}"></audio>
                <button class="play-pause bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 mb-2">Play</button>
                <div class="progress-bar bg-gray-200 h-2 rounded-full mb-2">
                    <div class="progress bg-accent h-full rounded-full" style="width: 0%"></div>
                </div>
                <span class="current-time">0:00</span> / <span class="duration">0:00</span>
            </div>
        `;
        surahList.appendChild(surahCard);

        const audioPlayer = surahCard.querySelector('.audio-player');
        setupAudioPlayer(audioPlayer);

        currentSurahCount++;
    }

    if (currentSurahCount >= allSurahs.length) {
        loadMoreButton.style.display = 'none';
    }
}

function setupAudioPlayer(audioPlayer) {
    const audio = audioPlayer.querySelector('audio');
    const playPauseBtn = audioPlayer.querySelector('.play-pause');
    const progressBar = audioPlayer.querySelector('.progress');
    const currentTimeSpan = audioPlayer.querySelector('.current-time');
    const durationSpan = audioPlayer.querySelector('.duration');

    playPauseBtn.addEventListener('click', () => {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.parentNode.querySelector('.play-pause').textContent = 'Play';
        }
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = 'Pause';
            currentAudio = audio;
        } else {
            audio.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        playPauseBtn.textContent = 'Play';
        progressBar.style.width = '0%';
        currentTimeSpan.textContent = '0:00';
    });
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Search Surahs
surahSearch.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSurahs = allSurahs.filter(surah => 
        surah.name_simple.toLowerCase().includes(searchTerm) || 
        surah.translated_name.name.toLowerCase().includes(searchTerm)
    );
    surahList.innerHTML = '';
    for (const surah of filteredSurahs) {
        const audioUrl = await fetchAudioUrl(surah.id);
        const surahCard = document.createElement('div');
        surahCard.className = 'bg-white rounded-lg shadow-md p-4';
        surahCard.innerHTML = `
            <h4 class="text-xl font-semibold mb-2">${surah.name_simple}</h4>
            <p class="mb-2">${surah.translated_name.name}</p>
            <p class="mb-4">Verses: ${surah.verses_count}</p>
            <div class="audio-player" data-surah-id="${surah.id}">
                <audio src="${audioUrl}"></audio>
                <button class="play-pause bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 mb-2">Play</button>
                <div class="progress-bar bg-gray-200 h-2 rounded-full mb-2">
                    <div class="progress bg-accent h-full rounded-full" style="width: 0%"></div>
                </div>
                <span class="current-time">0:00</span> / <span class="duration">0:00</span>
            </div>
        `;
        surahList.appendChild(surahCard);

        const audioPlayer = surahCard.querySelector('.audio-player');
        setupAudioPlayer(audioPlayer);
    }
    loadMoreButton.style.display = filteredSurahs.length > surahsPerLoad ? 'block' : 'none';
    currentSurahCount = Math.min(surahsPerLoad, filteredSurahs.length);
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData);
    console.log('Form submitted:', formObject);
    // Implement actual form submission to backend here
    alert('Thank you for your message. We will get back to you soon!');
    contactForm.reset();
});

// Initialize Quran Recitations
async function initQuranRecitations() {
    await fetchAllSurahs();
    loadMoreSurahs(); // Initial load
}

loadMoreButton.addEventListener('click', loadMoreSurahs);

// Initialize the page
initQuranRecitations();