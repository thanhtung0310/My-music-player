/*
  1. Render songs
  2. Scroll top
  3. Play / pause / seek
  4. CD rotate
  5. Next / prev
  6. Random
  7. Next / Repeat when ended
  8. Active song
  9. Scroll active song into view
  10. PLay song when click
*/

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// get playlist item
const playlist = $('.playlist')
// get cd
const cd = $('.cd')
// get heading
const heading = $('header h2')
// get cd thumbnail
const cdThumbnail = $('.cd-thumb')
// get audio
const audio = $('#audio')
// get play button
const playBtn = $('.btn-toggle-play')
// get audio player
const player = $('.player')
// get progress
const progress = $('#progress')
// get next song button
const nextBtn = $('.btn-next')
// get previous song button
const prevBtn = $('.btn-prev')
// get random song button
const randomBtn = $('.btn-random')
// get repeat song button
const repeatBtn = $('.btn-repeat')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Love Yourself',
      singer: 'Justin Bieber',
      path: './assets/songs/love_yourself-justin_bieber.mp4',
      image: './assets/img/love_yourself-justin_bieber.jpg'
    },
    {
      name: 'Baby',
      singer: 'Justin Bieber, Ludacris',
      path: './assets/songs/baby-justin_bieber.mp4',
      image: './assets/img/baby-justin_bieber.jpg'
    },
    {
      name: '22',
      singer: 'Taylor Swift',
      path: './assets/songs/22-taylor_swift.mp4',
      image: './assets/img/22-taylor_swift.jpg'
    },
    {
      name: 'Cơn mưa ngang qua',
      singer: 'Sơn Tùng MTP',
      path: './assets/songs/con_mua_ngang_qua-son_tung_mtp.mp3',
      image: './assets/img/con_mua_ngang_qua-son_tung_mtp.jpg'
    },
    {
      name: 'Bông hoa đẹp nhất',
      singer: 'Quân A.P',
      path: './assets/songs/bong_hoa_dep_nhat-quan_ap.mp4',
      image: './assets/img/bong_hoa_dep_nhat-quan_ap.jpg'
    },
    {
      name: 'thích em hơi nhiều',
      singer: 'Wren Evans',
      path: './assets/songs/thich_em_hoi_nhieu-wren_evans.mp4',
      image: './assets/img/thich_em_hoi_nhieu-wren_evans.jpg'
    },
  ],
  // set config
  setConfig: function(key, value) { 
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  // load visualization
  loadVisualization: function() {
    // display initialize status of button
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
  },
  // render songs' information
  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('')
  },
  // hàm định nghĩa các thuộc tính
  defineProperties: function() {
    // current song
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex]
      }
    })
  },
  // handle events
  handleEvents: function() {
    // get out
    const _this = this
    // original cd Width
    const cdWidth = cd.offsetWidth

    // handle cd spin when audio play
    const cdThumbnailAnimate = cdThumbnail.animate([
      {
        transform: 'rotate(360deg)'
      }
    ], {
      duration: 10000, // 10sec
      iteration: Infinity,
    })
    cdThumbnailAnimate.pause() // start on pause animation

    // catch event scroll and minimize view
    document.onscroll = function() {
      // get scroll top value
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCDWidth = cdWidth - scrollTop
      // set cd width to minimize cd disc when scroll down
      cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0
      // set opacity
      cd.style.opacity = newCDWidth / cdWidth
    }

    // catch play audio event
    playBtn.onclick = function() {
      if (_this.isPlaying) 
        audio.pause()
      else audio.play()
    }

    // check if song is playing
    audio.onplay = function() {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbnailAnimate.play()
    }
    
    // check if song is paused
    audio.onpause = function() {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbnailAnimate.pause()
    }

    // check audio progress on change
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }

    // handle when audio ended
    audio.onended = function() {
      if (_this.isRepeat)
        audio.play()
      else
        nextBtn.click()
    }

    // handle when change audio progress
    progress.onchange = function(e) { 
      const seekTime = audio.duration / 100 * e.target.value
      audio.currentTime = seekTime
    }

    // handle when next song button is clicked
    nextBtn.onclick = function() {
      if (_this.isRandom)
        _this.randomSong()
      else
        _this.nextSong()
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }
    
    // handle when prev song button is clicked
    prevBtn.onclick = function() {
      if (_this.isRandom)
      _this.randomSong()
      else
      _this.prevSong()
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    // handle when random button is clicked
    randomBtn.onclick = function(e) {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    // handle when repeat button is clicked
    repeatBtn.onclick = function(e) {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    // listen when click a song in playlist
    playlist.onclick = function(e) { 
      const songNode = e.target.closest('.song:not(.active)')
      const optionBtn = e.target.closest('.option')

      // handle when click into songs || option button
      if (songNode || optionBtn) {
        // handle when click into song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index) //.dataset.index -> string => convert to number
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }

        // handle when click into option button
        if (optionBtn) {
          return
        }
      }
    }
  },
  // load config
  loadConfig: function() {
    // more secure
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
    this.currentIndex = this.config.currentIndex

    this.loadVisualization()
    // not secure
    // Object.assign(this, this.config)
  },
  // load current song
  loadCurrentSong: function() {
    heading.textContent = this.currentSong.name
    cdThumbnail.style.backgroundImage = `url(${this.currentSong.image})`
    audio.src = this.currentSong.path
    this.setConfig('currentIndex', this.currentIndex)
  },
  // play next song
  nextSong: function() {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) 
      this.currentIndex = 0
    this.loadCurrentSong()
  },
  // play previous song
  prevSong: function() {
    this.currentIndex--
    if (this.currentIndex < 0) 
      this.currentIndex = this.songs.length - 1
    this.loadCurrentSong()
  },
  // play random song
  randomSong: function() { 
    let newSongIndex
    do {
      newSongIndex = Math.floor(Math.random() * this.songs.length)
    } while (newSongIndex === this.currentIndex)
    this.currentIndex = newSongIndex
    this.loadCurrentSong()
  },
  scrollToActiveSong: function() { 
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 300)
  },
  // main function to start
  start: function() {
    // load config from local storage
    this.loadConfig()

    // Định nghĩa các thuộc tính cho Object
    this.defineProperties()

    // lắng nghe các sự kiện
    this.handleEvents()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy app
    this.loadCurrentSong()

    // Render playlist
    this.render()
  },
}

app.start()
