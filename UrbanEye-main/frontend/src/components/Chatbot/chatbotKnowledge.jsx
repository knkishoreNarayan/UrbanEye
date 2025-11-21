// UrbanEye Chatbot Knowledge Base
// Structured Q&A system with branching logic

export const chatbotKnowledge = {
  greeting: {
    id: 'greeting',
    message: "Hi! 👋 I'm EyeBot, here to help you explore UrbanEye.",
    type: 'bot',
    options: [
      { id: 'user_flow', label: "I'm a User", icon: '👤' },
      { id: 'admin_flow', label: "I'm an Admin", icon: '👨‍💼' }
    ]
  },

  // ==================== USER FLOW ====================
  user_flow: {
    id: 'user_flow',
    message: "Great! I'll help you understand how UrbanEye works for citizens. What would you like to know?",
    type: 'bot',
    options: [
      { id: 'what_is_urbaneye', label: 'What does this website do?', icon: '🏙️' },
      { id: 'how_to_report', label: 'How do I report an issue?', icon: '📝' },
      { id: 'signup_login', label: 'How do I sign up/log in?', icon: '🔐' },
      { id: 'report_tracking', label: 'How does my report reach authorities?', icon: '📊' },
      { id: 'severity_detection', label: 'How does severity detection work?', icon: '🤖' },
      { id: 'data_safety', label: 'Is my data safe?', icon: '🔒' }
    ]
  },

  // What is UrbanEye
  what_is_urbaneye: {
    id: 'what_is_urbaneye',
    message: "UrbanEye is Bengaluru's civic platform that connects citizens with authorities. You report issues → AI analyzes them → Admins take action → You get updates!",
    type: 'bot',
    options: [
      { id: 'how_helps_bengaluru', label: 'How does it help Bengaluru?', icon: '🌟' },
      { id: 'after_upload', label: 'What happens after I upload?', icon: '⬆️' },
      { id: 'need_account', label: 'Do I need an account?', icon: '👤' }
    ]
  },

  how_helps_bengaluru: {
    id: 'how_helps_bengaluru',
    message: "UrbanEye makes civic improvement faster! Citizens can easily report potholes, broken lights, waste issues, etc. Reports go directly to the right zone admin who can take quick action. This creates a transparent, efficient system for a better Bengaluru!",
    type: 'bot'
  },

  after_upload: {
    id: 'after_upload',
    message: "Here's the journey of your report:\n1️⃣ You upload photo + details\n2️⃣ AI analyzes severity\n3️⃣ Report goes to zone admin\n4️⃣ Admin updates status\n5️⃣ You get live notifications\n\nYou can track progress anytime in your dashboard!",
    type: 'bot'
  },

  need_account: {
    id: 'need_account',
    message: "Yes, you need a free account to:\n✅ Submit reports\n✅ Track your issues\n✅ Get status updates\n✅ View history\n\nSignup takes just 2 minutes with email and phone!",
    type: 'bot'
  },

  // How to Report
  how_to_report: {
    id: 'how_to_report',
    message: "Reporting is easy! Just follow these steps:\n1. Click 'Submit Issue'\n2. Add photo (required)\n3. Fill details (title, description, category)\n4. Add location (GPS or manual)\n5. Submit!\n\nWhat would you like to know more about?",
    type: 'bot',
    options: [
      { id: 'issue_types', label: 'Types of issues I can report', icon: '📋' },
      { id: 'photo_required', label: 'Do I need a photo?', icon: '📷' },
      { id: 'adding_location', label: 'How to add location?', icon: '📍' },
      { id: 'response_time', label: 'How long for response?', icon: '⏱️' }
    ]
  },

  issue_types: {
    id: 'issue_types',
    message: "You can report:\n🛣️ Roads (potholes, cracks)\n💡 Street Lighting\n💧 Water Supply\n🚮 Waste Management\n🚦 Traffic issues\n⚡ Electricity problems\n🏞️ Parks & Recreation\n🏗️ Infrastructure\n...and more!",
    type: 'bot'
  },

  photo_required: {
    id: 'photo_required',
    message: "Yes, photos are required! They help:\n✅ Verify the issue\n✅ AI detect severity\n✅ Admins understand the problem\n✅ Track before/after\n\nTip: Take clear, well-lit photos showing the full issue!",
    type: 'bot',
    options: [
      { id: 'photo_unclear', label: 'What if photo is unclear?', icon: '🤔' },
      { id: 'ai_detect', label: 'Does AI detect severity?', icon: '🤖' }
    ]
  },

  photo_unclear: {
    id: 'photo_unclear',
    message: "If your photo is unclear:\n• Retake with better lighting\n• Get closer to the issue\n• Avoid blurry shots\n• Show full context\n\nClear photos = Faster action! The AI works best with good quality images.",
    type: 'bot'
  },

  ai_detect: {
    id: 'ai_detect',
    message: "Yes! Our AI (YOLOv8 model) analyzes photos to:\n🔍 Detect potholes automatically\n📊 Calculate severity (Low/Medium/High/Critical)\n📏 Measure area coverage\n🎯 Count number of issues\n\nThis helps prioritize urgent problems!",
    type: 'bot'
  },

  adding_location: {
    id: 'adding_location',
    message: "Two ways to add location:\n\n1️⃣ GPS Auto-capture:\n• Click 'Get GPS'\n• Allow location access\n• Coordinates captured automatically\n\n2️⃣ Manual Entry:\n• Type the address\n• Be specific (street, landmark)\n\nGPS is more accurate!",
    type: 'bot'
  },

  response_time: {
    id: 'response_time',
    message: "Response times:\n⚡ Critical issues: < 24 hours\n🟡 High priority: 2-3 days\n🟢 Medium/Low: 5-7 days\n\nYou'll get status updates at each step. Admins work based on severity and zone workload!",
    type: 'bot'
  },

  // Signup/Login
  signup_login: {
    id: 'signup_login',
    message: "Account help! What do you need?",
    type: 'bot',
    options: [
      { id: 'signup_requirements', label: 'What do I need to sign up?', icon: '📝' },
      { id: 'login_issues', label: 'Unable to log in', icon: '🔓' },
      { id: 'forgot_password', label: 'Forgot password', icon: '🔑' }
    ]
  },

  signup_requirements: {
    id: 'signup_requirements',
    message: "To create an account, you need:\n✅ Full Name\n✅ Email address\n✅ Phone number (+91)\n✅ Address in Bengaluru\n✅ Password (6+ characters)\n\nThat's it! Your account is created instantly.",
    type: 'bot'
  },

  login_issues: {
    id: 'login_issues',
    message: "Can't log in? Try:\n1. Check email spelling\n2. Verify password (case-sensitive)\n3. Clear browser cache\n4. Try 'Forgot Password'\n5. Check internet connection\n\nStill stuck? Contact support!",
    type: 'bot'
  },

  forgot_password: {
    id: 'forgot_password',
    message: "To reset password:\n1. Click 'Forgot Password' on login\n2. Enter your email\n3. Check inbox for reset link\n4. Create new password\n5. Log in!\n\nNote: Currently, contact admin for password reset assistance.",
    type: 'bot'
  },

  // Report Tracking
  report_tracking: {
    id: 'report_tracking',
    message: "Your report goes through a smart system! Let me explain:",
    type: 'bot',
    options: [
      { id: 'how_admins_receive', label: 'How do admins receive reports?', icon: '📨' },
      { id: 'authorities_respond', label: 'Do authorities respond?', icon: '💬' },
      { id: 'track_issue', label: 'How to track my issue?', icon: '📍' }
    ]
  },

  how_admins_receive: {
    id: 'how_admins_receive',
    message: "Here's how it works:\n1. You submit report\n2. System identifies your zone\n3. Report appears in zone admin's dashboard\n4. Admin sees: photo, AI severity, location, details\n5. Admin can filter by severity/date\n\nEach zone has dedicated admins monitoring 24/7!",
    type: 'bot'
  },

  authorities_respond: {
    id: 'authorities_respond',
    message: "Yes! Admins:\n✅ Review your report\n✅ Update status (Pending → In Progress → Resolved)\n✅ Add remarks/comments\n✅ Mark completion\n\nYou get instant notifications for each update. The system ensures accountability!",
    type: 'bot'
  },

  track_issue: {
    id: 'track_issue',
    message: "Track your issues easily:\n1. Log into your dashboard\n2. Go to 'My Reports' tab\n3. See all your submissions\n4. Check status badges\n5. Click any report for full details\n\nYou'll see: submission date, current status, admin remarks, and resolution timeline!",
    type: 'bot'
  },

  // Severity Detection
  severity_detection: {
    id: 'severity_detection',
    message: "Our AI-powered severity system helps prioritize issues! What would you like to know?",
    type: 'bot',
    options: [
      { id: 'severity_purpose', label: 'Why severity levels?', icon: '🎯' },
      { id: 'ai_mistakes', label: 'Can AI make mistakes?', icon: '❓' },
      { id: 'who_verifies', label: 'Who verifies severity?', icon: '✅' }
    ]
  },

  severity_purpose: {
    id: 'severity_purpose',
    message: "Severity levels help:\n🔴 Critical: Immediate danger (24hr response)\n🟠 High: Major issues (2-3 days)\n🟡 Medium: Moderate problems (5-7 days)\n🟢 Low: Minor issues (planned maintenance)\n\nThis ensures urgent problems get faster attention!",
    type: 'bot'
  },

  ai_mistakes: {
    id: 'ai_mistakes',
    message: "Our AI is 92% accurate, but:\n• Sometimes lighting affects detection\n• Unclear photos may cause errors\n• New issue types need learning\n\nGood news: Admins review and can override AI severity if needed. Human verification ensures accuracy!",
    type: 'bot'
  },

  who_verifies: {
    id: 'who_verifies',
    message: "Verification process:\n1. AI suggests severity\n2. Admin reviews photo + details\n3. Admin can override if needed\n4. Final severity is set\n5. Issue prioritized accordingly\n\nIt's AI + Human intelligence working together!",
    type: 'bot'
  },

  // Data Safety
  data_safety: {
    id: 'data_safety',
    message: "Your privacy matters! Let me explain our data practices:",
    type: 'bot',
    options: [
      { id: 'what_data_stored', label: 'What data is stored?', icon: '💾' },
      { id: 'data_sharing', label: 'Do you share my details?', icon: '🔐' },
      { id: 'delete_account', label: 'Can I delete my account?', icon: '🗑️' }
    ]
  },

  what_data_stored: {
    id: 'what_data_stored',
    message: "We store:\n✅ Name, email, phone (for account)\n✅ Report photos (for verification)\n✅ Location data (for routing)\n✅ Report history (for tracking)\n\nWe DON'T store:\n❌ Payment info (no payments)\n❌ Unnecessary personal data\n❌ Browsing history",
    type: 'bot'
  },

  data_sharing: {
    id: 'data_sharing',
    message: "Your data is shared ONLY with:\n✅ Zone admins (to resolve your issue)\n✅ BBMP authorities (official use)\n\nWe NEVER:\n❌ Sell your data\n❌ Share with third parties\n❌ Use for marketing\n\nYour reports are public for transparency, but personal details stay private!",
    type: 'bot'
  },

  delete_account: {
    id: 'delete_account',
    message: "Yes, you can delete your account:\n1. Contact support\n2. Request account deletion\n3. We remove personal data\n4. Reports stay (for civic records) but anonymized\n\nNote: Active/pending reports should be resolved first for community benefit!",
    type: 'bot'
  },

  // ==================== ADMIN FLOW ====================
  admin_flow: {
    id: 'admin_flow',
    message: "Welcome, Admin! I'll help you understand the UrbanEye admin system. What would you like to know?",
    type: 'bot',
    options: [
      { id: 'admin_registration', label: 'How do I register?', icon: '📝' },
      { id: 'access_code_system', label: 'What is the access-code system?', icon: '🔑' },
      { id: 'admin_dashboard', label: 'What do I see after logging in?', icon: '📊' },
      { id: 'view_complaints', label: 'How do I view complaints?', icon: '👁️' },
      { id: 'severity_model_help', label: 'How does severity model help?', icon: '🤖' },
      { id: 'update_status', label: 'Updating complaint status', icon: '✅' }
    ]
  },

  // Admin Registration
  admin_registration: {
    id: 'admin_registration',
    message: "Admin registration is zone-based and secure. What do you need help with?",
    type: 'bot',
    options: [
      { id: 'who_provides_code', label: 'Who provides access code?', icon: '👤' },
      { id: 'code_not_working', label: 'Access code not working', icon: '❌' },
      { id: 'which_zones', label: 'Which zones can I manage?', icon: '🗺️' }
    ]
  },

  who_provides_code: {
    id: 'who_provides_code',
    message: "Access codes are provided by:\n🏛️ BBMP Head Office\n👨‍💼 Zone Supervisors\n📧 Official @bbmp.gov.in email\n\nYou must:\n✅ Be authorized BBMP staff\n✅ Have official email\n✅ Be assigned to specific zone\n\nContact your supervisor for your unique code!",
    type: 'bot'
  },

  code_not_working: {
    id: 'code_not_working',
    message: "If access code fails:\n1. Verify you're using @bbmp.gov.in email\n2. Check code spelling (case-sensitive)\n3. Ensure code matches your zone\n4. Confirm code is active\n5. Contact BBMP IT support\n\nEach code is zone-specific and time-limited for security!",
    type: 'bot'
  },

  which_zones: {
    id: 'which_zones',
    message: "Bengaluru has 198 wards grouped into zones:\n• East Zone\n• West Zone\n• South Zone\n• North Zone\n• Mahadevapura\n• Bommanahalli\n• RR Nagar\n• Yelahanka\n...and more!\n\nYour access code determines which zone's reports you can manage. One admin = One zone for accountability!",
    type: 'bot'
  },

  // Access Code System
  access_code_system: {
    id: 'access_code_system',
    message: "The access-code system ensures security and proper zone management:",
    type: 'bot',
    options: [
      { id: 'how_code_generated', label: 'How is code generated?', icon: '🔐' },
      { id: 'change_zone', label: 'Can I change zones?', icon: '🔄' },
      { id: 'forgot_access_code', label: 'Forgot access code', icon: '❓' }
    ]
  },

  how_code_generated: {
    id: 'how_code_generated',
    message: "Code generation process:\n1. BBMP assigns you to a zone\n2. System generates unique code\n3. Code linked to:\n   • Your email\n   • Specific zone\n   • Division name\n4. Code sent via official channel\n\nThis prevents unauthorized access and ensures reports go to right admins!",
    type: 'bot'
  },

  change_zone: {
    id: 'change_zone',
    message: "Zone changes require:\n1. Official transfer request\n2. BBMP approval\n3. New access code generation\n4. Old code deactivation\n\nContact your supervisor for zone transfer. This maintains accountability and prevents confusion!",
    type: 'bot'
  },

  forgot_access_code: {
    id: 'forgot_access_code',
    message: "To recover access code:\n1. Contact BBMP IT support\n2. Verify your identity\n3. Provide official email\n4. Request code resend\n\nFor security, codes can't be reset online. Must go through official channels!",
    type: 'bot'
  },

  // Admin Dashboard
  admin_dashboard: {
    id: 'admin_dashboard',
    message: "Your dashboard is your command center! Let me show you around:",
    type: 'bot',
    options: [
      { id: 'dashboard_overview', label: 'Dashboard overview', icon: '📊' },
      { id: 'grouping_reports', label: 'How are reports grouped?', icon: '📁' },
      { id: 'admin_homepage', label: 'What is on the homepage?', ion: '🏠' }
    ]
  },

  dashboard_overview: {
    id: 'dashboard_overview',
    message: "Your dashboard shows: Statistics (Total reports, Pending count, In Progress count, Resolved count), Reports List (All complaints in your zone, Sorted by severity/date, Quick status update buttons), Map View (Visual location of all issues, Click markers for details), and Export (Download reports as CSV/JSON, Generate summaries)",
    type: 'bot'
  },

  grouping_reports: {
    id: 'grouping_reports',
    message: "Reports are organized by:\n\n🔴 Severity:\n• Critical (top priority)\n• High\n• Medium\n• Low\n\n📅 Date:\n• Today\n• Last 7 days\n• Last 30 days\n• All time\n\n📂 Category:\n• Roads\n• Lighting\n• Water\n• Waste\n...etc\n\nYou can filter and search to find specific reports quickly!",
    type: 'bot'
  },

  admin_homepage: {
    id: 'admin_homepage',
    message: "Homepage features:\n\n✅ Quick Stats Cards\n• Visual overview of workload\n\n📋 Recent Reports\n• Latest submissions\n• One-click access\n\n🔍 Search & Filter\n• Find specific issues\n• Advanced filtering\n\n⚡ Quick Actions\n• Update status\n• Add remarks\n• View details\n\nEverything you need at a glance!",
    type: 'bot'
  },

  // View Complaints
  view_complaints: {
    id: 'view_complaints',
    message: "Managing complaints is easy! What would you like to know?",
    type: 'bot',
    options: [
      { id: 'filter_severity', label: 'Filter by severity', icon: '🔍' },
      { id: 'view_full_report', label: 'View full report details', icon: '📄' },
      { id: 'export_reports', label: 'Export reports', icon: '📥' }
    ]
  },

  filter_severity: {
    id: 'filter_severity',
    message: "Filtering helps prioritize:\n\n1. Click 'Filters' button\n2. Select severity level:\n   🔴 Critical\n   🟠 High\n   🟡 Medium\n   🟢 Low\n3. Combine with:\n   • Status filter\n   • Date range\n   • Category\n4. Click 'Apply'\n\nTip: Start with Critical issues each day!",
    type: 'bot'
  },

  view_full_report: {
    id: 'view_full_report',
    message: "To view full details:\n\n1. Click any report card\n2. Modal opens showing:\n   📷 Photo evidence\n   📍 Exact location\n   🤖 AI analysis\n   📊 Severity score\n   👤 Citizen details\n   📝 Description\n   🕐 Timeline\n\n3. From here you can:\n   ✅ Update status\n   💬 Add remarks\n   🗺️ View on map",
    type: 'bot'
  },

  export_reports: {
    id: 'export_reports',
    message: "Export for records/analysis:\n\n1. Go to 'Export Reports' tab\n2. Choose:\n   📊 Report Type (All/Pending/Resolved)\n   📅 Date Range\n   📁 Format (CSV/JSON/Summary)\n3. Click 'Export'\n4. File downloads automatically\n\nGreat for:\n• Monthly reports\n• Performance tracking\n• Data analysis\n• Official records",
    type: 'bot'
  },

  // Severity Model Help
  severity_model_help: {
    id: 'severity_model_help',
    message: "The AI severity model is your smart assistant! How can I help?",
    type: 'bot',
    options: [
      { id: 'override_severity', label: 'Can I override AI severity?', icon: '✏️' },
      { id: 'model_accuracy', label: 'How accurate is it?', icon: '🎯' },
      { id: 'escalation', label: 'When to escalate?', icon: '⬆️' }
    ]
  },

  override_severity: {
    id: 'override_severity',
    message: "Yes! You have final authority:\n\n1. Open report details\n2. Review AI suggestion\n3. Check photo + description\n4. If AI is wrong:\n   • Click 'Edit Severity'\n   • Select correct level\n   • Add reason\n   • Save\n\nYour judgment > AI. The model learns from your corrections!",
    type: 'bot'
  },

  model_accuracy: {
    id: 'model_accuracy',
    message: "Our YOLOv8 model:\n\n✅ 92% accuracy on potholes\n✅ Analyzes:\n   • Area coverage\n   • Number of issues\n   • Confidence score\n   • Size estimation\n\n⚠️ May struggle with:\n   • Poor lighting\n   • Unclear photos\n   • New issue types\n\nThat's why human verification is crucial!",
    type: 'bot'
  },

  escalation: {
    id: 'escalation',
    message: "Escalate when:\n\n🚨 Immediate danger:\n• Deep potholes on highways\n• Exposed electrical wires\n• Major water leaks\n\n⏰ Delayed response:\n• Critical issue > 24hrs\n• High priority > 3 days\n\n📈 Growing problem:\n• Multiple reports same location\n• Issue worsening\n\nUse 'Add Remarks' to flag for supervisors!",
    type: 'bot'
  },

  // Update Status
  update_status: {
    id: 'update_status',
    message: "Status updates keep citizens informed! Here's how:",
    type: 'bot',
    options: [
      { id: 'status_options', label: 'What status options exist?', icon: '📊' },
      { id: 'user_notifications', label: 'Do users get notified?', icon: '🔔' },
      { id: 'admin_remarks', label: 'Adding admin remarks', icon: '💬' }
    ]
  },

  status_options: {
    id: 'status_options',
    message: "Three status levels:\n\n🟡 Pending:\n• Just submitted\n• Awaiting review\n• Default status\n\n🔵 In Progress:\n• Work started\n• Team assigned\n• Action underway\n\n🟢 Resolved:\n• Issue fixed\n• Work completed\n• Verified\n\nUpdate status as work progresses!",
    type: 'bot'
  },

  user_notifications: {
    id: 'user_notifications',
    message: "Yes! Users get instant notifications:\n\n📧 When you:\n• Change status\n• Add remarks\n• Mark resolved\n\n✅ They see:\n• Status badge update\n• Your comments\n• Timeline changes\n• Resolution details\n\nThis builds trust and transparency!",
    type: 'bot'
  },

  admin_remarks: {
    id: 'admin_remarks',
    message: "Adding remarks:\n\n1. Open report\n2. Click 'Add Remark'\n3. Type update:\n   • Work progress\n   • Expected timeline\n   • Team assigned\n   • Challenges faced\n4. Save\n\nGood remarks:\n✅ 'Team dispatched, work starts tomorrow'\n✅ 'Materials ordered, fixing by Friday'\n✅ 'Pothole filled, road reopened'\n\nKeep citizens informed!",
    type: 'bot'
  }
};

// Navigation helpers
export const getNodeById = (id) => chatbotKnowledge[id];

export const hasOptions = (node) => node && node.options && node.options.length > 0;

export const getBackButton = () => ({ id: 'back', label: '← Back', icon: '↩️' });

export const getStartOverButton = () => ({ id: 'greeting', label: '🏠 Start Over', icon: '🔄' });
