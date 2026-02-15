document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------
    // SES MOTORU (NODE CLONING TEKNİĞİ İLE KUSURSUZLAŞTIRILDI)
    // --------------------------------------------------
    const tickSound = document.getElementById('tick-sound');
    const alarmSound = document.getElementById('alarm-sound');
    let soundEnabled = true;

    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');

    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.innerText = soundEnabled ? '🔊' : '🔇';
    });

    function playTickSound() {
        if (!soundEnabled || !tickSound) return;
        
        const soundClone = tickSound.cloneNode();
        soundClone.volume = 0.4;
        soundClone.play().catch(e => {
            // Tarayıcı otomatik oynatma izni vermediyse sessizce geç
        });
    }

    function playAlarmSound() {
        if (!soundEnabled || !alarmSound) return;
        
        const alarmClone = alarmSound.cloneNode();
        alarmClone.volume = 0.8;
        alarmClone.play().catch(e => {
            // Tarayıcı otomatik oynatma izni vermediyse sessizce geç
        });
    }

    // Bildirim gösterme fonksiyonu
    function showNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { 
                body: body, 
                icon: 'https://raw.githubusercontent.com/umitcancinar/PomodoPro/main/Gemini_Generated_Image_13qm1u13qm1u13qm.png' 
            });
        }
    }

    // --------------------------------------------------
    // TAM EKRAN (FULLSCREEN) MODU
    // --------------------------------------------------
    const fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
    
    fullscreenToggleBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Tam ekran hatası: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // --------------------------------------------------
    // HAYALET MODU (IDLE / DIMMING) - ODAKLANMAYI ARTIRIR
    // --------------------------------------------------
    let idleTimer = null;
    
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        document.body.classList.remove('idle');
        
        idleTimer = setTimeout(() => {
            document.body.classList.add('idle');
        }, 7000);
    }

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    resetIdleTimer(); 

    // --------------------------------------------------
    // TEMA YÖNETİMİ & SENKRONİZASYON (HATA ÇÖZÜLDÜ)
    // --------------------------------------------------
    const themeSwitch = document.getElementById('theme-checkbox');
    const themeText = document.getElementById('theme-text');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Sayfa açıldığında temanın ve butonun kusursuz senkronizasyonu
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeSwitch.checked = false; 
        themeText.innerText = "Light Mode";
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeSwitch.checked = true; 
        themeText.innerText = "Dark Mode";
    }

    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark'); 
            themeText.innerText = "Dark Mode";
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light'); 
            themeText.innerText = "Light Mode";
        }
    });

    // --------------------------------------------------
    // FLIP CLOCK MANTIĞI
    // --------------------------------------------------
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function pad(num) { 
        return num.toString().padStart(2, '0'); 
    }

    function flip(cardElement, newNumber) {
        const topHalf = cardElement.querySelector('.top');
        const bottomHalf = cardElement.querySelector('.bottom');
        const currentValue = cardElement.getAttribute('data-value');

        if (newNumber === currentValue) return;
        
        if(cardElement === secondsEl || cardElement === minutesEl) {
            playTickSound();
        }

        cardElement.setAttribute('data-value', newNumber);

        const flipLeaf = document.createElement('div');
        flipLeaf.classList.add('flip-leaf');
        flipLeaf.innerText = currentValue;
        cardElement.appendChild(flipLeaf);

        topHalf.innerText = newNumber;
        
        setTimeout(() => {
            bottomHalf.innerText = newNumber;
            flipLeaf.remove();
        }, 400); 
    }

    // --------------------------------------------------
    // POMODORO MOTORU (THROTTLING HATASI ÇÖZÜLDÜ - DELTA TİME KULLANILDI)
    // --------------------------------------------------
    const modeClockBtn = document.getElementById('mode-clock');
    const modePomodoroBtn = document.getElementById('mode-pomodoro');
    const pomodoroControls = document.getElementById('pomodoro-controls');
    
    const pomodoroModal = document.getElementById('pomodoro-modal');
    const closePomodoroBtn = document.getElementById('close-pomodoro-btn');
    const pomodoroTimeForm = document.getElementById('pomodoro-time-form');
    const pTimeInput = document.getElementById('p-time-input');

    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnReset = document.getElementById('btn-reset');
    
    let isPomodoroMode = false;
    let pomodoroInterval = null;
    let customPomodoroMinutes = 25; 
    let pomodoroTimeLeft = customPomodoroMinutes * 60;
    let isPomodoroRunning = false;
    let currentFocus = "POMODOPRO";
    
    let pomodoroEndTime = 0; 

    modeClockBtn.addEventListener('click', () => {
        isPomodoroMode = false;
        modeClockBtn.classList.add('active');
        modePomodoroBtn.classList.remove('active');
        modePomodoroBtn.innerText = "Pomodoro";
        pomodoroControls.classList.add('hidden');
        
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        
        updateClock(); 
        document.title = currentFocus;
    });

    modePomodoroBtn.addEventListener('click', () => {
        pomodoroModal.classList.add('open');
        pTimeInput.focus();
    });

    closePomodoroBtn.addEventListener('click', () => {
        pomodoroModal.classList.remove('open');
    });

    pomodoroTimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const minutes = parseInt(pTimeInput.value);
        if (minutes > 0) {
            customPomodoroMinutes = minutes;
            pomodoroTimeLeft = customPomodoroMinutes * 60;
            
            isPomodoroMode = true;
            modePomodoroBtn.classList.add('active');
            modeClockBtn.classList.remove('active');
            modePomodoroBtn.innerText = `Pomodoro (${minutes}:00)`;
            pomodoroControls.classList.remove('hidden');
            
            isPomodoroRunning = false;
            clearInterval(pomodoroInterval);
            
            updateControlButtonsUI();
            updatePomodoroDisplay();
        }
        pomodoroModal.classList.remove('open');
        pTimeInput.value = '';
    });

    function startPomodoro() {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        if(!isPomodoroRunning) {
            isPomodoroRunning = true;
            updateControlButtonsUI();
            
            pomodoroEndTime = Date.now() + (pomodoroTimeLeft * 1000);
            
            pomodoroInterval = setInterval(() => {
                let remainingSeconds = Math.round((pomodoroEndTime - Date.now()) / 1000);
                
                if(remainingSeconds > 0) {
                    pomodoroTimeLeft = remainingSeconds;
                    updatePomodoroDisplay();
                } else {
                    pomodoroTimeLeft = 0;
                    updatePomodoroDisplay();
                    clearInterval(pomodoroInterval);
                    isPomodoroRunning = false;
                    updateControlButtonsUI();
                    playAlarmSound();
                    showNotification("Süre Doldu!", "Mükemmel odaklandın. Şimdi biraz dinlenme vakti.");
                    document.title = "Mola Vakti!";
                }
            }, 1000);
        }
    }

    function pausePomodoro() {
        if(isPomodoroRunning) {
            isPomodoroRunning = false;
            clearInterval(pomodoroInterval);
            updateControlButtonsUI();
            document.title = "Duraklatıldı - " + currentFocus;
        }
    }

    function resetPomodoro() {
        isPomodoroRunning = false;
        clearInterval(pomodoroInterval);
        updateControlButtonsUI();
        pomodoroTimeLeft = customPomodoroMinutes * 60; 
        updatePomodoroDisplay();
    }

    function updateControlButtonsUI() {
        if (isPomodoroRunning) {
            btnStart.classList.add('hidden');
            btnPause.classList.remove('hidden');
        } else {
            btnStart.classList.remove('hidden');
            btnPause.classList.add('hidden');
        }
    }

    btnStart.addEventListener('click', startPomodoro);
    btnPause.addEventListener('click', pausePomodoro);
    btnReset.addEventListener('click', resetPomodoro);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault(); 
            if (isPomodoroMode) {
                if (isPomodoroRunning) pausePomodoro();
                else startPomodoro();
            }
        }
    });

    function updatePomodoroDisplay() {
        const h = pad(Math.floor(pomodoroTimeLeft / 3600));
        const m = pad(Math.floor((pomodoroTimeLeft % 3600) / 60));
        const s = pad(pomodoroTimeLeft % 60);

        flip(hoursEl, h);
        flip(minutesEl, m);
        flip(secondsEl, s);

        document.title = `(${m}:${s}) ${currentFocus}`;
    }

    function updateClock() {
        if (isPomodoroMode) return; 
        const now = new Date();
        flip(hoursEl, pad(now.getHours()));
        flip(minutesEl, pad(now.getMinutes()));
        flip(secondsEl, pad(now.getSeconds()));
    }

    updateClock();
    setInterval(() => { 
        if(!isPomodoroMode) updateClock(); 
    }, 1000);

    // --------------------------------------------------
    // HEDEF (FOCUS) MODÜLÜ
    // --------------------------------------------------
    const goalModal = document.getElementById('goal-modal');
    const closeGoalBtn = document.getElementById('close-goal-btn');
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('g-input');
    const focusDisplay = document.getElementById('focus-display');

    closeGoalBtn.addEventListener('click', () => {
        goalModal.classList.remove('open');
    });

    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredGoal = goalInput.value.trim();
        if (enteredGoal) {
            currentFocus = enteredGoal;
            focusDisplay.innerText = currentFocus;
            focusDisplay.classList.remove('hidden');
            document.title = currentFocus + " - Odaklanılıyor";
        }
        goalModal.classList.remove('open');
        goalInput.value = '';
    });

    focusDisplay.addEventListener('click', () => {
        focusDisplay.classList.add('hidden');
        currentFocus = "POMODOPRO";
        document.title = "Pomodopro - Zaman Yönetimi";
    });

    // --------------------------------------------------
    // KAPSÜL MENÜ (HAMBURGER SPEED DIAL) VE YAN PANELLER
    // --------------------------------------------------
    const mainFabBtn = document.getElementById('main-fab');
    const fabMenu = document.getElementById('fab-menu');
    const fabIcon = document.getElementById('fab-icon');

    const musicBtn = document.getElementById('music-btn');
    const goalBtn = document.getElementById('goal-btn');
    const noteBtn = document.getElementById('note-btn');

    const musicPanel = document.getElementById('music-panel');
    const closeMusicBtn = document.getElementById('close-music-btn');
    
    const notePanel = document.getElementById('note-panel');
    const closeNoteBtn = document.getElementById('close-note-btn');
    const noteArea = document.getElementById('note-area');
    const downloadWordBtn = document.getElementById('download-word-btn');

    mainFabBtn.addEventListener('click', () => {
        fabMenu.classList.toggle('open');
        mainFabBtn.classList.toggle('active');
        fabIcon.innerText = fabMenu.classList.contains('open') ? '✕' : '☰';
    });

    function closeFabMenu() {
        fabMenu.classList.remove('open');
        mainFabBtn.classList.remove('active');
        fabIcon.innerText = '☰';
    }

    goalBtn.addEventListener('click', () => {
        closeFabMenu();
        goalModal.classList.add('open');
        goalInput.focus();
    });

    musicBtn.addEventListener('click', () => {
        closeFabMenu();
        musicPanel.classList.add('open');
        notePanel.classList.remove('open'); 
    });
    
    closeMusicBtn.addEventListener('click', () => {
        musicPanel.classList.remove('open');
    });

    noteArea.value = localStorage.getItem('pomodopro_notes') || '';
    noteArea.addEventListener('input', (e) => {
        localStorage.setItem('pomodopro_notes', e.target.value);
    });

    noteBtn.addEventListener('click', () => {
        closeFabMenu();
        notePanel.classList.add('open');
        musicPanel.classList.remove('open'); 
    });
    
    closeNoteBtn.addEventListener('click', () => {
        notePanel.classList.remove('open');
    });

    downloadWordBtn.addEventListener('click', () => {
        const noteText = noteArea.value;
        if (!noteText.trim()) {
            alert("İndirilecek not bulunamadı.");
            return;
        }

        const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Pomodopro Notları</title></head><body>";
        const postHtml = "</body></html>";
        const formattedText = noteText.replace(/\n/g, '<br>'); 
        const html = preHtml + formattedText + postHtml;

        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        link.href = url;
        link.download = `Pomodopro-Notlari-${date}.doc`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
});