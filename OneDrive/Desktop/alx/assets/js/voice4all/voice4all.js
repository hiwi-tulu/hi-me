/**
 * Voice4All — Main Coordinator & Accessible Controller (`assets/js/voice4all/voice4all.js`)
 *
 * Coordinates:
 *   - Floating launcher button
 *   - Accessible side drawer (dialog with focus trap, Esc-to-close, backdrop)
 *   - 3 Accessible Tabs (Tutor, Live Help, Career) with keyboard arrow navigation
 *   - English and Amharic language toggling
 *   - Voice input (SpeechRecognition) and Speech Synthesis (TTS)
 *   - Live Help request handling with honest screen sharing state
 *   - Career listings and workplace accommodation requests
 *   - Backend/Demo status tracking and screen-reader announcements
 */

((root) => {
  'use strict';

  const STORAGE_LANG_KEY = 'v4a_preferred_lang';

  // State Management
  const state = {
    lang: 'en',
    drawerOpen: false,
    activeTab: 'tutor', // 'tutor' | 'help' | 'career'
    isListening: false,
    speechRecognition: null,
    currentUtterance: null,
    activeFilter: 'all',
    searchQuery: '',
    activeTicket: null,
    lastActiveElement: null
  };

  // =========================================================================
  // Initialization
  // =========================================================================

  function init() {
    // 1. Determine language preference
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'am' || saved === 'en') {
        state.lang = saved;
      }
    } catch (e) {
      /* private browsing or storage disabled */
    }

    // 2. Setup DOM Containers if not already injected
    setupDOM();

    // 3. Initialize Speech Recognition instance if supported
    setupSpeechRecognition();

    // 4. Attach event listeners
    bindEvents();

    // 5. Initial load for Career jobs
    loadJobs();

    // 6. Listen for API backend status changes
    if (root.Voice4AllAPI && typeof root.Voice4AllAPI.onStatusChange === 'function') {
      root.Voice4AllAPI.onStatusChange((isLive) => {
        updateStatusBanner(isLive);
      });
    }

    console.log('[Voice4All] Initialized successfully. Language:', state.lang);
  }

  // =========================================================================
  // DOM Setup & Rendering
  // =========================================================================

  function setupDOM() {
    let launcherContainer = document.getElementById('v4a-launcher-host');
    if (!launcherContainer) {
      launcherContainer = document.createElement('div');
      launcherContainer.id = 'v4a-launcher-host';
      document.body.appendChild(launcherContainer);
    }
    launcherContainer.innerHTML = root.Voice4AllUI.renderLauncher(state.lang);

    let drawerContainer = document.getElementById('v4a-drawer-host');
    if (!drawerContainer) {
      drawerContainer = document.createElement('div');
      drawerContainer.id = 'v4a-drawer-host';
      document.body.appendChild(drawerContainer);
    }
    const isLive = root.Voice4AllAPI ? root.Voice4AllAPI.isBackendAvailable() : false;
    drawerContainer.innerHTML = root.Voice4AllUI.renderDrawerShell(state.lang, isLive);

    // Render contents of panels
    renderAllPanels();
  }

  function renderAllPanels() {
    const tutorPanel = document.getElementById('v4a-panel-tutor');
    if (tutorPanel) tutorPanel.innerHTML = root.Voice4AllUI.renderTutorPanel(state.lang);

    const helpPanel = document.getElementById('v4a-panel-help');
    if (helpPanel) {
      helpPanel.innerHTML = root.Voice4AllUI.renderHelpPanel(state.lang);
      if (state.activeTicket) {
        const ticketContainer = document.getElementById('v4a-ticket-container');
        if (ticketContainer) {
          ticketContainer.innerHTML = root.Voice4AllUI.renderTicketCard(state.activeTicket, state.lang);
        }
      }
    }

    const careerPanel = document.getElementById('v4a-panel-career');
    if (careerPanel) careerPanel.innerHTML = root.Voice4AllUI.renderCareerPanel(state.lang);
  }

  function updateStatusBanner(isLive) {
    const banner = document.getElementById('v4a-status-banner');
    if (!banner) return;

    banner.className = `v4a-status-banner ${isLive ? 'v4a-status-banner--live' : 'v4a-status-banner--demo'}`;
    const icon = isLive ? 'fa-circle-check' : 'fa-flask';
    const text = isLive ? root.Voice4AllUI.t('live_status', state.lang) : root.Voice4AllUI.t('demo_status', state.lang);
    const pill = isLive ? 'LIVE' : 'DEMO';

    banner.innerHTML = `
      <div class="v4a-status-banner-content">
        <i class="fa-solid ${icon}" aria-hidden="true"></i>
        <span>${text}</span>
      </div>
      <span class="v4a-status-pill">${pill}</span>
    `;
  }

  // =========================================================================
  // Drawer Lifecycle & Focus Management (WAI-ARIA Dialog)
  // =========================================================================

  function openDrawer() {
    if (state.drawerOpen) return;

    state.lastActiveElement = document.activeElement;
    state.drawerOpen = true;

    const drawer = document.getElementById('v4a-drawer');
    const backdrop = document.getElementById('v4a-backdrop');
    const launcherBtn = document.getElementById('v4a-launcher-btn');

    if (drawer) drawer.classList.add('v4a-drawer--open');
    if (backdrop) backdrop.classList.add('v4a-backdrop--active');
    if (launcherBtn) launcherBtn.setAttribute('aria-expanded', 'true');

    // Announce to screen reader
    root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_drawer_opened', state.lang));

    // Shift focus to close button or drawer heading for accessibility
    setTimeout(() => {
      const closeBtn = document.getElementById('v4a-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 50);

    // Attach trap focus listener
    document.addEventListener('keydown', handleDrawerKeydown);
  }

  function closeDrawer() {
    if (!state.drawerOpen) return;

    state.drawerOpen = false;

    // Stop ongoing speech recognition or synthesis
    stopListening();
    stopSpeaking();

    const drawer = document.getElementById('v4a-drawer');
    const backdrop = document.getElementById('v4a-backdrop');
    const launcherBtn = document.getElementById('v4a-launcher-btn');

    if (drawer) drawer.classList.remove('v4a-drawer--open');
    if (backdrop) backdrop.classList.remove('v4a-backdrop--active');
    if (launcherBtn) launcherBtn.setAttribute('aria-expanded', 'false');

    // Announce to screen reader
    root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_drawer_closed', state.lang));

    // Restore focus back to launcher
    document.removeEventListener('keydown', handleDrawerKeydown);
    if (state.lastActiveElement && typeof state.lastActiveElement.focus === 'function') {
      state.lastActiveElement.focus();
    } else if (launcherBtn) {
      launcherBtn.focus();
    }
  }

  function handleDrawerKeydown(event) {
    if (!state.drawerOpen) return;

    // ESC closes drawer
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }

    // TAB traps focus inside drawer
    if (event.key === 'Tab') {
      const drawer = document.getElementById('v4a-drawer');
      if (!drawer) return;

      const focusables = drawer.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  // =========================================================================
  // Tab Switching & Keyboard Navigation (WAI-ARIA Tabs)
  // =========================================================================

  const TABS = ['tutor', 'help', 'career'];

  function switchTab(tabName, shouldFocus = true) {
    if (!TABS.includes(tabName)) return;
    state.activeTab = tabName;

    TABS.forEach((name) => {
      const tabEl = document.getElementById(`v4a-tab-${name}`);
      const panelEl = document.getElementById(`v4a-panel-${name}`);
      const isSelected = (name === tabName);

      if (tabEl) {
        tabEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tabEl.setAttribute('tabindex', isSelected ? '0' : '-1');
        if (isSelected && shouldFocus) tabEl.focus();
      }

      if (panelEl) {
        if (isSelected) {
          panelEl.classList.add('v4a-tabpanel--active');
        } else {
          panelEl.classList.remove('v4a-tabpanel--active');
        }
      }
    });

    const tabTitle = root.Voice4AllUI.t(`tab_${tabName}`, state.lang);
    root.Voice4AllUI.announce(`${root.Voice4AllUI.t('announce_tab_switched', state.lang)} ${tabTitle}`);
  }

  function handleTabKeydown(event) {
    const currentTab = event.currentTarget.getAttribute('id').replace('v4a-tab-', '');
    const currentIndex = TABS.indexOf(currentTab);
    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    if (targetIndex >= 0) {
      switchTab(TABS[targetIndex], true);
    }
  }

  // =========================================================================
  // Language Switching (English / Amharic)
  // =========================================================================

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'am') return;
    state.lang = lang;

    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }

    // Re-render UI elements
    setupDOM();

    // Re-activate previously open tab
    switchTab(state.activeTab, false);

    // Re-open drawer if it was open
    if (state.drawerOpen) {
      const drawer = document.getElementById('v4a-drawer');
      const backdrop = document.getElementById('v4a-backdrop');
      const launcherBtn = document.getElementById('v4a-launcher-btn');
      if (drawer) drawer.classList.add('v4a-drawer--open');
      if (backdrop) backdrop.classList.add('v4a-backdrop--active');
      if (launcherBtn) launcherBtn.setAttribute('aria-expanded', 'true');
    }

    // Refresh jobs in new language
    loadJobs();

    // Announce language change
    root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_lang_switched', state.lang));
  }

  // =========================================================================
  // Speech Recognition (Voice Input)
  // =========================================================================

  function setupSpeechRecognition() {
    const SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      state.speechRecognition = null;
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        state.isListening = true;
        updateVoiceButtonState(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputEl = document.getElementById('v4a-tutor-input');
        if (inputEl) {
          inputEl.value = transcript;
          submitTutorMessage(transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('[Voice4All Voice] Speech recognition error:', err.error);
        stopListening();
      };

      recognition.onend = () => {
        state.isListening = false;
        updateVoiceButtonState(false);
      };

      state.speechRecognition = recognition;
    } catch (err) {
      console.warn('[Voice4All Voice] Initialization failed:', err);
      state.speechRecognition = null;
    }
  }

  function toggleVoiceInput() {
    if (!state.speechRecognition) {
      alert(root.Voice4AllUI.t('voice_unsupported', state.lang));
      return;
    }

    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function startListening() {
    if (!state.speechRecognition) return;
    try {
      // Set language according to active preference
      state.speechRecognition.lang = state.lang === 'am' ? 'am-ET' : 'en-US';
      state.speechRecognition.start();
      state.isListening = true;
      updateVoiceButtonState(true);
      root.Voice4AllUI.announce(root.Voice4AllUI.t('voice_listening', state.lang), 'assertive');
    } catch (err) {
      console.warn('[Voice4All Voice] Error starting:', err);
    }
  }

  function stopListening() {
    if (!state.speechRecognition) return;
    try {
      state.speechRecognition.stop();
    } catch (e) {
      /* ignore */
    }
    state.isListening = false;
    updateVoiceButtonState(false);
  }

  function updateVoiceButtonState(listening) {
    const btn = document.getElementById('v4a-voice-toggle-btn');
    const banner = document.getElementById('v4a-voice-status');

    if (btn) {
      btn.classList.toggle('v4a-icon-btn--voice-active', listening);
      btn.setAttribute(
        'aria-label',
        listening ? root.Voice4AllUI.t('voice_btn_stop_aria', state.lang) : root.Voice4AllUI.t('voice_btn_start_aria', state.lang)
      );
    }

    if (banner) {
      banner.classList.toggle('v4a-voice-status--active', listening);
    }
  }

  // =========================================================================
  // Speech Synthesis (TTS Read Aloud)
  // =========================================================================

  function speakText(text) {
    if (!('speechSynthesis' in root)) return;

    stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.lang === 'am' ? 'am-ET' : 'en-US';
      utterance.rate = 1.0;

      utterance.onend = () => {
        state.currentUtterance = null;
      };

      utterance.onerror = () => {
        state.currentUtterance = null;
      };

      state.currentUtterance = utterance;
      root.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Voice4All TTS] Error speaking:', err);
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in root && root.speechSynthesis.speaking) {
      root.speechSynthesis.cancel();
      state.currentUtterance = null;
    }
  }

  // =========================================================================
  // Tutor Logic & Chat Handling
  // =========================================================================

  async function submitTutorMessage(text) {
    const message = (text || '').trim();
    if (!message) return;

    const chatLog = document.getElementById('v4a-chat-log');
    const inputEl = document.getElementById('v4a-tutor-input');
    const sendBtn = document.getElementById('v4a-send-btn');

    if (inputEl) inputEl.value = '';

    // Append user message bubble
    if (chatLog) {
      const userBubble = document.createElement('div');
      userBubble.className = 'v4a-chat-item v4a-chat-item--user';
      userBubble.innerHTML = `
        <div class="v4a-bubble">${root.Voice4AllUI.escapeHTML(message)}</div>
        <div class="v4a-bubble-footer">
          <span>You</span>
        </div>
      `;
      chatLog.appendChild(userBubble);
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Append loading placeholder
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'v4a-chat-item v4a-chat-item--tutor';
    loadingBubble.setAttribute('aria-busy', 'true');
    loadingBubble.innerHTML = `
      <div class="v4a-bubble d-flex align-items-center gap-2">
        <div class="v4a-spinner mb-0" style="width:16px; height:16px;" aria-hidden="true"></div>
        <span>${root.Voice4AllUI.t('tutor_loading', state.lang)}</span>
      </div>
    `;
    if (chatLog) {
      chatLog.appendChild(loadingBubble);
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    if (sendBtn) sendBtn.disabled = true;
    root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_msg_sent', state.lang));

    try {
      const res = await root.Voice4AllAPI.askTutor({
        message,
        language: state.lang,
        context: { page: 'The Future of the VA Industry' }
      });

      if (loadingBubble.parentNode) loadingBubble.remove();

      // Render tutor response
      if (chatLog) {
        const tutorBubble = document.createElement('div');
        tutorBubble.className = 'v4a-chat-item v4a-chat-item--tutor';
        const demoTag = res.isDemo
          ? `<span class="badge text-bg-warning fs-xs mb-1">${root.Voice4AllUI.escapeHTML(res.demoNotice || 'Demo')}</span>`
          : '';

        tutorBubble.innerHTML = `
          ${demoTag}
          <div class="v4a-bubble">${root.Voice4AllUI.escapeHTML(res.reply)}</div>
          <div class="v4a-bubble-footer">
            <span>${root.Voice4AllUI.t('brand_title', state.lang)}</span>
            <button
              type="button"
              class="v4a-tts-btn"
              data-v4a-speech-text="${root.Voice4AllUI.escapeHTML(res.reply)}"
              aria-label="${root.Voice4AllUI.t('listen_btn_aria', state.lang)}"
            >
              <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
              <span>${root.Voice4AllUI.t('listen_btn', state.lang)}</span>
            </button>
          </div>
        `;
        chatLog.appendChild(tutorBubble);
        chatLog.scrollTop = chatLog.scrollHeight;
      }

      root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_tutor_reply', state.lang));

      // Update starter suggestions if provided
      if (Array.isArray(res.suggestions) && res.suggestions.length > 0) {
        updateStarterChips(res.suggestions);
      }
    } catch (err) {
      if (loadingBubble.parentNode) loadingBubble.remove();
      console.error('[Voice4All Tutor] Request failed:', err);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function updateStarterChips(suggestions) {
    const wrap = document.querySelector('.v4a-starters-wrap');
    if (!wrap) return;

    wrap.innerHTML = suggestions.map((s) => `
      <button type="button" class="v4a-starter-chip" data-v4a-prompt="${root.Voice4AllUI.escapeHTML(s)}">
        ${root.Voice4AllUI.escapeHTML(s)}
      </button>
    `).join(' ');
  }

  // =========================================================================
  // Live Help Logic & Support Requests
  // =========================================================================

  async function handleSupportSubmit() {
    const topicEl = document.getElementById('v4a-help-topic');
    const urgencyEl = document.getElementById('v4a-help-urgency');
    const descEl = document.getElementById('v4a-help-desc');
    const modeEl = document.querySelector('input[name="v4a-help-mode"]:checked');
    const submitBtn = document.getElementById('v4a-submit-help-btn');

    if (!descEl || !descEl.value.trim()) {
      alert(root.Voice4AllUI.t('help_desc_placeholder', state.lang));
      if (descEl) descEl.focus();
      return;
    }

    const payload = {
      topic: topicEl ? topicEl.value : 'concept_clarification',
      urgency: urgencyEl ? urgencyEl.value : 'medium',
      preferred_mode: modeEl ? modeEl.value : 'chat',
      message: descEl.value.trim(),
      language: state.lang,
      context: { page: 'The Future of the VA Industry' }
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="v4a-spinner mb-0 me-2" style="width:14px; height:14px;" aria-hidden="true"></div>
        <span>${root.Voice4AllUI.t('submitting_btn', state.lang)}</span>
      `;
    }

    try {
      const res = await root.Voice4AllAPI.submitSupportRequest(payload);
      state.activeTicket = res;

      const ticketContainer = document.getElementById('v4a-ticket-container');
      if (ticketContainer) {
        ticketContainer.innerHTML = root.Voice4AllUI.renderTicketCard(res, state.lang);
      }

      // Reset form
      descEl.value = '';
      root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_help_submitted', state.lang));
    } catch (err) {
      console.error('[Voice4All Help] Support request failed:', err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span>${root.Voice4AllUI.t('submit_help_btn', state.lang)}</span>
        `;
      }
    }
  }

  function cancelActiveTicket() {
    state.activeTicket = null;
    const ticketContainer = document.getElementById('v4a-ticket-container');
    if (ticketContainer) {
      ticketContainer.innerHTML = `
        <div class="v4a-empty-state">
          <i class="fa-regular fa-clipboard v4a-empty-icon" aria-hidden="true"></i>
          <p class="mb-0 fs-sm">${root.Voice4AllUI.t('request_cancelled_msg', state.lang)}</p>
        </div>
      `;
    }
    root.Voice4AllUI.announce(root.Voice4AllUI.t('request_cancelled_msg', state.lang));
  }

  // =========================================================================
  // Career Logic & Accommodations
  // =========================================================================

  async function loadJobs() {
    const listEl = document.getElementById('v4a-job-list');
    if (!listEl) return;

    listEl.innerHTML = `
      <div class="v4a-loading-state" aria-busy="true">
        <div class="v4a-spinner" aria-hidden="true"></div>
        <span>${root.Voice4AllUI.t('loading_jobs', state.lang)}</span>
      </div>
    `;

    try {
      const res = await root.Voice4AllAPI.getJobs({
        query: state.searchQuery,
        filter: state.activeFilter,
        language: state.lang
      });

      if (!res.jobs || res.jobs.length === 0) {
        listEl.innerHTML = `
          <div class="v4a-empty-state">
            <i class="fa-solid fa-magnifying-glass v4a-empty-icon" aria-hidden="true"></i>
            <p class="mb-0 fs-sm">${root.Voice4AllUI.t('no_jobs', state.lang)}</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = res.jobs.map((job) => root.Voice4AllUI.renderJobCard(job, state.lang)).join(' ');
    } catch (err) {
      console.error('[Voice4All Career] Failed to load jobs:', err);
      listEl.innerHTML = `
        <div class="v4a-error-state">
          <i class="fa-solid fa-triangle-exclamation v4a-error-icon" aria-hidden="true"></i>
          <p class="mb-0 fs-sm">${root.Voice4AllUI.t('jobs_error', state.lang)}</p>
        </div>
      `;
    }
  }

  function openAccommodationPanel(jobId, jobTitle) {
    const container = document.getElementById('v4a-acc-container');
    if (!container) return;

    container.innerHTML = root.Voice4AllUI.renderAccommodationPanel(jobId, jobTitle, state.lang);
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const notesInput = document.getElementById('v4a-acc-notes');
    if (notesInput) notesInput.focus();
  }

  function closeAccommodationPanel() {
    const container = document.getElementById('v4a-acc-container');
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  }

  async function handleAccommodationSubmit() {
    const jobId = document.getElementById('v4a-acc-job-id')?.value || 'general';
    const jobTitle = document.getElementById('v4a-acc-job-title')?.value || 'General Position';
    const notes = document.getElementById('v4a-acc-notes')?.value || '';
    const email = document.getElementById('v4a-acc-email')?.value || '';
    const submitBtn = document.getElementById('v4a-acc-submit-btn');

    const checkboxes = document.querySelectorAll('input[name="v4a-acc-types"]:checked');
    const selectedAccommodations = Array.from(checkboxes).map((c) => c.value);

    if (!email.trim()) {
      alert(root.Voice4AllUI.t('acc_email_label', state.lang));
      document.getElementById('v4a-acc-email')?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="v4a-spinner mb-0 me-2" style="width:14px; height:14px;" aria-hidden="true"></div>
        <span>${root.Voice4AllUI.t('acc_submitting', state.lang)}</span>
      `;
    }

    try {
      const res = await root.Voice4AllAPI.submitAccommodationRequest({
        job_id: jobId,
        job_title: jobTitle,
        accommodations: selectedAccommodations,
        details: notes,
        contact_email: email,
        language: state.lang
      });

      const container = document.getElementById('v4a-acc-container');
      if (container) {
        container.innerHTML = `
          <div class="v4a-acc-panel" style="border-color:#10b981; background:#ecfdf5;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <strong class="text-success fs-sm">
                <i class="fa-solid fa-circle-check me-1" aria-hidden="true"></i>
                ${root.Voice4AllUI.t('acc_success_msg', state.lang)} ${root.Voice4AllUI.escapeHTML(res.request_id)}
              </strong>
              <button type="button" class="v4a-btn-close" id="v4a-close-acc-btn" aria-label="Close">
                <i class="fa-solid fa-xmark text-dark" aria-hidden="true"></i>
              </button>
            </div>
            <p class="mb-0 fs-xs text-muted">${root.Voice4AllUI.escapeHTML(res.message)}</p>
          </div>
        `;
      }

      root.Voice4AllUI.announce(root.Voice4AllUI.t('announce_acc_submitted', state.lang));
    } catch (err) {
      console.error('[Voice4All Accommodation] Submission failed:', err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // =========================================================================
  // Global Event Delegation & Bindings
  // =========================================================================

  function bindEvents() {
    // Delegated click handlers
    document.addEventListener('click', (event) => {
      // 1. Open drawer from floating launcher
      const launcher = event.target.closest('#v4a-launcher-btn');
      if (launcher) {
        event.preventDefault();
        openDrawer();
        return;
      }

      // 2. Close drawer
      const closeBtn = event.target.closest('#v4a-close-btn');
      const backdrop = event.target.closest('#v4a-backdrop');
      if (closeBtn || backdrop) {
        event.preventDefault();
        closeDrawer();
        return;
      }

      // 3. Tab switching
      const tab = event.target.closest('.v4a-tab');
      if (tab) {
        event.preventDefault();
        const tabName = tab.getAttribute('id').replace('v4a-tab-', '');
        switchTab(tabName, true);
        return;
      }

      // 4. Language switcher
      const langBtn = event.target.closest('.v4a-lang-btn');
      if (langBtn) {
        event.preventDefault();
        const lang = langBtn.getAttribute('data-v4a-lang');
        setLanguage(lang);
        return;
      }

      // 5. Voice Input Toggle
      const voiceBtn = event.target.closest('#v4a-voice-toggle-btn');
      if (voiceBtn) {
        event.preventDefault();
        toggleVoiceInput();
        return;
      }

      // 6. Starter prompt clicks
      const starter = event.target.closest('.v4a-starter-chip');
      if (starter) {
        event.preventDefault();
        const prompt = starter.getAttribute('data-v4a-prompt');
        submitTutorMessage(prompt);
        return;
      }

      // 7. TTS read aloud button
      const ttsBtn = event.target.closest('.v4a-tts-btn');
      if (ttsBtn) {
        event.preventDefault();
        const text = ttsBtn.getAttribute('data-v4a-speech-text');
        speakText(text);
        return;
      }

      // 8. Career Filter buttons
      const filterBtn = event.target.closest('.v4a-filter-btn');
      if (filterBtn) {
        event.preventDefault();
        document.querySelectorAll('.v4a-filter-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        filterBtn.setAttribute('aria-pressed', 'true');
        state.activeFilter = filterBtn.getAttribute('data-v4a-filter');
        loadJobs();
        return;
      }

      // 9. Career "Request Accommodation" button on job card
      const accBtn = event.target.closest('.v4a-btn-acc');
      if (accBtn) {
        event.preventDefault();
        const jobId = accBtn.getAttribute('data-job-id');
        const jobTitle = accBtn.getAttribute('data-job-title');
        openAccommodationPanel(jobId, jobTitle);
        return;
      }

      // 10. Close Accommodation Panel
      const closeAccBtn = event.target.closest('#v4a-close-acc-btn') || event.target.closest('#v4a-acc-cancel-btn');
      if (closeAccBtn) {
        event.preventDefault();
        closeAccommodationPanel();
        return;
      }

      // 11. Career Apply button
      const applyBtn = event.target.closest('.v4a-btn-apply');
      if (applyBtn) {
        event.preventDefault();
        const title = applyBtn.getAttribute('data-job-title');
        alert(`${root.Voice4AllUI.t('apply_btn', state.lang)}: ${title}\n\n${state.lang === 'am' ? 'የማመልከቻ ቅጹ በአዲስ መስኮት ይከፈታል።' : 'Application workflow opened for inclusive review.'}`);
        return;
      }

      // 12. Cancel active support ticket
      const cancelTicketBtn = event.target.closest('#v4a-cancel-ticket-btn');
      if (cancelTicketBtn) {
        event.preventDefault();
        cancelActiveTicket();
        return;
      }
    });

    // Delegated submit handlers
    document.addEventListener('submit', (event) => {
      // Tutor Form Submit
      if (event.target.id === 'v4a-tutor-form') {
        event.preventDefault();
        const input = document.getElementById('v4a-tutor-input');
        if (input && input.value.trim()) {
          submitTutorMessage(input.value.trim());
        }
        return;
      }

      // Support Help Form Submit
      if (event.target.id === 'v4a-help-form') {
        event.preventDefault();
        handleSupportSubmit();
        return;
      }

      // Accommodation Form Submit
      if (event.target.id === 'v4a-acc-form') {
        event.preventDefault();
        handleAccommodationSubmit();
        return;
      }
    });

    // Tab keyboard navigation listeners
    ['tutor', 'help', 'career'].forEach((name) => {
      const tabEl = document.getElementById(`v4a-tab-${name}`);
      if (tabEl) tabEl.addEventListener('keydown', handleTabKeydown);
    });

    // Job search input debounced handler
    let searchTimer = null;
    document.addEventListener('input', (event) => {
      if (event.target.id === 'v4a-job-search') {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          state.searchQuery = event.target.value.trim();
          loadJobs();
        }, 300);
      }
    });
  }

  // Auto-boot on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for inspection and programmatic testing
  root.Voice4All = {
    state,
    init,
    openDrawer,
    closeDrawer,
    switchTab,
    setLanguage,
    submitTutorMessage,
    handleSupportSubmit,
    handleAccommodationSubmit,
    loadJobs
  };
})(typeof window !== 'undefined' ? window : this);
