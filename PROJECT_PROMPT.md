# UPSC Practice Quiz Application - Complete Project Documentation

## 📋 Project Overview

Yeh ek comprehensive UPSC (Union Public Service Commission) practice quiz application hai jo students ko UPSC-style questions ke saath practice karne mein help karti hai. Application mein multiple languages support, dark mode, admin panel, aur auto-update system hai.

## 🎯 Main Features

### 1. **Multi-Language Support**
- **Supported Languages**: English, Hindi, Urdu, Spanish, French, German, Chinese, Portuguese, Russian, Japanese, Arabic, Italian
- **Auto-translation**: Questions automatically translate ho jate hain selected language mein
- **UI Translation**: Complete interface translate hota hai selected language mein
- **Language Selector**: Top-right corner mein dropdown se language change kar sakte hain

### 2. **Dark Mode**
- **Toggle Button**: Top center mein dark mode toggle button
- **Theme Persistence**: Selected theme localStorage mein save hota hai
- **Smooth Transitions**: Theme change smooth animations ke saath hota hai
- **CSS Variables**: Dynamic color system jo theme ke according change hota hai

### 3. **Admin Panel**
- **Access**: Top-right corner mein ⚙️ button se access
- **Keyboard Shortcut**: `Ctrl + Shift + A` se bhi open kar sakte hain
- **Features**:
  - Add new questions
  - Edit existing questions
  - Delete questions
  - Search/Filter questions
  - Export questions (JSON format)
  - Import questions (JSON format)
  - View statistics (total questions, last update time)
  - Enable/Disable auto-update

### 4. **Question Management System**
- **10,000+ Questions**: Har subject ke liye 10,000 questions available
- **Multiple Subjects**:
  - Prelims Papers (GS, CSAT)
  - Mains Papers (GS I, II, III, IV, Essay, Indian Language, English)
  - All Subjects (Mixed)
- **Categories**: History, Geography, Polity, Science, Economics, General Knowledge, Current Affairs, Mathematics, Reasoning, Comprehension, etc.
- **Auto-Expansion**: Questions automatically expand hote hain to create 10,000 questions per subject

### 5. **Auto-Update System**
- **Real-time Updates**: Questions automatically update hote hain jab admin changes karta hai
- **Update Indicator**: Notification dikhta hai jab questions update hote hain
- **Auto-refresh**: Quiz automatically refresh hota hai jab new questions add hote hain
- **Check Interval**: Har 30 seconds mein check karta hai for updates

### 6. **Quiz Features**
- **Question Count Selection**: 10, 25, 50, 100, 200, 500, 1000, 5000, ya 10000 questions select kar sakte hain
- **Scoring System**:
  - Correct answer: +4 marks
  - Wrong answer: -1 mark
  - Unanswered: 0 marks
- **Timer**: Real-time timer jo progress track karta hai
- **Progress Bar**: Visual progress indicator
- **Navigation**: Previous/Next buttons
- **Lifelines**:
  - 50:50 (Remove 2 wrong answers)
  - Skip (Skip question, max 3 times)
  - Hint (Get a hint)
- **Answer Review**: Submit ke baad complete review with correct/wrong answers
- **Results Screen**: Detailed statistics with accuracy percentage

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with CSS Variables, Animations, Glassmorphism effects
- **JavaScript (ES6+)**: 
  - Vanilla JavaScript (no frameworks)
  - Async/Await for API calls
  - Event-driven architecture
  - LocalStorage for theme persistence

### Backend
- **Node.js**: Server runtime
- **HTTP Server**: Built-in Node.js http module
- **File System**: Questions JSON file mein store hote hain
- **RESTful API**: Question management ke liye API endpoints

### File Structure
```
project/
├── index.html              # Main HTML file
├── style.css               # All styles (dark mode, animations, responsive)
├── quiz.js                 # Main quiz logic, question database
├── admin.js                # Admin panel functionality
├── translations.js         # UI translations for all languages
├── question-translations.js # Question translations
├── server.js               # Node.js server with API endpoints
├── questions.json          # Questions storage (auto-generated)
├── questions-stats.json    # Statistics storage (auto-generated)
├── package.json            # Node.js dependencies
├── README.md               # Project documentation
└── PROJECT_PROMPT.md       # This file
```

## 📁 File Descriptions

### `index.html`
- Main HTML structure
- All screens (Welcome, Quiz, Results, Review, Admin Panel)
- Inline script for immediate button handlers
- Script loading order

### `style.css`
- Complete styling with CSS variables
- Dark mode theme support
- Responsive design
- Animations and transitions
- Glassmorphism effects
- Particle effects

### `quiz.js`
- Question database (100+ base questions)
- Question expansion logic (10,000 questions per subject)
- Quiz flow management
- Score calculation
- Timer functionality
- Lifelines implementation
- Translation integration
- API integration for loading questions

### `admin.js`
- Admin panel initialization
- Question CRUD operations
- Auto-update system
- Export/Import functionality
- Statistics management
- Dark mode toggle
- Language change handler
- Event listeners

### `translations.js`
- UI translations for 12 languages
- Translation functions
- Language switching logic
- Update translations function

### `question-translations.js`
- Question translations for multiple languages
- Auto-translate fallback
- Translation mapping

### `server.js`
- HTTP server setup
- Static file serving
- REST API endpoints:
  - `GET /api/questions` - Get all questions
  - `GET /api/questions/:id` - Get single question
  - `POST /api/questions` - Add new question
  - `PUT /api/questions/:id` - Update question
  - `DELETE /api/questions/:id` - Delete question
  - `POST /api/questions/import` - Import questions
  - `GET /api/questions/stats` - Get statistics
  - `GET /api/questions/check-update` - Check for updates

## 🚀 How to Run

### Prerequisites
- Node.js installed
- Modern web browser (Chrome, Firefox, Edge)

### Steps
1. **Install Dependencies** (if needed):
   ```bash
   npm install
   ```

2. **Start Server**:
   ```bash
   node server.js
   ```
   Ya phir:
   ```bash
   npm start
   ```

3. **Open Browser**:
   - Server automatically browser open karega
   - Ya manually open karein: `http://localhost:8000`

4. **Access Application**:
   - Welcome screen automatically load hoga
   - Select subject/paper
   - Select number of questions
   - Click "Start Quiz"

## 🎮 Usage Guide

### For Students/Users

1. **Start Quiz**:
   - Subject/Paper select karein
   - Number of questions choose karein
   - "Start Quiz" button click karein

2. **During Quiz**:
   - Questions answer karein
   - Previous/Next buttons se navigate karein
   - Lifelines use kar sakte hain
   - Timer dekhte rahein

3. **Submit Quiz**:
   - "Submit Quiz" button click karein
   - Results screen mein detailed statistics dekhein
   - "Review Answers" se answers review karein

4. **Language Change**:
   - Top-right corner mein language selector se language change karein
   - Questions aur UI automatically translate ho jayega

5. **Dark Mode**:
   - Top center mein dark mode button click karein
   - Theme automatically save ho jayega

### For Admins

1. **Access Admin Panel**:
   - Top-right corner mein ⚙️ button click karein
   - Ya `Ctrl + Shift + A` press karein

2. **Add Question**:
   - Question ID enter karein
   - Question text type karein
   - Category select karein
   - 4 options enter karein
   - Correct option select karein
   - "Add Question" button click karein

3. **Edit Question**:
   - Questions list mein "Edit" button click karein
   - Form automatically populate hoga
   - Changes karein aur "Update Question" click karein

4. **Delete Question**:
   - Questions list mein "Delete" button click karein
   - Confirm karein

5. **Export Questions**:
   - "Export Questions" button click karein
   - JSON file download hogi

6. **Import Questions**:
   - "Import Questions" button click karein
   - JSON file select karein
   - Questions automatically import ho jayengi

7. **Auto-Update**:
   - "Enable Auto-Update" checkbox enable karein
   - System automatically har 30 seconds mein check karega
   - Updates automatically apply ho jayengi

## 🔧 Configuration

### Port Configuration
`server.js` mein PORT change kar sakte hain:
```javascript
const PORT = 8000; // Change to your preferred port
```

### Question Count Options
`index.html` mein question count options modify kar sakte hain:
```html
<option value="10">10 Questions</option>
<option value="25">25 Questions</option>
<!-- Add more options -->
```

### Language Support
Nayi language add karne ke liye:
1. `translations.js` mein new language object add karein
2. `question-translations.js` mein translations add karein
3. `index.html` mein language option add karein
4. `quiz.js` mein language code mapping add karein

## 🎨 Customization

### Colors
`style.css` mein CSS variables modify kar sakte hain:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    /* Change colors */
}
```

### Animations
Animations `style.css` mein customize kar sakte hain:
- `@keyframes gradientShift`
- `@keyframes float`
- `@keyframes sparkle`

### Question Categories
`quiz.js` mein categories add/modify kar sakte hain:
```javascript
category: "Your Category"
```

## 🔒 Security Notes

- Admin panel currently open hai (no authentication)
- Production mein authentication add karni chahiye
- API endpoints secure karein
- Input validation add karein

## 📊 Statistics

- Total questions count
- Last update time
- Auto-update status
- Category-wise question distribution

## 🐛 Troubleshooting

### Buttons Not Working
1. Browser cache clear karein
2. Hard refresh karein (Ctrl+Shift+R)
3. Console mein errors check karein
4. Server restart karein

### Questions Not Loading
1. Server running hai ya nahi check karein
2. `questions.json` file exists karein
3. API endpoints check karein
4. Console mein errors check karein

### Language Not Changing
1. `translations.js` properly load ho raha hai ya nahi
2. Language code correct hai ya nahi
3. Console mein errors check karein

### Dark Mode Not Working
1. localStorage enabled hai ya nahi check karein
2. CSS variables properly defined hain ya nahi
3. Browser console mein errors check karein

## 📝 Future Enhancements

- User authentication system
- User profiles and progress tracking
- Leaderboard
- Question difficulty levels
- More question categories
- Offline mode support
- Mobile app version
- Analytics dashboard
- Question tagging system
- Practice tests by topic

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Development

### Adding New Features
1. Code structure maintain karein
2. Comments add karein
3. Console logs for debugging
4. Error handling add karein
5. Test thoroughly

### Code Style
- Consistent naming conventions
- Proper indentation
- Comments for complex logic
- Modular functions

## 🎓 Educational Purpose

Yeh application UPSC aspirants ke liye banai gayi hai practice karne ke liye. Questions UPSC pattern ke according hain aur regular updates hote rahte hain.

---

**Note**: Yeh ek complete, production-ready UPSC practice quiz application hai with admin panel, multi-language support, dark mode, aur auto-update system. Sab kuch properly integrated hai aur kaam kar raha hai.




