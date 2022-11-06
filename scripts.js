//* CÁC CHỨC NĂNG CẦN THỰC HIỆN
// 1. Render songs
// 2. Scroll top
// 3. Play / pause / seek
// 4. CD rotated
// 5. Next / prev
// 6. Random number
// 7. Next / Repeat When ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelector.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Đau Ở Đây Này",
      singer: "Nal",
      path: "./assets/music/Dau_O_Day_Nay.mp3",
      image: "./assets/img/Dau_o_day_nay.jpg",
    },

    {
      name: "Ai Là Người Thương Em",
      singer: "Quân AP",
      path: "./assets/music/Ai_La_Nguoi_Thuong_Em.mp3",
      image: "./assets/img/Ai_la_nguoi_thuong_em.jpg",
    },

    {
      name: "Sóng Gió",
      singer: "Jack",
      path: "./assets/music/Song_Gio.mp3",
      image: "./assets/img/Song_gio.jpg",
    },

    {
      name: "Khoảng Cách",
      singer: "Khánh Phong",
      path: "./assets/music/Khoang_Cach.mp3",
      image: "./assets/img/Khoang_cach.jpg",
    },

    {
      name: "Cái Gật Đầu Hạnh Phúc",
      singer: "Dương Nhất Linh",
      path: "./assets/music/Cai_Gat_Dau_HP.mp3",
      image: "./assets/img/Cai_gat_dau_hanh_phuc.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                  <div class="song ${
                    index === this.currentIndex ? "active" : ""
                  }" data-index = "${index}">
                      <div
                          class="thumb"
                          style="background-image: url('${song.image}');">
                      </div>
                      <div class="body">
                          <h3 class="title">${song.name}</h3>
                          <p class="author">${song.singer}</p>
                      </div>
                      <div class="option">
                          <i class="fas fa-ellipsis-h"></i>
                      </div>
                  </div>
              `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    // *thêm thuộc tính currentSong cho object app -> trả về bài hát hiện tại
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  // !Chứa các Hàm xử Lý
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    //Xu ly CD quay / dung
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, //10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // *Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth; //*Làm mờ Đĩa
    };

    // *Xử lý khi click nút Play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //* Khi song duoc play
    audio.onplay = function () {
      _this.isPlaying = true;
      cdThumbAnimate.play();
      player.classList.add("playing");

      //  playBtn.innerHTML = `<ion-icon name="pause-circle-outline"></ion-icon>`
    };
    //* Khi song bi pause
    audio.onpause = function () {
      _this.isPlaying = false;
      cdThumbAnimate.pause();
      player.classList.remove("playing");
      // playBtn.innerHTML = `<ion-icon name="play-outline"></ion-icon>`
    };

    // *Khi tiến độ bài hát bị thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // *Xu Ly khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // *Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // *Khi pev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // *Khi Xu ly BẬT / TẮT Random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // *Khi Xử Lý LẶP LẠI (Repeat) 1 song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // *Xủ Lý TỰ NEXT song
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // *Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // *Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // *Xử lý khi click vào song option
        // if (e.target.closest('.option')) {

        // }
      }
    };
  },

  //!------------------------------------------------------------//
  scrollToActiveSong: function () {
    setTimeout(() =>
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    );
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  // Khi Next song
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  // Khi Prev Song
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // Ham Random
  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // *Đinh nghĩa các thuộc tính cho Object
    this.defineProperties();

    // *Đinh nghĩa / Xử lý các sự kiện (DOM events)
    this.handleEvents();

    // *Tải thông tin bài hát đầu tiên vào Giao diện (UI) khi chạy ứng dụng
    this.loadCurrentSong();

    // *Render playlist
    this.render();
  },
};

app.start();
