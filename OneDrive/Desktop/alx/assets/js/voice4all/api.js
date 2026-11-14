/**
 * Voice4All — API Client Module (`assets/js/voice4all/api.js`)
 * 
 * Communicates with agreed backend endpoints:
 *   POST /api/tutor/ask
 *   POST /api/support/requests
 *   GET  /api/career/jobs
 *   POST /api/career/accommodation-requests
 *
 * Implements fallback to clearly labeled Demo UI data when backend is unavailable.
 * Restrictions respected:
 *   - No backend routes implemented here (pure frontend client).
 *   - No AI logic implemented here (canned demo fallbacks only).
 *   - Honest screen sharing state (no false live connection claims).
 */

((root) => {
  'use strict';

  // Configurable base URL (default: current host / relative)
  let apiBase = (typeof root !== 'undefined' && root.VOICE4ALL_API_BASE) || '';
  const REQUEST_TIMEOUT_MS = 3000;

  let backendAvailable = false;
  let statusListeners = [];

  function notifyStatusChange() {
    statusListeners.forEach((fn) => {
      try {
        fn(backendAvailable);
      } catch (err) {
        console.error('[Voice4All API] Status listener error:', err);
      }
    });
  }

  /**
   * Helper to perform fetch with timeout
   */
  async function fetchWithTimeout(url, options = {}) {
    const fetchFn = (typeof root !== 'undefined' && typeof root.fetch === 'function')
      ? root.fetch.bind(root)
      : (typeof fetch === 'function' ? fetch : null);

    if (!fetchFn) {
      throw new Error('fetch is not supported in this environment');
    }

    let resolvedUrl = url;
    if (apiBase && !url.startsWith('http://') && !url.startsWith('https://')) {
      resolvedUrl = `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchFn(resolvedUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // =========================================================================
  // Demo UI Data Catalog (Fallback when backend offline)
  // =========================================================================

  const DEMO_JOBS = [
    {
      id: 'v4a-job-001',
      title: 'Executive Virtual Assistant',
      title_am: 'ዋና ሥራ አስፈጻሚ ቨርቹዋል ረዳት',
      company: 'AfriTech Global Solutions',
      location: 'Remote (Pan-Africa)',
      location_am: 'የርቀት ሥራ (አፍሪካ አቀፍ)',
      type: 'fulltime',
      type_label: 'Full-Time',
      type_label_am: 'ሙሉ ጊዜ',
      description: 'Support senior leadership with calendar coordination, bilingual email communications, and meeting agendas. Assistive technology friendly.',
      description_am: 'የቀን መቁጠሪያ ቅንጅት፣ የሁለት ቋንቋ ኢሜይል ግንኙነት እና የስብሰባ አጀንዳዎችን በማዘጋጀት የድርጅቱን አመራሮች ይደግፉ። ለአጋዥ ቴክኖሎጂ ተስማሚ።',
      tags: ['Remote', 'Screen-reader verified', 'Flexible hours'],
      tags_am: ['የርቀት ሥራ', 'ስክሪን አንባቢ ተኳኋኝ', 'ተለዋዋጭ ሰዓት'],
      accessible_workplace: true
    },
    {
      id: 'v4a-job-002',
      title: 'Digital Customer Care VA',
      title_am: 'የዲጂታል ደንበኞች አገልግሎት ቪኤ',
      company: 'Horizon Logistics & Commerce',
      location: 'Addis Ababa (Hybrid / Remote Option)',
      location_am: 'አዲስ አበባ (የርቀት ወይም በከፊል)',
      type: 'fulltime',
      type_label: 'Full-Time',
      type_label_am: 'ሙሉ ጊዜ',
      description: 'Manage incoming customer inquiries via live chat and voice notes. Work environment equipped with accessible speech-to-text tools.',
      description_am: 'በቀጥታ የጽሑፍ ውይይት እና በድምጽ መልዕክቶች የሚመጡ የደንበኞችን ጥያቄዎች ያስተናግዱ። በንግግር-ወደ-ጽሑፍ መሣሪያዎች የታገዘ የሥራ አካባቢ።',
      tags: ['Screen-reader friendly', 'Voice-to-text tools', 'Mentorship'],
      tags_am: ['ስክሪን አንባቢ ተኳኋኝ', 'የድምጽ-ወደ-ጽሑፍ መሣሪያዎች', 'የአማካሪ ድጋፍ'],
      accessible_workplace: true
    },
    {
      id: 'v4a-job-003',
      title: 'Content & Scheduling Assistant',
      title_am: 'የይዘት እና የጊዜ ሰሌዳ ረዳት',
      company: 'Impact Studios Africa',
      location: 'Remote (Worldwide)',
      location_am: 'የርቀት ሥራ (ዓለም አቀፍ)',
      type: 'parttime',
      type_label: 'Part-Time (20 hrs/wk)',
      type_label_am: 'የትርፍ ጊዜ (በሳምንት 20 ሰዓት)',
      description: 'Schedule social media posts, proofread newsletter copy, and maintain team assets using accessible Notion and Canva workflows.',
      description_am: 'የማኅበራዊ ሚዲያ ይዘቶችን ማሰራጨት፣ ጋዜጣዎችን ማረም እና ተደራሽ በሆኑ የኖሽን እና ካንቫ አሰራሮች የቡድን መረጃዎችን ማደራጀት።',
      tags: ['Remote', 'Part-time', 'Asynchronous'],
      tags_am: ['የርቀት ሥራ', 'የትርፍ ጊዜ', 'ተለዋዋጭ ጊዜ'],
      accessible_workplace: true
    },
    {
      id: 'v4a-job-004',
      title: 'E-Commerce Operations Coordinator',
      title_am: 'የኢ-ኮሜርስ ኦፕሬሽንስ አስተባባሪ',
      company: 'Savanna Retail Partners',
      location: 'Nairobi / Remote',
      location_am: 'ናይሮቢ / የርቀት ሥራ',
      type: 'remote',
      type_label: 'Remote',
      type_label_am: 'የርቀት ሥራ',
      description: 'Process online store orders, track vendor deliveries, and generate weekly sales summaries. Keyboard-navigable inventory software.',
      description_am: 'የመስመር ላይ ሽያጭ ትዕዛዞችን ማስተናገድ፣ የአቅራቢዎችን አቅርቦት መከታተል እና ሳምንታዊ የሽያጭ ማጠቃለያ ማዘጋጀት። በኪቦርድ የሚመራ ሲስተም።',
      tags: ['Remote', 'Accessible software', 'Training provided'],
      tags_am: ['የርቀት ሥራ', 'ተደራሽ ሶፍትዌር', 'ስልጠና ይሰጣል'],
      accessible_workplace: true
    }
  ];

  function getDemoTutorResponse(message, lang) {
    const isAm = (lang === 'am');
    const lower = (message || '').toLowerCase();

    if (isAm) {
      if (lower.includes('ምን') || lower.includes('ረዳት') || lower.includes('va')) {
        return {
          reply: 'ቨርቹዋል ረዳት (VA) ለደንበኞች ወይም ለድርጅቶች ከርቀት ሆነው የአስተዳደር፣ የቴክኒክ ወይም የፈጠራ ድጋፍ የሚሰጡ ባለሙያ ናቸው። በዛሬው ትምህርት ውስጥ እንደተገለጸው፣ የቪኤ ሚና በቴክኖሎጂ እድገት እና በአርቴፊሻል ኢንተለጀንስ (AI) መሣሪያዎች አጠቃቀም ምክንያት እጅግ እየሰፋ ይገኛል።',
          suggestions: ['አስፈላጊ ክህሎቶች ምንድን ናቸው?', 'የልምምድ ጥያቄ ስጠኝ', 'የዚህን ትምህርት ዋና ነጥቦች አጠቃልል']
        };
      }
      return {
        reply: `ስለ "${message}" ላነሱት ጥያቄ አመሰግናለሁ። በ"The Future of the VA Industry" ትምህርት መሠረት፣ ዘመናዊ ቨርቹዋል ረዳቶች የጊዜ አጠቃቀምን፣ ቀልጣፋ የዲጂታል ግንኙነትን እና የAI መሣሪያዎችን በጥልቀት በመረዳት የላቀ ውጤት ያመጣሉ። ተጨማሪ ማብራሪያ ይፈልጋሉ?`,
        suggestions: ['የዚህን ትምህርት ዋና ነጥቦች አጠቃልል', 'አስፈላጊ ክህሎቶች ምንድን ናቸው?', 'የልምምድ ጥያቄ ስጠኝ']
      };
    }

    // English responses
    if (lower.includes('what is a va') || lower.includes('virtual assistant') || lower.includes('definition')) {
      return {
        reply: 'A Virtual Assistant (VA) is a remote professional who provides administrative, technical, operational, or creative support to clients across the globe. In this lesson, we explored how the VA role has evolved from basic data entry to strategic business partnership and digital project coordination.',
        suggestions: ['What skills does a modern VA need?', 'Summarize this lesson', 'Give me a quick practice quiz']
      };
    }

    if (lower.includes('skill') || lower.includes('mindset') || lower.includes('tool')) {
      return {
        reply: 'Core VA skills highlighted in Module 2 include: 1) Proactive communication and calendar coordination, 2) Digital tool proficiency (Google Workspace, Slack, Notion, AI assistants), 3) Problem solving and self-management, and 4) Continuous learning and adaptability.',
        suggestions: ['How do I practice these skills?', 'Give me a quick practice quiz', 'Tell me about remote work options']
      };
    }

    if (lower.includes('quiz') || lower.includes('test') || lower.includes('practice')) {
      return {
        reply: 'Quick Knowledge Check: True or False — "A Virtual Assistant only performs repetitive administrative tasks and cannot specialize in technical or project management areas." (Hint: Think about the evolution of the role in our reading!)',
        suggestions: ['False! VAs can specialize in tech, project management, and ops.', 'True', 'Explain the correct answer']
      };
    }

    if (lower.includes('summar') || lower.includes('overview') || lower.includes('key')) {
      return {
        reply: 'Key Takeaways from "The Future of the VA Industry":\n• The global demand for specialized, tech-enabled VAs is expanding rapidly.\n• Automation and AI handle routine clerical tasks, allowing VAs to focus on high-value client operations.\n• Adaptability, ethical digital practices, and cross-cultural communication are essential.',
        suggestions: ['What skills should I focus on next?', 'Give me a quick practice quiz', 'Show me career opportunities']
      };
    }

    return {
      reply: `Regarding "${message}": In this concept ("The Future of the VA Industry"), success comes from combining foundational digital literacy with modern automation tools. By taking initiative and structuring your workflows, you set yourself apart as a high-performing professional.`,
      suggestions: ['What is a Virtual Assistant?', 'What skills does a modern VA need?', 'Summarize this lesson']
    };
  }

  // =========================================================================
  // Public API Methods
  // =========================================================================

  const Voice4AllAPI = {
    /**
     * Subscribe to backend connectivity state changes
     */
    onStatusChange(callback) {
      if (typeof callback === 'function') {
        statusListeners.push(callback);
      }
    },

    /**
     * Check current backend availability status
     */
    isBackendAvailable() {
      return backendAvailable;
    },

    /**
     * Configure base API URL (e.g. for testing or remote backend)
     */
    setBaseUrl(url) {
      apiBase = url ? url.replace(/\/$/, '') : '';
    },

    getBaseUrl() {
      return apiBase;
    },

    /**
     * Force backend status (useful for testing demo fallback vs live)
     */
    setForceDemo(forced) {
      backendAvailable = !forced;
      notifyStatusChange();
    },

    /**
     * POST /api/tutor/ask
     */
    async askTutor({ message, language = 'en', context = {} }) {
      const payload = {
        message: message.trim(),
        language,
        context: {
          page: 'The Future of the VA Industry',
          course: 'VA-1: VA Foundations & Professional Identity',
          module: 'Module 2: What is a VA',
          ...context
        }
      };

      try {
        const res = await fetchWithTimeout(`${apiBase}/api/tutor/ask`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        backendAvailable = true;
        notifyStatusChange();

        return {
          success: true,
          isDemo: false,
          reply: data.reply || data.answer || data.message || data.response || '',
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          audio_url: data.audio_url || null,
          timestamp: data.timestamp || new Date().toISOString()
        };
      } catch (err) {
        console.warn('[Voice4All API] Tutor backend unavailable, using clearly labeled Demo UI data:', err.message);
        backendAvailable = false;
        notifyStatusChange();

        const demo = getDemoTutorResponse(payload.message, language);
        return {
          success: true,
          isDemo: true,
          demoNotice: language === 'am' ? 'የሙከራ ሁነታ (የጀርባ ሰርቨር አልተገኘም)' : 'Demo UI Data (Backend Offline)',
          reply: demo.reply,
          suggestions: demo.suggestions,
          audio_url: null,
          timestamp: new Date().toISOString()
        };
      }
    },

    /**
     * POST /api/support/requests
     * Note: Enforces honest status reporting for screen sharing requests.
     */
    async submitSupportRequest({ topic, message, preferred_mode = 'chat', urgency = 'medium', language = 'en', context = {} }) {
      const payload = {
        topic,
        message: message.trim(),
        preferred_mode,
        urgency,
        language,
        context: {
          page: 'The Future of the VA Industry',
          ...context
        }
      };

      try {
        const res = await fetchWithTimeout(`${apiBase}/api/support/requests`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        backendAvailable = true;
        notifyStatusChange();

        return {
          success: true,
          isDemo: false,
          request_id: data.request_id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          status: data.status || 'queued',
          // Honest check: do not claim screen sharing connects unless server specifically states connected
          screen_share_active: Boolean(data.screen_share_active),
          message: data.message || 'Support request submitted.',
          estimated_wait_minutes: data.estimated_wait_minutes || 3,
          created_at: data.created_at || new Date().toISOString()
        };
      } catch (err) {
        console.warn('[Voice4All API] Support backend unavailable, using clearly labeled Demo UI data:', err.message);
        backendAvailable = false;
        notifyStatusChange();

        const fakeId = `REQ-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
        const isAm = (language === 'am');

        let defaultMsg = isAm
          ? 'የእርዳታ ጥያቄዎ በተራ ላይ ተመዝግቧል። ባለሙያ እንደተገኘ ይገናኛሉ።'
          : 'Your support request has been queued. An assistant or peer will connect when available.';

        if (preferred_mode === 'screen_share') {
          defaultMsg = isAm
            ? 'የስክሪን ማጋራት ጥያቄ በተራ ላይ ተመዝግቧል። አሁን ላይ ምንም የቀጥታ ግንኙነት አልተደረገም፤ ባለሙያ ሲገባ ማሳወቂያ ይደርስዎታል።'
            : 'Screen sharing request queued. Waiting for an available mentor. (Not currently connected to human screen sharing).';
        }

        return {
          success: true,
          isDemo: true,
          demoNotice: isAm ? 'የሙከራ ሁነታ (የጀርባ ሰርቨር አልተገኘም)' : 'Demo UI Data (Backend Offline)',
          request_id: fakeId,
          status: 'queued',
          screen_share_active: false,
          message: defaultMsg,
          preferred_mode,
          estimated_wait_minutes: 2,
          created_at: new Date().toISOString()
        };
      }
    },

    /**
     * GET /api/career/jobs
     */
    async getJobs({ query = '', filter = 'all', language = 'en' } = {}) {
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filter && filter !== 'all') params.set('type', filter);
        if (language) params.set('lang', language);

        const url = `${apiBase}/api/career/jobs${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetchWithTimeout(url, { method: 'GET' });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        backendAvailable = true;
        notifyStatusChange();

        const rawList = Array.isArray(data.jobs) ? data.jobs : (Array.isArray(data) ? data : []);
        return {
          success: true,
          isDemo: false,
          jobs: rawList
        };
      } catch (err) {
        console.warn('[Voice4All API] Career jobs backend unavailable, using clearly labeled Demo UI data:', err.message);
        backendAvailable = false;
        notifyStatusChange();

        const isAm = (language === 'am');
        const q = (query || '').toLowerCase().trim();

        const filtered = DEMO_JOBS.filter((job) => {
          if (filter !== 'all') {
            if (filter === 'remote' && job.type !== 'remote' && !job.location.toLowerCase().includes('remote')) {
              return false;
            }
            if (filter === 'fulltime' && job.type !== 'fulltime') return false;
            if (filter === 'parttime' && job.type !== 'parttime') return false;
          }
          if (q) {
            const haystack = `${job.title} ${job.title_am} ${job.company} ${job.description} ${job.description_am} ${job.tags.join(' ')}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        }).map((job) => ({
          id: job.id,
          title: isAm ? job.title_am : job.title,
          company: job.company,
          location: isAm ? job.location_am : job.location,
          type: job.type,
          type_label: isAm ? job.type_label_am : job.type_label,
          description: isAm ? job.description_am : job.description,
          tags: isAm ? job.tags_am : job.tags,
          accessible_workplace: job.accessible_workplace,
          isDemo: true
        }));

        return {
          success: true,
          isDemo: true,
          demoNotice: isAm ? 'የሙከራ ሁነታ (የጀርባ ሰርቨር አልተገኘም)' : 'Demo UI Data (Backend Offline)',
          jobs: filtered
        };
      }
    },

    /**
     * POST /api/career/accommodation-requests
     */
    async submitAccommodationRequest({ job_id, job_title, accommodations = [], details = '', contact_email = '', language = 'en' }) {
      const payload = {
        job_id,
        job_title,
        accommodations,
        details: details.trim(),
        contact_email: contact_email.trim(),
        language
      };

      try {
        const res = await fetchWithTimeout(`${apiBase}/api/career/accommodation-requests`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        backendAvailable = true;
        notifyStatusChange();

        return {
          success: true,
          isDemo: false,
          request_id: data.request_id || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
          status: data.status || 'pending_review',
          message: data.message || 'Workplace accommodation request submitted successfully.',
          created_at: data.created_at || new Date().toISOString()
        };
      } catch (err) {
        console.warn('[Voice4All API] Accommodation backend unavailable, using clearly labeled Demo UI data:', err.message);
        backendAvailable = false;
        notifyStatusChange();

        const fakeId = `ACC-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
        const isAm = (language === 'am');

        return {
          success: true,
          isDemo: true,
          demoNotice: isAm ? 'የሙከራ ሁነታ (የጀርባ ሰርቨር አልተገኘም)' : 'Demo UI Data (Backend Offline)',
          request_id: fakeId,
          status: 'pending_review',
          message: isAm
            ? 'የሥራ ቦታ ማመቻቸት ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል። የካሪየር ቡድኑ በቅርቡ ያነጋግርዎታል።'
            : 'Your workplace accommodation request has been recorded. Our talent support team will coordinate necessary adaptations.',
          created_at: new Date().toISOString()
        };
      }
    }
  };

  root.Voice4AllAPI = Voice4AllAPI;
})(typeof window !== 'undefined' ? window : this);
