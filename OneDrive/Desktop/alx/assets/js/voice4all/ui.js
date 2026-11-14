/**
 * Voice4All — UI Rendering and Accessibility Module (`assets/js/voice4all/ui.js`)
 *
 * Handles:
 *  - English & Amharic i18n dictionaries
 *  - Rendering accessible components for Tutor, Live Help, and Career
 *  - Screen-reader announcements (aria-live polite/assertive)
 *  - Loading, error, and empty states
 *  - Clear Demo UI data indicator labels
 */

((root) => {
  'use strict';

  // =========================================================================
  // i18n Localization Dictionary
  // =========================================================================

  const I18N = {
    en: {
      brand_title: 'Voice4All',
      brand_subtitle: 'Accessible Learning & Career Assistant',
      launcher_text: 'Voice4All',
      launcher_aria: 'Open Voice4All accessible learning assistant',
      close_aria: 'Close Voice4All assistant',
      switch_to_am: 'Switch to Amharic',
      switch_to_en: 'Switch to English',
      lang_label: 'Language',
      
      // Status Banner
      demo_status: 'Demo Mode — Backend Offline',
      demo_status_aria: 'Currently operating in demo mode using sample data because backend is offline',
      live_status: 'Backend Connected',
      
      // Tab Navigation
      tablist_aria: 'Voice4All functional sections',
      tab_tutor: 'Tutor',
      tab_help: 'Live Help',
      tab_career: 'Career',
      
      // Tutor Section
      tutor_title: 'Voice & Text AI Tutor',
      tutor_desc: 'Ask questions or practice concepts from "The Future of the VA Industry".',
      tutor_welcome: 'Hello Amara! I am your Voice4All tutor for this lesson. You can speak or type any question about the virtual assistant profession.',
      starters_heading: 'Quick Practice Questions:',
      starter_1: 'What is a Virtual Assistant?',
      starter_2: 'Summarize key takeaways of this lesson',
      starter_3: 'What skills does a modern VA need?',
      starter_4: 'Give me a quick practice quiz',
      input_placeholder: 'Type your question here...',
      send_btn_aria: 'Send question to tutor',
      voice_btn_start_aria: 'Start voice input (microphone)',
      voice_btn_stop_aria: 'Stop listening',
      voice_listening: 'Listening... Speak clearly into your microphone.',
      voice_unsupported: 'Voice speech recognition is not supported in this browser. Please type your message.',
      listen_btn: 'Listen',
      listen_btn_aria: 'Read tutor response aloud with speech synthesis',
      speaking_label: 'Speaking...',
      stop_speech_btn: 'Stop',
      tutor_loading: 'Tutor is formulating response...',
      tutor_error: 'Unable to reach the tutor service. Switched to demo mode.',
      clear_chat: 'Clear chat history',

      // Live Help Section
      help_title: 'Live Support & Peer Help',
      help_desc: 'Request live assistance from a course mentor, peer coach, or support coordinator.',
      help_topic_label: 'Assistance Topic:',
      help_topic_concept: 'Lesson Concept Clarification',
      help_topic_quiz: 'Quiz or Assignment Assistance',
      help_topic_tech: 'Platform or Technical Issue',
      help_topic_accessibility: 'Accessibility Accommodation Need',
      help_urgency_label: 'Urgency Level:',
      urgency_low: 'Low (Within 24 hours)',
      urgency_medium: 'Normal (Active session)',
      urgency_high: 'High (Completely blocked)',
      help_mode_label: 'Preferred Assistance Channel:',
      mode_chat: 'Chat Message',
      mode_voice: 'Voice Call',
      mode_screen: 'Screen Share',
      // Honest screen sharing notice:
      screen_notice_title: 'Screen Sharing Safety & Availability Notice:',
      screen_notice_text: 'Screen sharing requests are placed in an agent queue. No screen data is transmitted until an authorized mentor accepts and you explicitly grant permission.',
      help_desc_label: 'Describe what you need help with:',
      help_desc_placeholder: 'Briefly describe your question, context, or where you are stuck...',
      submit_help_btn: 'Submit Support Request',
      submitting_btn: 'Submitting Request...',
      active_ticket_title: 'Your Active Request',
      ticket_id_prefix: 'Reference ID:',
      ticket_status_prefix: 'Status:',
      ticket_status_queued: 'Queued — Waiting for mentor',
      ticket_wait_prefix: 'Estimated wait:',
      cancel_request_btn: 'Cancel Request',
      request_cancelled_msg: 'Support request was cancelled.',
      no_active_tickets: 'No pending support requests. Submit the form above if you need assistance.',

      // Career Section
      career_title: 'Accessible Career Opportunities',
      career_desc: 'Explore inclusive virtual assistant positions and request workplace accommodations.',
      search_placeholder: 'Search jobs by role or skill...',
      filter_all: 'All',
      filter_remote: 'Remote',
      filter_fulltime: 'Full-Time',
      filter_parttime: 'Part-Time',
      loading_jobs: 'Loading available job listings...',
      jobs_error: 'Failed to load jobs from server. Showing verified demo opportunities.',
      no_jobs: 'No job openings found matching your criteria.',
      apply_btn: 'Apply',
      request_acc_btn: 'Request Accommodation',
      tag_accessible: 'Accessible Workplace',
      
      // Accommodation Panel
      acc_panel_title: 'Workplace Accommodation Request',
      acc_panel_desc: 'Submit your workplace and assessment accessibility needs directly to the inclusive hiring team.',
      acc_role_label: 'Selected Role:',
      acc_types_label: 'Select Required Accommodations:',
      acc_type_screen_reader: 'Screen reader optimization & verified markup',
      acc_type_voice_tools: 'Speech-to-text / voice recognition software allowance',
      acc_type_extended_time: 'Extended time for assessments and skill reviews',
      acc_type_captions: 'Live captions & transcripts for all team calls',
      acc_type_flexible_hours: 'Flexible / asynchronous core working hours',
      acc_notes_label: 'Additional Specific Needs or Assistive Tech Used:',
      acc_notes_placeholder: 'E.g. NVDA, JAWS, ZoomText, high-contrast setup, ergonomic peripherals...',
      acc_email_label: 'Contact Email for Coordination:',
      acc_submit_btn: 'Submit Accommodation Request',
      acc_submitting: 'Submitting Accommodation Request...',
      acc_success_msg: 'Accommodation request submitted! Reference:',
      acc_cancel_btn: 'Close',

      // Announcements
      announce_drawer_opened: 'Voice4All assistant panel opened.',
      announce_drawer_closed: 'Voice4All assistant panel closed.',
      announce_lang_switched: 'Language switched to English.',
      announce_tab_switched: 'Switched to tab:',
      announce_msg_sent: 'Message sent to tutor. Awaiting response.',
      announce_tutor_reply: 'Tutor replied.',
      announce_help_submitted: 'Support request submitted successfully.',
      announce_acc_submitted: 'Workplace accommodation request submitted successfully.'
    },

    am: {
      brand_title: 'ድምጽለሁሉም (Voice4All)',
      brand_subtitle: 'ተደራሽ የትምህርት እና የሥራ ረዳት',
      launcher_text: 'ድምጽለሁሉም',
      launcher_aria: 'የVoice4All ተደራሽ የትምህርት ረዳትን ይክፈቱ',
      close_aria: 'የVoice4All ረዳትን ዝጋ',
      switch_to_am: 'ወደ አማርኛ ቀይር',
      switch_to_en: 'ወደ እንግሊዝኛ ቀይር',
      lang_label: 'ቋንቋ',

      // Status Banner
      demo_status: 'የሙከራ ሁነታ — የጀርባ ሰርቨር አልተገኘም',
      demo_status_aria: 'የጀርባ ሰርቨር ባለመገኘቱ በሙከራ ናሙና መረጃዎች እየሰራ ይገኛል',
      live_status: 'ከዋናው ሰርቨር ጋር ተገናኝቷል',

      // Tab Navigation
      tablist_aria: 'የVoice4All ክፍሎች',
      tab_tutor: 'አስተማሪ',
      tab_help: 'ቀጥታ እርዳታ',
      tab_career: 'የሥራ ዕድል',

      // Tutor Section
      tutor_title: 'የድምጽ እና የጽሑፍ AI አስተማሪ',
      tutor_desc: 'ስለ "The Future of the VA Industry" ትምህርት ጥያቄዎችን ይጠይቁ ወይም ይለማመዱ።',
      tutor_welcome: 'ሰላም አማራ! እኔ ለዚህ ትምህርት የVoice4All አስተማሪዎ ነኝ። ስለ ቨርቹዋል ረዳት ሙያ ማንኛውንም ጥያቄ በድምጽ ወይም በጽሑፍ መጠየቅ ይችላሉ።',
      starters_heading: 'ፈጣን የልምምድ ጥያቄዎች፡',
      starter_1: 'ቨርቹዋል ረዳት ምንድን ነው?',
      starter_2: 'የዚህን ትምህርት ዋና ዋና ነጥቦች አጠቃልል',
      starter_3: 'አንድ ዘመናዊ ቪኤ ምን ዓይነት ክህሎቶች ያስፈልጉታል?',
      starter_4: 'የልምምድ ጥያቄዎችን ስጠኝ',
      input_placeholder: 'ጥያቄዎን እዚህ ይጻፉ...',
      send_btn_aria: 'ጥያቄውን ለአስተማሪው ላክ',
      voice_btn_start_aria: 'የድምጽ ግብዓት ጀምር (ማይክሮፎን)',
      voice_btn_stop_aria: 'ማዳመጥ አቁም',
      voice_listening: 'ድምጽ በማዳመጥ ላይ... እባክዎ ጥያቄዎን ይናገሩ።',
      voice_unsupported: 'በዚህ አሳሽ የድምጽ ቅበላ አይደገፍም። እባክዎ ጥያቄዎን ይተይቡ።',
      listen_btn: 'አዳምጥ',
      listen_btn_aria: 'የአስተማሪውን መልስ በድምጽ አዳምጥ',
      speaking_label: 'በመናገር ላይ...',
      stop_speech_btn: 'አቁም',
      tutor_loading: 'አስተማሪው መልስ በማዘጋጀት ላይ ነው...',
      tutor_error: 'ከአስተማሪው ሰርቨር ጋር መገናኘት አልተቻለም። ወደ ሙከራ ሁነታ ተቀይሯል።',
      clear_chat: 'የውይይት ታሪክን አጽዳ',

      // Live Help Section
      help_title: 'የቀጥታ እርዳታ እና የአቻ ድጋፍ',
      help_desc: 'ከትምህርት አማካሪዎች፣ ከአቻዎች ወይም ከቴክኒክ ድጋፍ ቡድን ጋር ይገናኙ።',
      help_topic_label: 'የእርዳታው ዘርፍ፡',
      help_topic_concept: 'የትምህርት ይዘት ማብራሪያ',
      help_topic_quiz: 'የፈተና ወይም የልምምድ እርዳታ',
      help_topic_tech: 'የሲስተም ወይም የቴክኒክ ችግር',
      help_topic_accessibility: 'የተደራሽነት ድጋፍ ፍላጎት',
      help_urgency_label: 'የአስቸኳይነት ደረጃ፡',
      urgency_low: 'ዝቅተኛ (በ24 ሰዓት ውስጥ)',
      urgency_medium: 'መካከለኛ (በአሁኑ ክፍለ-ጊዜ)',
      urgency_high: 'ከፍተኛ (ሙሉ በሙሉ ተስተጓጉያለሁ)',
      help_mode_label: 'የሚመርጡት የግንኙነት መንገድ፡',
      mode_chat: 'የጽሑፍ ውይይት',
      mode_voice: 'የድምጽ ጥሪ',
      mode_screen: 'ስክሪን ማጋራት',
      // Honest screen sharing notice in Amharic:
      screen_notice_title: 'የስክሪን ማጋራት ደህንነት እና የግንኙነት ማሳሰቢያ፡',
      screen_notice_text: 'የስክሪን ማጋራት ጥያቄዎች በተራ ዝርዝር ውስጥ ይቀመጣሉ። ፈቃድ ያለው ባለሙያ ጥያቄውን ተቀብሎ እርስዎ እስካልፈቀዱ ድረስ ምንም ዓይነት የስክሪን መረጃ አይጋራም።',
      help_desc_label: 'ምን ዓይነት እርዳታ እንደሚፈልጉ ይግለጹ፡',
      help_desc_placeholder: 'የት ላይ እንደተቸገሩ እና የሚያስፈልገዎትን እገዛ በአጭሩ ያብራሩ...',
      submit_help_btn: 'የእርዳታ ጥያቄ አቅርብ',
      submitting_btn: 'ጥያቄ በማቅረብ ላይ...',
      active_ticket_title: 'የአሁኑ ንቁ ጥያቄዎ',
      ticket_id_prefix: 'መለያ ቁጥር፡',
      ticket_status_prefix: 'ሁኔታ፡',
      ticket_status_queued: 'በተራ ላይ — ባለሙያ በመጠበቅ ላይ',
      ticket_wait_prefix: 'ግምታዊ የጥበቃ ጊዜ፡',
      cancel_request_btn: 'ጥያቄውን ሰርዝ',
      request_cancelled_msg: 'የእርዳታ ጥያቄው ተሰርዟል።',
      no_active_tickets: 'ምንም ንቁ የእርዳታ ጥያቄ የለም። እርዳታ ከፈለጉ ከላይ ያለውን ቅጽ ይሙሉ።',

      // Career Section
      career_title: 'አካታች የሥራ ዕድሎች',
      career_desc: 'ተደራሽ የሆኑ የቨርቹዋል ረዳት የሥራ መደቦችን ይመልከቱ እና የሥራ ቦታ ማመቻቸትን ይጠይቁ።',
      search_placeholder: 'ሥራዎችን በስም ወይም በክህሎት ይፈልጉ...',
      filter_all: 'ሁሉም',
      filter_remote: 'የርቀት ሥራ',
      filter_fulltime: 'ሙሉ ጊዜ',
      filter_parttime: 'የትርፍ ጊዜ',
      loading_jobs: 'የሥራ ማስታወቂያዎች በመጫን ላይ...',
      jobs_error: 'ከሰርቨሩ ሥራዎችን ማምጣት አልተቻለም። የተረጋገጡ የሙከራ ዕድሎች እየታዩ ነው።',
      no_jobs: 'ከተመረጠው መስፈርት ጋር የሚስማማ የሥራ ዕድል አልተገኘም።',
      apply_btn: 'አመልክት',
      request_acc_btn: 'ማመቻቸት ጠይቅ',
      tag_accessible: 'ተደራሽ የሥራ ቦታ',

      // Accommodation Panel
      acc_panel_title: 'የሥራ ቦታ ማመቻቸት ጥያቄ',
      acc_panel_desc: 'የሥራ ቦታ እና የፈተና ተደራሽነት ፍላጎቶችዎን በቀጥታ ለአካታች ቅጥር ቡድናችን ያቅርቡ።',
      acc_role_label: 'የተመረጠው የሥራ መደብ፡',
      acc_types_label: 'የሚያስፈልጉ የማመቻቸት አይነቶች፡',
      acc_type_screen_reader: 'የስክሪን አንባቢ ተኳኋኝነት እና ደረጃውን የጠበቀ ኮድ',
      acc_type_voice_tools: 'የንግግር-ወደ-ጽሑፍ / የድምጽ ትዕዛዝ መሣሪያዎች አጠቃቀም',
      acc_type_extended_time: 'ተጨማሪ የፈተና እና የግምገማ ጊዜ',
      acc_type_captions: 'በስብሰባዎች ላይ የጽሑፍ ንዑስ ርዕሶች እና ቅጂዎች',
      acc_type_flexible_hours: 'ተለዋዋጭ ወይም ምቹ የሥራ ሰዓታት',
      acc_notes_label: 'ተጨማሪ ዝርዝር ፍላጎቶች ወይም የሚጠቀሙት አጋዥ ቴክኖሎጂ፡',
      acc_notes_placeholder: 'ምሳሌ፡ NVDA፣ JAWS፣ ZoomText፣ ልዩ የኮምፒውተር መሣሪያዎች...',
      acc_email_label: 'ለግንኙነት የሚያገለግል ኢሜይል፡',
      acc_submit_btn: 'የማመቻቸት ጥያቄ አቅርብ',
      acc_submitting: 'ጥያቄው እየቀረበ ነው...',
      acc_success_msg: 'የማመቻቸት ጥያቄዎ በተሳካ ሁኔታ ቀርቧል! መለያ ቁጥር፡',
      acc_cancel_btn: 'ዝጋ',

      // Announcements
      announce_drawer_opened: 'የVoice4All ረዳት መስኮት ተከፍቷል።',
      announce_drawer_closed: 'የVoice4All ረዳት መስኮት ተዘግቷል።',
      announce_lang_switched: 'ቋንቋ ወደ አማርኛ ተቀይሯል።',
      announce_tab_switched: 'ወደዚህ ክፍል ተቀይሯል፡',
      announce_msg_sent: 'ጥያቄው ለአስተማሪው ተልኳል። ምላሽ በመጠበቅ ላይ።',
      announce_tutor_reply: 'አስተማሪው ምላሽ ሰጥቷል።',
      announce_help_submitted: 'የእርዳታ ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል።',
      announce_acc_submitted: 'የሥራ ቦታ ማመቻቸት ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል።'
    }
  };

  /**
   * Safe string getter with fallback
   */
  function t(key, lang = 'en') {
    const dict = I18N[lang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  /**
   * Helper to escape HTML characters
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Screen reader announcer utility
   */
  function announce(message, priority = 'polite') {
    let region = document.getElementById('v4a-live-announcer');
    if (!region) {
      region = document.createElement('div');
      region.id = 'v4a-live-announcer';
      region.className = 'v4a-sr-only';
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      document.body.appendChild(region);
    }
    // Update live region text with slight delay to ensure screen readers register
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }

  // =========================================================================
  // UI Builder Functions
  // =========================================================================

  const Voice4AllUI = {
    t,
    escapeHTML,
    announce,

    /**
     * Render the floating launcher button HTML
     */
    renderLauncher(lang = 'en') {
      return `
        <button
          type="button"
          id="v4a-launcher-btn"
          class="v4a-launcher"
          aria-haspopup="dialog"
          aria-controls="v4a-drawer"
          aria-expanded="false"
          aria-label="${t('launcher_aria', lang)}"
        >
          <span class="v4a-launcher-icon-wrap" aria-hidden="true">
            <i class="fa-solid fa-wand-magic-sparkles v4a-launcher-icon"></i>
            <span class="v4a-launcher-badge-dot"></span>
          </span>
          <span class="v4a-launcher-text">${t('launcher_text', lang)}</span>
        </button>
      `;
    },

    /**
     * Render the side drawer structure
     */
    renderDrawerShell(lang = 'en', isBackendAvailable = false) {
      const isAm = (lang === 'am');
      return `
        <div id="v4a-backdrop" class="v4a-backdrop" aria-hidden="true"></div>
        <aside
          id="v4a-drawer"
          class="v4a-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="v4a-drawer-heading"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="v4a-drawer-header">
            <div class="v4a-drawer-brand">
              <div class="v4a-brand-icon" aria-hidden="true">
                <i class="fa-solid fa-universal-access"></i>
              </div>
              <div>
                <h2 id="v4a-drawer-heading" class="v4a-brand-title">${t('brand_title', lang)}</h2>
                <p class="v4a-brand-tagline">${t('brand_subtitle', lang)}</p>
              </div>
            </div>

            <div class="v4a-header-controls">
              <!-- Language Switcher -->
              <div class="v4a-lang-group" role="group" aria-label="${t('lang_label', lang)}">
                <button
                  type="button"
                  class="v4a-lang-btn"
                  data-v4a-lang="en"
                  aria-pressed="${!isAm}"
                  aria-label="${t('switch_to_en', lang)}"
                >EN</button>
                <button
                  type="button"
                  class="v4a-lang-btn"
                  data-v4a-lang="am"
                  aria-pressed="${isAm}"
                  aria-label="${t('switch_to_am', lang)}"
                >አማ</button>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                id="v4a-close-btn"
                class="v4a-btn-close"
                aria-label="${t('close_aria', lang)}"
              >
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <!-- Backend / Demo Status Banner -->
          <div
            id="v4a-status-banner"
            class="v4a-status-banner ${isBackendAvailable ? 'v4a-status-banner--live' : 'v4a-status-banner--demo'}"
            role="status"
            aria-live="polite"
          >
            <div class="v4a-status-banner-content">
              <i class="fa-solid ${isBackendAvailable ? 'fa-circle-check' : 'fa-flask'}" aria-hidden="true"></i>
              <span>${isBackendAvailable ? t('live_status', lang) : t('demo_status', lang)}</span>
            </div>
            <span class="v4a-status-pill">${isBackendAvailable ? 'LIVE' : 'DEMO'}</span>
          </div>

          <!-- Accessible Tablist -->
          <div class="v4a-tablist" role="tablist" aria-label="${t('tablist_aria', lang)}">
            <button
              type="button"
              id="v4a-tab-tutor"
              class="v4a-tab"
              role="tab"
              aria-selected="true"
              aria-controls="v4a-panel-tutor"
              tabindex="0"
            >
              <i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>
              <span>${t('tab_tutor', lang)}</span>
            </button>
            <button
              type="button"
              id="v4a-tab-help"
              class="v4a-tab"
              role="tab"
              aria-selected="false"
              aria-controls="v4a-panel-help"
              tabindex="-1"
            >
              <i class="fa-solid fa-headset" aria-hidden="true"></i>
              <span>${t('tab_help', lang)}</span>
            </button>
            <button
              type="button"
              id="v4a-tab-career"
              class="v4a-tab"
              role="tab"
              aria-selected="false"
              aria-controls="v4a-panel-career"
              tabindex="-1"
            >
              <i class="fa-solid fa-briefcase" aria-hidden="true"></i>
              <span>${t('tab_career', lang)}</span>
            </button>
          </div>

          <!-- Panels Container -->
          <div
            id="v4a-panel-tutor"
            class="v4a-tabpanel v4a-tabpanel--active"
            role="tabpanel"
            aria-labelledby="v4a-tab-tutor"
            tabindex="0"
          ></div>

          <div
            id="v4a-panel-help"
            class="v4a-tabpanel"
            role="tabpanel"
            aria-labelledby="v4a-tab-help"
            tabindex="0"
          ></div>

          <div
            id="v4a-panel-career"
            class="v4a-tabpanel"
            role="tabpanel"
            aria-labelledby="v4a-tab-career"
            tabindex="0"
          ></div>
        </aside>
      `;
    },

    /**
     * Render the Tutor Tab Content
     */
    renderTutorPanel(lang = 'en') {
      return `
        <div class="v4a-section-header">
          <h3 class="v4a-section-title">${t('tutor_title', lang)}</h3>
          <p class="v4a-section-desc">${t('tutor_desc', lang)}</p>
        </div>

        <div class="v4a-tutor-container">
          <!-- Chat Log -->
          <div
            id="v4a-chat-log"
            class="v4a-chat-log"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions"
          >
            <!-- Initial Welcome Message from Tutor -->
            <div class="v4a-chat-item v4a-chat-item--tutor">
              <div class="v4a-bubble">
                ${t('tutor_welcome', lang)}
              </div>
              <div class="v4a-bubble-footer">
                <span>${t('brand_title', lang)}</span>
                <button
                  type="button"
                  class="v4a-tts-btn"
                  data-v4a-speech-text="${escapeHTML(t('tutor_welcome', lang))}"
                  aria-label="${t('listen_btn_aria', lang)}"
                >
                  <i class="fa-solid fa-volume-high" aria-hidden="true"></i>
                  <span>${t('listen_btn', lang)}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Suggested Starter Questions -->
          <div class="v4a-starters-section">
            <span class="v4a-starters-label">${t('starters_heading', lang)}</span>
            <div class="v4a-starters-wrap" role="group" aria-label="${t('starters_heading', lang)}">
              <button type="button" class="v4a-starter-chip" data-v4a-prompt="${escapeHTML(t('starter_1', lang))}">${t('starter_1', lang)}</button>
              <button type="button" class="v4a-starter-chip" data-v4a-prompt="${escapeHTML(t('starter_2', lang))}">${t('starter_2', lang)}</button>
              <button type="button" class="v4a-starter-chip" data-v4a-prompt="${escapeHTML(t('starter_3', lang))}">${t('starter_3', lang)}</button>
              <button type="button" class="v4a-starter-chip" data-v4a-prompt="${escapeHTML(t('starter_4', lang))}">${t('starter_4', lang)}</button>
            </div>
          </div>

          <!-- Active Voice Recording Banner -->
          <div id="v4a-voice-status" class="v4a-voice-status" role="status" aria-live="assertive">
            <span class="v4a-voice-pulse-dot" aria-hidden="true"></span>
            <span id="v4a-voice-status-text">${t('voice_listening', lang)}</span>
          </div>

          <!-- Input Controls Form -->
          <form id="v4a-tutor-form" class="v4a-input-form" onsubmit="return false;">
            <div class="v4a-input-row">
              <button
                type="button"
                id="v4a-voice-toggle-btn"
                class="v4a-icon-btn v4a-icon-btn--voice"
                aria-label="${t('voice_btn_start_aria', lang)}"
                title="${t('voice_btn_start_aria', lang)}"
              >
                <i class="fa-solid fa-microphone" aria-hidden="true"></i>
              </button>

              <input
                type="text"
                id="v4a-tutor-input"
                class="v4a-text-input"
                placeholder="${t('input_placeholder', lang)}"
                autocomplete="off"
                aria-label="${t('input_placeholder', lang)}"
              />

              <button
                type="submit"
                id="v4a-send-btn"
                class="v4a-icon-btn v4a-icon-btn--primary"
                aria-label="${t('send_btn_aria', lang)}"
              >
                <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </div>
      `;
    },

    /**
     * Render the Live Help Tab Content
     */
    renderHelpPanel(lang = 'en') {
      return `
        <div class="v4a-section-header">
          <h3 class="v4a-section-title">${t('help_title', lang)}</h3>
          <p class="v4a-section-desc">${t('help_desc', lang)}</p>
        </div>

        <form id="v4a-help-form" class="v4a-help-form" onsubmit="return false;">
          <!-- Topic Selection -->
          <div class="v4a-form-group">
            <label for="v4a-help-topic" class="v4a-label">${t('help_topic_label', lang)}</label>
            <select id="v4a-help-topic" class="v4a-select" required>
              <option value="concept_clarification">${t('help_topic_concept', lang)}</option>
              <option value="assignment_help">${t('help_topic_quiz', lang)}</option>
              <option value="tech_issue">${t('help_topic_tech', lang)}</option>
              <option value="accessibility_support">${t('help_topic_accessibility', lang)}</option>
            </select>
          </div>

          <!-- Urgency Selection -->
          <div class="v4a-form-group">
            <label for="v4a-help-urgency" class="v4a-label">${t('help_urgency_label', lang)}</label>
            <select id="v4a-help-urgency" class="v4a-select">
              <option value="medium">${t('urgency_medium', lang)}</option>
              <option value="low">${t('urgency_low', lang)}</option>
              <option value="high">${t('urgency_high', lang)}</option>
            </select>
          </div>

          <!-- Preferred Assistance Channel -->
          <div class="v4a-form-group">
            <span class="v4a-label" id="v4a-mode-group-label">${t('help_mode_label', lang)}</span>
            <div class="v4a-radio-grid" role="radiogroup" aria-labelledby="v4a-mode-group-label">
              <label class="v4a-radio-card">
                <input type="radio" name="v4a-help-mode" value="chat" checked />
                <i class="fa-solid fa-comments v4a-radio-card-icon" aria-hidden="true"></i>
                <span class="v4a-radio-card-text">${t('mode_chat', lang)}</span>
              </label>

              <label class="v4a-radio-card">
                <input type="radio" name="v4a-help-mode" value="voice" />
                <i class="fa-solid fa-phone v4a-radio-card-icon" aria-hidden="true"></i>
                <span class="v4a-radio-card-text">${t('mode_voice', lang)}</span>
              </label>

              <label class="v4a-radio-card">
                <input type="radio" name="v4a-help-mode" value="screen_share" />
                <i class="fa-solid fa-desktop v4a-radio-card-icon" aria-hidden="true"></i>
                <span class="v4a-radio-card-text">${t('mode_screen', lang)}</span>
              </label>
            </div>
          </div>

          <!-- Honest Screen Share Notice -->
          <div class="v4a-notice-box" role="note">
            <i class="fa-solid fa-circle-info v4a-notice-box-icon" aria-hidden="true"></i>
            <div>
              <strong>${t('screen_notice_title', lang)}</strong>
              <div>${t('screen_notice_text', lang)}</div>
            </div>
          </div>

          <!-- Help Description -->
          <div class="v4a-form-group">
            <label for="v4a-help-desc" class="v4a-label">${t('help_desc_label', lang)}</label>
            <textarea
              id="v4a-help-desc"
              class="v4a-textarea"
              placeholder="${t('help_desc_placeholder', lang)}"
              required
            ></textarea>
          </div>

          <button type="submit" id="v4a-submit-help-btn" class="v4a-btn v4a-btn--primary">
            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
            <span>${t('submit_help_btn', lang)}</span>
          </button>
        </form>

        <!-- Active Request Status Container -->
        <div id="v4a-ticket-container" class="mt-3">
          <div class="v4a-empty-state">
            <i class="fa-regular fa-clipboard v4a-empty-icon" aria-hidden="true"></i>
            <p class="mb-0 fs-sm">${t('no_active_tickets', lang)}</p>
          </div>
        </div>
      `;
    },

    /**
     * Render the Career Tab Content
     */
    renderCareerPanel(lang = 'en') {
      return `
        <div class="v4a-section-header">
          <h3 class="v4a-section-title">${t('career_title', lang)}</h3>
          <p class="v4a-section-desc">${t('career_desc', lang)}</p>
        </div>

        <div class="v4a-career-controls">
          <!-- Search input -->
          <input
            type="search"
            id="v4a-job-search"
            class="v4a-text-input"
            placeholder="${t('search_placeholder', lang)}"
            aria-label="${t('search_placeholder', lang)}"
          />

          <!-- Filter buttons -->
          <div class="v4a-filter-row" role="group" aria-label="Job filters">
            <button type="button" class="v4a-filter-btn" data-v4a-filter="all" aria-pressed="true">${t('filter_all', lang)}</button>
            <button type="button" class="v4a-filter-btn" data-v4a-filter="remote" aria-pressed="false">${t('filter_remote', lang)}</button>
            <button type="button" class="v4a-filter-btn" data-v4a-filter="fulltime" aria-pressed="false">${t('filter_fulltime', lang)}</button>
            <button type="button" class="v4a-filter-btn" data-v4a-filter="parttime" aria-pressed="false">${t('filter_parttime', lang)}</button>
          </div>
        </div>

        <!-- Inline Accommodation Request Panel Container -->
        <div id="v4a-acc-container" style="display: none;"></div>

        <!-- Job Listings Stream -->
        <div id="v4a-job-list" class="v4a-job-list" role="region" aria-live="polite">
          <div class="v4a-loading-state">
            <div class="v4a-spinner" aria-hidden="true"></div>
            <span>${t('loading_jobs', lang)}</span>
          </div>
        </div>
      `;
    },

    /**
     * Render Single Job Card
     */
    renderJobCard(job, lang = 'en') {
      const tagsHtml = (job.tags || []).map((tag) => {
        const isAcc = tag.toLowerCase().includes('screen') || tag.toLowerCase().includes('ስክሪን') || tag.toLowerCase().includes('access');
        return `<span class="v4a-tag ${isAcc ? 'v4a-tag--accessible' : ''}">${escapeHTML(tag)}</span>`;
      }).join(' ');

      return `
        <article class="v4a-job-card" data-job-id="${escapeHTML(job.id)}">
          <h4 class="v4a-job-title">${escapeHTML(job.title)}</h4>
          <div class="v4a-job-company">
            <i class="fa-solid fa-building me-1" aria-hidden="true"></i>
            <span>${escapeHTML(job.company)}</span> &bull; 
            <span>${escapeHTML(job.location)}</span>
          </div>

          <div class="v4a-job-tags">
            <span class="v4a-tag">
              <i class="fa-solid fa-clock me-1" aria-hidden="true"></i>
              ${escapeHTML(job.type_label || job.type)}
            </span>
            ${tagsHtml}
          </div>

          <p class="v4a-job-desc">${escapeHTML(job.description)}</p>

          <div class="v4a-job-actions">
            <button
              type="button"
              class="v4a-btn v4a-btn--primary v4a-btn-apply"
              data-job-id="${escapeHTML(job.id)}"
              data-job-title="${escapeHTML(job.title)}"
            >
              <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
              <span>${t('apply_btn', lang)}</span>
            </button>

            <button
              type="button"
              class="v4a-btn v4a-btn--outline v4a-btn-acc"
              data-job-id="${escapeHTML(job.id)}"
              data-job-title="${escapeHTML(job.title)}"
            >
              <i class="fa-solid fa-universal-access" aria-hidden="true"></i>
              <span>${t('request_acc_btn', lang)}</span>
            </button>
          </div>
        </article>
      `;
    },

    /**
     * Render Accommodation Request Panel
     */
    renderAccommodationPanel(jobId, jobTitle, lang = 'en') {
      return `
        <div class="v4a-acc-panel" role="dialog" aria-labelledby="v4a-acc-panel-heading">
          <div class="v4a-acc-header">
            <h4 id="v4a-acc-panel-heading" class="v4a-acc-title">
              <i class="fa-solid fa-universal-access me-1 text-primary" aria-hidden="true"></i>
              ${t('acc_panel_title', lang)}
            </h4>
            <button type="button" class="v4a-btn-close" id="v4a-close-acc-btn" aria-label="${t('acc_cancel_btn', lang)}">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>

          <p class="v4a-section-desc mb-2">${t('acc_panel_desc', lang)}</p>

          <div class="mb-2 fs-sm">
            <strong>${t('acc_role_label', lang)}</strong> <span class="text-primary fw-semibold">${escapeHTML(jobTitle || 'General Application')}</span>
          </div>

          <form id="v4a-acc-form" onsubmit="return false;">
            <input type="hidden" id="v4a-acc-job-id" value="${escapeHTML(jobId || 'general')}" />
            <input type="hidden" id="v4a-acc-job-title" value="${escapeHTML(jobTitle || '')}" />

            <div class="v4a-form-group mb-2">
              <span class="v4a-label">${t('acc_types_label', lang)}</span>
              <div class="v4a-checkbox-list">
                <label class="v4a-checkbox-label">
                  <input type="checkbox" name="v4a-acc-types" value="screen_reader" checked />
                  <span>${t('acc_type_screen_reader', lang)}</span>
                </label>
                <label class="v4a-checkbox-label">
                  <input type="checkbox" name="v4a-acc-types" value="voice_tools" />
                  <span>${t('acc_type_voice_tools', lang)}</span>
                </label>
                <label class="v4a-checkbox-label">
                  <input type="checkbox" name="v4a-acc-types" value="extended_time" />
                  <span>${t('acc_type_extended_time', lang)}</span>
                </label>
                <label class="v4a-checkbox-label">
                  <input type="checkbox" name="v4a-acc-types" value="captions" />
                  <span>${t('acc_type_captions', lang)}</span>
                </label>
                <label class="v4a-checkbox-label">
                  <input type="checkbox" name="v4a-acc-types" value="flexible_hours" />
                  <span>${t('acc_type_flexible_hours', lang)}</span>
                </label>
              </div>
            </div>

            <div class="v4a-form-group mb-2">
              <label for="v4a-acc-notes" class="v4a-label">${t('acc_notes_label', lang)}</label>
              <textarea
                id="v4a-acc-notes"
                class="v4a-textarea"
                placeholder="${t('acc_notes_placeholder', lang)}"
                rows="2"
              ></textarea>
            </div>

            <div class="v4a-form-group mb-3">
              <label for="v4a-acc-email" class="v4a-label">${t('acc_email_label', lang)}</label>
              <input
                type="email"
                id="v4a-acc-email"
                class="v4a-text-input"
                placeholder="amara.nwosu@example.com"
                required
              />
            </div>

            <div class="d-flex gap-2">
              <button type="submit" id="v4a-acc-submit-btn" class="v4a-btn v4a-btn--primary">
                <i class="fa-solid fa-check" aria-hidden="true"></i>
                <span>${t('acc_submit_btn', lang)}</span>
              </button>
              <button type="button" id="v4a-acc-cancel-btn" class="v4a-btn v4a-btn--outline">
                <span>${t('acc_cancel_btn', lang)}</span>
              </button>
            </div>
          </form>
        </div>
      `;
    },

    /**
     * Render Active Ticket Status Card
     */
    renderTicketCard(ticket, lang = 'en') {
      const isQueued = ticket.status === 'queued';
      const statusText = isQueued ? t('ticket_status_queued', lang) : ticket.status;

      return `
        <div class="v4a-ticket-card" role="region" aria-label="${t('active_ticket_title', lang)}">
          <div class="v4a-ticket-header">
            <span class="v4a-ticket-id">${t('ticket_id_prefix', lang)} ${escapeHTML(ticket.request_id)}</span>
            <span class="v4a-ticket-status-pill">${escapeHTML(statusText)}</span>
          </div>

          <div class="v4a-ticket-body">
            <div><strong>${t('ticket_wait_prefix', lang)}</strong> ~${ticket.estimated_wait_minutes || 2} min</div>
            <div class="mt-1">${escapeHTML(ticket.message || '')}</div>
          </div>

          <button type="button" id="v4a-cancel-ticket-btn" class="v4a-btn v4a-btn--danger">
            <i class="fa-solid fa-ban" aria-hidden="true"></i>
            <span>${t('cancel_request_btn', lang)}</span>
          </button>
        </div>
      `;
    }
  };

  root.Voice4AllUI = Voice4AllUI;
})(typeof window !== 'undefined' ? window : this);
