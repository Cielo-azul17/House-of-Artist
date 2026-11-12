// Original page logic from the design canvas.
// Reference only: port the interactive parts to Astro islands.

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { filter: 'all', role: 'performer', sent: false, loading: true, phase: 'intro', revealed: false, playerIndex: -1, muted: false, showTop: false , menuOpen: false, svcIdx: 0, procIdx: 0};
    this.loaderTimers = [];
    this.clearLoader = () => {
      this.loaderTimers.forEach((t) => clearTimeout(t));
      this.loaderTimers = [];
    };
    this.startExit = (delay) => {
      this.clearLoader();
      this.loaderTimers.push(setTimeout(() => this.setState({ phase: 'out' }), delay));
      this.loaderTimers.push(setTimeout(() => this.setState({ revealed: true }), delay + 450));
      this.loaderTimers.push(setTimeout(() => this.setState({ loading: false }), delay + 1200));
    };
    this.runLoader = () => {
      this.setState({ loading: true, phase: 'intro', revealed: false });
      this.startExit(1850);
    };
    this.skipIntro = () => {
      if (this.state.phase === 'out') return;
      this.startExit(0);
    };
    this.ASSOC = [
      { type: 'Ad film', artist: '[Artist name]', duration: '[0:00]', video: '' },
      { type: 'Documentary', artist: '[Artist name]', duration: '[0:00]', video: '' },
      { type: 'Ad film', artist: '[Artist name]', duration: '[0:00]', video: '' },
      { type: 'Live performance', artist: '[Artist name]', duration: '[0:00]', video: '' },
      { type: 'Short film', artist: '[Artist name]', duration: '[0:00]', video: '' },
      { type: 'Music video', artist: '[Artist name]', duration: '[0:00]', video: '' }
    ];
    this.SHOWREEL = [
      { title: 'House of Artist showreel', meta: '[2\u20133 min] \u00b7 Music, events and film', source: 'Vimeo' }
    ];
    this.playerEl = null;
    this.lastTrigger = null;
    this.touchX = null;
    this.activeList = [];
    this.setPlayerEl = (el) => {
      this.playerEl = el;
      if (el) el.focus();
    };
    this.lockScroll = (on) => {
      if (typeof document === 'undefined') return;
      document.documentElement.style.overflow = on ? 'hidden' : '';
    };
    this.openPlayer = (list, i, e) => {
      this.lastTrigger = e && e.currentTarget ? e.currentTarget : null;
      this.activeList = list || [];
      this.lockScroll(true);
      this.setState({ playerIndex: i });
    };
    this.playShowreel = (e) => this.openPlayer(this.SHOWREEL, 0, e);
    this.closePlayer = () => {
      this.lockScroll(false);
      this.setState({ playerIndex: -1 });
      const t = this.lastTrigger;
      if (t && t.focus) setTimeout(() => t.focus(), 0);
    };
    this.stepVideo = (d) => {
      const n = this.activeList.length;
      if (n < 2) return;
      this.setState((st) => ({ playerIndex: (st.playerIndex + d + n) % n }));
    };
    this.toggleMute = () => this.setState((st) => ({ muted: !st.muted }));
    this.prevVideo = () => this.stepVideo(-1);
    this.nextVideo = () => this.stepVideo(1);
    this.playerKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); this.closePlayer(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.stepVideo(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.stepVideo(1); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); this.toggleMute(); }
    };
    this.touchStart = (e) => { this.touchX = e.touches && e.touches[0] ? e.touches[0].clientX : null; };
    this.touchEnd = (e) => {
      if (this.touchX === null || !e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - this.touchX;
      this.touchX = null;
      if (Math.abs(dx) > 50) this.stepVideo(dx < 0 ? 1 : -1);
    };
    this.playerVals = () => {
      const i = this.state.playerIndex;
      const list = (this.activeList && this.activeList.length) ? this.activeList : this.SHOWREEL;
      const n = list.length;
      const dotOn = '#0B6E80';
      const dotOff = 'rgba(19,35,42,0.12)';
      if (i < 0 || !n) {
        return { open: false, title: '', meta: '', source: 'YouTube', counter: '', dots: [], muted: false, soundOn: true, multi: false };
      }
      const cur = list[i] || {};
      const pad = (v) => (v < 10 ? '0' : '') + v;
      return {
        open: true,
        title: cur.title || '',
        meta: cur.meta || '',
        source: cur.source || 'YouTube',
        counter: pad(i + 1) + ' / ' + pad(n),
        muted: this.state.muted,
        soundOn: !this.state.muted,
        multi: n > 1,
        dots: n > 1 ? list.map((_, j) => ({ color: j === i ? dotOn : dotOff })) : []
      };
    };
    this.onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const show = y > 600;
      if (show !== this.state.showTop) this.setState({ showTop: show });
    };
    this.procTrack = null;
    this.setProcTrack = (el) => { this.procTrack = el; };
    this.scrollProc = (d) => {
      const t = this.procTrack;
      if (!t) return;
      t.scrollBy({ left: d * Math.round(t.clientWidth * 0.7), behavior: 'smooth' });
    };
    this.procPrev = () => this.scrollProc(-1);
    this.procNext = () => this.scrollProc(1);
    this.onProcScroll = (e) => {
      const t = e.currentTarget;
      const max = t.scrollWidth - t.clientWidth;
      const idx = max <= 4 ? 0 : Math.round((t.scrollLeft / max) * 2);
      if (idx !== this.state.procIdx) this.setState({ procIdx: idx });
    };
    this.svcTrack = null;
    this.setSvcTrack = (el) => { this.svcTrack = el; };
    this.scrollSvc = (d) => {
      const t = this.svcTrack;
      if (!t) return;
      t.scrollBy({ left: d * Math.round(t.clientWidth * 0.75), behavior: 'smooth' });
    };
    this.svcPrev = () => this.scrollSvc(-1);
    this.svcNext = () => this.scrollSvc(1);
    this.onSvcScroll = (e) => {
      const t = e.currentTarget;
      const max = t.scrollWidth - t.clientWidth;
      const idx = max <= 4 ? 0 : Math.round((t.scrollLeft / max) * 3);
      if (idx !== this.state.svcIdx) this.setState({ svcIdx: idx });
    };
    this.toggleMenu = () => this.setState((st) => ({ menuOpen: !st.menuOpen }));
    this.closeMenu = () => { if (this.state.menuOpen) this.setState({ menuOpen: false }); };
    this.dot = null;
    this.ring = null;
    this.trailBox = null;
    this.root = null;
    this.setDot = (el) => { this.dot = el; };
    this.setRing = (el) => { this.ring = el; };
    this.setTrailBox = (el) => { this.trailBox = el; };
    this.TRAIL = 10;
    this.trailEls = [];
    this.trailPts = [];
    this.trailRefs = [];
    for (let i = 0; i < this.TRAIL; i++) {
      this.trailPts.push({ x: 0, y: 0 });
      this.trailRefs.push((el) => { this.trailEls[i] = el; });
    }
    this.client = null;
    this.dotPos = { x: 0, y: 0 };
    this.snap = true;
    this.last = 0;
    this.raf = 0;
    this.toLocal = () => {
      const root = this.root;
      const c = this.client;
      if (!root || !c) return null;
      const r = root.getBoundingClientRect();
      const scale = root.offsetWidth ? r.width / root.offsetWidth : 1;
      return { x: (c.x - r.left) / scale, y: (c.y - r.top) / scale };
    };
    this.tick = (now) => {
      const dt = this.last ? Math.min(now - this.last, 64) : 16.7;
      this.last = now;
      const t = this.toLocal();
      if (t && this.dot) {
        const f = dt / 16.7;
        const kDot = 1 - Math.pow(1 - 0.42, f);
        const kTrail = 1 - Math.pow(1 - 0.6, f);
        const d = this.dotPos;
        if (this.snap) {
          d.x = t.x; d.y = t.y;
          this.trailPts.forEach((p) => { p.x = t.x; p.y = t.y; });
          this.snap = false;
        }
        d.x += (t.x - d.x) * kDot;
        d.y += (t.y - d.y) * kDot;
        this.dot.style.transform = 'translate3d(' + d.x + 'px, ' + d.y + 'px, 0)';
        let px = d.x;
        let py = d.y;
        for (let i = 0; i < this.trailPts.length; i++) {
          const p = this.trailPts[i];
          p.x += (px - p.x) * kTrail;
          p.y += (py - p.y) * kTrail;
          const el = this.trailEls[i];
          if (el) el.style.transform = 'translate3d(' + p.x + 'px, ' + p.y + 'px, 0)';
          px = p.x;
          py = p.y;
        }
      }
      this.raf = window.requestAnimationFrame(this.tick);
    };
    this.moveCursor = (e) => {
      const root = e.currentTarget;
      if (!root || !this.dot || !this.ring) return;
      this.root = root;
      if (!this.client) this.snap = true;
      this.client = { x: e.clientX, y: e.clientY };
      root.setAttribute('data-cursor', 'on');
      const t = e.target && e.target.closest ? e.target : null;
      const onField = t && t.closest('input, textarea, select');
      const onLink = t && t.closest('a, button, label');
      this.dot.style.opacity = onField ? '0' : '1';
      if (this.trailBox) this.trailBox.style.opacity = onField ? '0' : '1';
      const ring = this.ring;
      if (onLink) {
        ring.style.width = '28px';
        ring.style.height = '28px';
        ring.style.backgroundColor = 'rgba(63, 208, 230, 0.18)';
      } else {
        ring.style.width = '14px';
        ring.style.height = '14px';
        ring.style.backgroundColor = '#3FD0E6';
      }
    };
    this.hideCursor = (e) => {
      if (this.dot) this.dot.style.opacity = '0';
      if (this.trailBox) this.trailBox.style.opacity = '0';
      this.client = null;
      if (e.currentTarget) e.currentTarget.setAttribute('data-cursor', 'off');
    };
  }
  componentDidMount() {
    if (typeof window !== 'undefined') window.addEventListener('scroll', this.onScroll, { passive: true });
    if (this.props.showLoader ?? true) {
      this.startExit(1850);
    } else {
      this.setState({ loading: false, revealed: true });
    }
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.raf = window.requestAnimationFrame(this.tick);
    }
  }
  componentDidUpdate(prevProps) {
    const was = (prevProps && prevProps.showLoader) ?? true;
    const now = this.props.showLoader ?? true;
    if (!was && now) {
      this.runLoader();
    }
  }
  componentWillUnmount() {
    if (typeof window !== 'undefined') window.removeEventListener('scroll', this.onScroll);
    this.lockScroll(false);
    if (this.raf) window.cancelAnimationFrame(this.raf);
    this.loaderTimers.forEach((t) => clearTimeout(t));
  }
  renderVals() {
    const FILTERS = [
      { id: 'all', label: 'All' },
      { id: 'live', label: 'Live events' },
      { id: 'artist', label: 'Artist projects' },
      { id: 'brand', label: 'Brand campaigns' },
      { id: 'content', label: 'Content' }
    ];
    const WORKS = [
      { cat: 'live', tag: 'Live event', title: '[Concert name]', meta: '[Venue], [City] · [Year]', ph: 'Thumbnail · crowd and stage lights' },
      { cat: 'brand', tag: 'Brand campaign', title: '[Brand] × [Artist]', meta: '[Campaign type] · [Year]', ph: 'Thumbnail · campaign shoot' },
      { cat: 'content', tag: 'Content', title: '[Music video title]', meta: '[Artist] · [Year]', ph: 'Thumbnail · music video frame' },
      { cat: 'live', tag: 'Live event', title: '[Festival or show name]', meta: '[Venue], [City] · [Year]', ph: 'Thumbnail · festival stage' },
      { cat: 'artist', tag: 'Artist project', title: '[Artist launch or tour]', meta: '[Artist] · [Year]', ph: 'Thumbnail · artist portrait' },
      { cat: 'content', tag: 'Content', title: '[Behind-the-scenes series]', meta: '[Platform] · [Year]', ph: 'Thumbnail · backstage footage' }
    ];
    const f = this.state.filter;
    const role = this.state.role;
    const vis = WORKS.filter((w) => f === 'all' || w.cat === f);
    const visPl = vis.map((w) => ({ title: w.title, meta: w.meta }));
    const assocPl = this.ASSOC.map((x) => ({ title: x.type, meta: x.artist + ' \u00b7 Independent work' }));
    return {
      loading: this.state.loading && (this.props.showLoader ?? true),
      loaderClass: this.state.phase === 'out' ? 'hoa-loader is-out' : 'hoa-loader',
      skipIntro: this.skipIntro,
      fxClass: (this.state.revealed || !(this.props.showLoader ?? true)) ? 'fx-in' : 'fx-wait',
      assoc: this.ASSOC.map((x, i) => ({
        ...x,
        label: 'Play ' + x.type.toLowerCase() + ' by ' + x.artist,
        open: (e) => this.openPlayer(assocPl, i, e)
      })),
      player: this.playerVals(),
      playerRef: this.setPlayerEl,
      playerKey: this.playerKey,
      closePlayer: this.closePlayer,
      toggleMute: this.toggleMute,
      prevVideo: this.prevVideo,
      nextVideo: this.nextVideo,
      touchStart: this.touchStart,
      touchEnd: this.touchEnd,
      playShowreel: this.playShowreel,
      showTop: this.state.showTop,
      procRef: this.setProcTrack,
      onProcScroll: this.onProcScroll,
      procPrev: this.procPrev,
      procNext: this.procNext,
      procDots: [0, 1, 2].map((i) => ({ color: i === this.state.procIdx ? '#3FD0E6' : 'rgba(255,255,255,0.2)' })),
      svcRef: this.setSvcTrack,
      onSvcScroll: this.onSvcScroll,
      svcPrev: this.svcPrev,
      svcNext: this.svcNext,
      svcDots: [0, 1, 2, 3].map((i) => ({ color: i === this.state.svcIdx ? '#0B6E80' : 'rgba(19,35,42,0.18)' })),
      menuOpen: this.state.menuOpen,
      menuClosed: !this.state.menuOpen,
      menuClass: this.state.menuOpen ? 'is-open' : '',
      toggleMenu: this.toggleMenu,
      closeMenu: this.closeMenu,
      dotRef: this.setDot,
      ringRef: this.setRing,
      trailBoxRef: this.setTrailBox,
      trailRef0: this.trailRefs[0],
      trailRef1: this.trailRefs[1],
      trailRef2: this.trailRefs[2],
      trailRef3: this.trailRefs[3],
      trailRef4: this.trailRefs[4],
      trailRef5: this.trailRefs[5],
      trailRef6: this.trailRefs[6],
      trailRef7: this.trailRefs[7],
      trailRef8: this.trailRefs[8],
      trailRef9: this.trailRefs[9],
      moveCursor: this.moveCursor,
      hideCursor: this.hideCursor,
      filters: FILTERS.map((x) => ({
        label: x.label,
        active: x.id === f,
        inactive: x.id !== f,
        pick: () => this.setState({ filter: x.id })
      })),
      works: vis.map((w, i) => ({
        ...w,
        label: 'Play ' + w.title,
        open: (e) => this.openPlayer(visPl, i, e)
      })),
      isPerformer: role === 'performer',
      isOrganizer: role === 'organizer',
      pickPerformer: () => this.setState({ role: 'performer', sent: false }),
      pickOrganizer: () => this.setState({ role: 'organizer', sent: false }),
      sent: this.state.sent,
      notSent: !this.state.sent,
      send: () => this.setState({ sent: true })
    };
  }
}
