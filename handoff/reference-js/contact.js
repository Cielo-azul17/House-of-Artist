// Original page logic from the design canvas.
// Reference only: port the interactive parts to Astro islands.

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { role: 'performer', sent: false, showTop: false , menuOpen: false};
    this.ROLES = [
      { id: 'performer', label: 'I’m a performer', title: 'Join as a performer', sub: 'Looking for opportunities, collaborations or representation.' },
      { id: 'organizer', label: 'I’m an organizer', title: 'Plan an event with us', sub: 'Planning an event or looking for talented artists.' }
    ];
    this.pickPerformer = () => this.setState({ role: 'performer', sent: false });
    this.pickOrganizer = () => this.setState({ role: 'organizer', sent: false });
    this.send = () => this.setState({ sent: true });
    this.onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const show = y > 600;
      if (show !== this.state.showTop) this.setState({ showTop: show });
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
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.raf = window.requestAnimationFrame(this.tick);
    }
  }
  componentWillUnmount() {
    if (typeof window !== 'undefined') window.removeEventListener('scroll', this.onScroll);
    if (this.raf) window.cancelAnimationFrame(this.raf);
  }
  renderVals() {
    const role = this.state.role;
    const cur = this.ROLES.find((r) => r.id === role) || this.ROLES[0];
    return {
      pickPerformer: this.pickPerformer,
      pickOrganizer: this.pickOrganizer,
      formTitle: cur.title,
      formSub: cur.sub,
      isPerformer: role === 'performer',
      isOrganizer: role === 'organizer',
      sent: this.state.sent,
      notSent: !this.state.sent,
      send: this.send,
      showTop: this.state.showTop,
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
    };
  }
}
