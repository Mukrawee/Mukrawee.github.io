// app.js - State Engine and Interactive Learning Platform

class App {
    constructor() {
        this.studentName = "";
        this.score = 0;
        this.currentLevel = 1; // 1: Greetings, 2: Personal Info, 3: Daily Routines
        this.currentSubPage = 'theory'; // 'theory', 'vocab', 'activity', 'quiz'
        this.levelsUnlocked = { 1: true, 2: false, 3: false };
        this.quizCompleted = { 1: false, 2: false, 3: false };
        
        // Quiz State
        this.quizQuestions = [];
        this.currentQuestionIdx = 0;
        this.quizAnswers = []; // to track correct/incorrect
        
        // Activity States
        this.chatbotMessages = [];
        this.ddTargetItems = [];
        this.ddPoolItems = [];
        
        // Init App
        this.init();
    }

    init() {
        // Load data from LocalStorage if exists
        const savedName = localStorage.getItem('studentName');
        const savedScore = localStorage.getItem('studentScore');
        const savedUnlocked = localStorage.getItem('levelsUnlocked');
        const savedCompleted = localStorage.getItem('quizCompleted');

        if (savedName) {
            this.studentName = savedName;
            this.score = parseInt(savedScore) || 0;
            if (savedUnlocked) this.levelsUnlocked = JSON.parse(savedUnlocked);
            if (savedCompleted) this.quizCompleted = JSON.parse(savedCompleted);
            
            this.updateProfileUI();
            this.showView('home');
        } else {
            this.showView('setup');
        }

        // Set date in certificate
        const dateSpan = document.getElementById('cert-date');
        if (dateSpan) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateSpan.textContent = new Date().toLocaleDateString('th-TH', options);
        }
        
        // Add event listener for name enter key
        const nameInput = document.getElementById('student-name');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveProfile();
            });
        }
    }

    // Save profile name
    saveProfile() {
        const input = document.getElementById('student-name');
        const name = input.value.trim();
        if (!name) {
            alert('กรุณากรอกชื่อเล่นด้วยนะค้าบ! 😊');
            return;
        }
        this.studentName = name;
        this.score = 0;
        this.levelsUnlocked = { 1: true, 2: false, 3: false };
        this.quizCompleted = { 1: false, 2: false, 3: false };

        localStorage.setItem('studentName', name);
        localStorage.setItem('studentScore', this.score);
        localStorage.setItem('levelsUnlocked', JSON.stringify(this.levelsUnlocked));
        localStorage.setItem('quizCompleted', JSON.stringify(this.quizCompleted));

        this.updateProfileUI();
        this.showView('home');
    }

    updateProfileUI() {
        const userBadge = document.getElementById('user-badge');
        const nameSpan = document.getElementById('user-display-name');
        const scoreSpan = document.getElementById('user-display-score');
        const certName = document.getElementById('cert-student-name');

        if (userBadge) userBadge.style.display = 'flex';
        if (nameSpan) nameSpan.textContent = `น้อง${this.studentName}`;
        if (scoreSpan) scoreSpan.textContent = `Score: ${this.score}`;
        if (certName) certName.textContent = `น้อง${this.studentName}`;

        // Update home screen levels
        this.updateLevelsUI();
    }

    updateLevelsUI() {
        for (let lvl = 1; lvl <= 3; lvl++) {
            const card = document.getElementById(`card-lvl-${lvl}`);
            const badge = document.getElementById(`badge-lvl-${lvl}`);
            const pb = document.getElementById(`pb-lvl-${lvl}`);

            if (!card) continue;

            if (this.levelsUnlocked[lvl]) {
                card.classList.remove('locked');
                if (badge && lvl > 1) badge.textContent = '🔓 เริ่มเรียน';
                if (badge && lvl > 1) badge.style.background = 'var(--success-light)';
                if (badge && lvl > 1) badge.style.color = 'var(--success)';
            } else {
                card.classList.add('locked');
                if (badge) badge.textContent = '🔒 ล็อก';
            }

            // Set progress bar width
            if (pb) {
                pb.style.width = this.quizCompleted[lvl] ? '100%' : (this.levelsUnlocked[lvl] ? '20%' : '0%');
            }
        }

        // Show certificate button if all quizzes are completed
        const certBanner = document.getElementById('cert-unlocked-banner');
        if (certBanner) {
            const allDone = this.quizCompleted[1] && this.quizCompleted[2] && this.quizCompleted[3];
            certBanner.style.display = allDone ? 'block' : 'none';
        }
    }

    // Navigation and rendering
    showView(viewName) {
        // Hide all views
        document.getElementById('view-setup').style.display = 'none';
        document.getElementById('view-home').style.display = 'none';
        document.getElementById('view-lesson').style.display = 'none';
        document.getElementById('view-quiz').style.display = 'none';
        document.getElementById('view-certificate').style.display = 'none';

        // Remove active class from nav
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

        // Show selected view
        if (viewName === 'setup') {
            document.getElementById('view-setup').style.display = 'block';
        } else if (viewName === 'home') {
            document.getElementById('view-home').style.display = 'block';
            document.getElementById('nav-home').classList.add('active');
            this.updateLevelsUI();
        } else if (viewName === 'lesson') {
            document.getElementById('view-lesson').style.display = 'block';
            const navId = this.currentLevel === 1 ? 'nav-greetings' : (this.currentLevel === 2 ? 'nav-personal' : 'nav-routines');
            document.getElementById(navId).classList.add('active');
        } else if (viewName === 'quiz') {
            document.getElementById('view-quiz').style.display = 'block';
        } else if (viewName === 'certificate') {
            document.getElementById('view-certificate').style.display = 'block';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startLevel(levelNum) {
        if (!this.levelsUnlocked[levelNum]) {
            alert('กรุณาผ่านแบบทดสอบในบทเรียนก่อนหน้าก่อนนะค้าบ 🔒🤖');
            return;
        }
        this.currentLevel = levelNum;
        
        // Update sidebar title
        const sidebarTitle = document.getElementById('lesson-sidebar-title');
        const levelTitles = {
            1: 'บทที่ 1: Greetings',
            2: 'บทที่ 2: Personal Info',
            3: 'บทที่ 3: Daily Routines'
        };
        sidebarTitle.textContent = levelTitles[levelNum];

        // Start subpage
        this.showSubPage('theory');
        this.showView('lesson');
    }

    autoStartNextLevel() {
        if (!this.levelsUnlocked[2]) {
            this.startLevel(1);
        } else if (!this.levelsUnlocked[3]) {
            this.startLevel(2);
        } else if (this.quizCompleted[3]) {
            this.showView('certificate');
        } else {
            this.startLevel(3);
        }
    }

    showSubPage(subPageName) {
        this.currentSubPage = subPageName;
        
        // Update sidebar links
        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
        
        let itemId = 'sb-theory';
        if (subPageName === 'theory') itemId = 'sb-theory';
        else if (subPageName === 'vocab') itemId = 'sb-vocab';
        else if (subPageName === 'activity') itemId = 'sb-activity';
        else if (subPageName === 'quiz') itemId = 'sb-quiz';
        
        document.getElementById(itemId).classList.add('active');

        // Render page body
        this.renderLessonBody();
    }

    // Speaks English text using SpeechSynthesis
    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.85; // Slow rate for primary school students
            window.speechSynthesis.speak(utterance);
        } else {
            console.log('Speech synthesis not supported in this browser.');
        }
    }

    // Render dynamically depending on level and subpage
    renderLessonBody() {
        const body = document.getElementById('lesson-body-content');
        const title = document.getElementById('lesson-title');
        const subtitle = document.getElementById('lesson-subtitle');

        body.innerHTML = ''; // Clear

        if (this.currentLevel === 1) {
            // LEVEL 1: GREETINGS
            if (this.currentSubPage === 'theory') {
                title.textContent = 'Greetings & Hello World!';
                subtitle.textContent = 'เรียนรู้คำทักทายของมนุษย์ และประโยคแรกในการเขียนโปรแกรม';
                
                body.innerHTML = `
                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-graduation-cap"></i> 1. การทักทายในชีวิตจริง (Human Greetings)</h3>
                        <p>เมื่อเราเจอเพื่อนใหม่ในโรงเรียน เราจะทักทายเป็นภาษาอังกฤษง่ายๆ เช่น:</p>
                        
                        <div class="dialog-container">
                            <div class="dialog-bubble robot">
                                <div class="dialog-name">🧑‍🚀 Robot Guide</div>
                                <div class="dialog-text"><strong>"Hello! / Hi!"</strong></div>
                                <div class="dialog-translation">(สวัสดี!) - ใช้ทักทายทั่วไป</div>
                            </div>
                            <div class="dialog-bubble user">
                                <div class="dialog-name">น้อง${this.studentName} (คุณ)</div>
                                <div class="dialog-text"><strong>"Good morning!"</strong></div>
                                <div class="dialog-translation">(สวัสดีตอนเช้า!) - ใช้ในเวลาเช้าถึงเที่ยง</div>
                            </div>
                        </div>
                        
                        <p>นอกจากนี้ ยังมีคำทักทายตามช่วงเวลาอื่นๆ อีกนะจ๊ะ:</p>
                        <ul>
                            <li><strong>Good afternoon!</strong> (สวัสดีตอนบ่าย) - หลังเที่ยงวันถึงเย็น</li>
                            <li><strong>Good evening!</strong> (สวัสดีตอนเย็น) - ช่วงเย็นถึงค่ำ</li>
                            <li><strong>Nice to meet you!</strong> (ยินดีที่ได้รู้จัก) - ใช้เวลาเจอเพื่อนใหม่ครั้งแรก</li>
                        </ul>
                    </div>

                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-code"></i> 2. การทักทายในโลกคอมพิวเตอร์ (Hello World)</h3>
                        <p>รู้หรือไม่? เมื่อนักเขียนโปรแกรม (Programmer) เริ่มหัดเขียนภาษาใหม่ๆ ประโยคแรกที่พวกเขาสอนให้คอมพิวเตอร์พ่นข้อความทักทายออกมาก็คือคำว่า <strong>"Hello World"</strong> (สวัสดีชาวโลก!) นั่นเองครับ!</p>
                        <p>ในภาษาคอมพิวเตอร์ เราจะใช้คำสั่งแสดงผลทางหน้าจอ เช่น:</p>
                        <div class="code-block">
                            <span class="code-comment">// ตัวอย่างโค้ดในภาษา JavaScript</span><br>
                            <span class="code-keyword">console</span>.<span class="code-variable">log</span>(<span class="code-string">"Hello World!"</span>);<br>
                            <span class="code-keyword">console</span>.<span class="code-variable">log</span>(<span class="code-string">"Nice to meet you!"</span>);
                        </div>
                        <p><strong>เปรียบเทียบตรรกะคอมพิวเตอร์:</strong></p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background: white; border-radius: var(--border-radius-sm); overflow: hidden;">
                            <tr style="background: var(--primary); color: white;">
                                <th style="padding: 10px; text-align: left;">คำสั่งมนุษย์ (English)</th>
                                <th style="padding: 10px; text-align: left;">คำสั่งเขียนโปรแกรม (Code)</th>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--primary-light);">
                                <td style="padding: 10px;">พูดทักทาย "สวัสดี"</td>
                                <td style="padding: 10px;"><code>print("Hello")</code> หรือ <code>console.log("Hello")</code></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">ยินดีที่ได้รู้จัก</td>
                                <td style="padding: 10px;"><code>print("Nice to meet you")</code></td>
                            </tr>
                        </table>
                    </div>

                    <div class="lesson-footer">
                        <div></div>
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')">เรียนคำศัพท์ต่อ <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'vocab') {
                title.textContent = 'คำศัพท์น่ารู้ (Vocabulary)';
                subtitle.textContent = 'คลิกลำโพงเพื่อฟังเสียงพากย์ภาษาอังกฤษแสนสนุก!';
                
                body.innerHTML = `
                    <p style="margin-bottom: 20px;">มาฝึกออกเสียงและจำความหมายของคำศัพท์ที่พบบ่อยในบทนี้กันนะ:</p>
                    
                    <div class="vocab-grid">
                        <div class="vocab-card">
                            <div class="vocab-word">Hello</div>
                            <span class="vocab-pronounce" onclick="app.speak('Hello')"><i class="fa-solid fa-volume-high"></i> [เฮล-โล]</span>
                            <div class="vocab-meaning">สวัสดี</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Good morning</div>
                            <span class="vocab-pronounce" onclick="app.speak('Good morning')"><i class="fa-solid fa-volume-high"></i> [กูด มอร์-นิ่ง]</span>
                            <div class="vocab-meaning">สวัสดีตอนเช้า</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Good afternoon</div>
                            <span class="vocab-pronounce" onclick="app.speak('Good afternoon')"><i class="fa-solid fa-volume-high"></i> [กูด อาฟ-เตอร์-นูน]</span>
                            <div class="vocab-meaning">สวัสดีตอนบ่าย</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Good evening</div>
                            <span class="vocab-pronounce" onclick="app.speak('Good evening')"><i class="fa-solid fa-volume-high"></i> [กูด อีฟ-นิ่ง]</span>
                            <div class="vocab-meaning">สวัสดีตอนเย็น</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Nice to meet you</div>
                            <span class="vocab-pronounce" onclick="app.speak('Nice to meet you')"><i class="fa-solid fa-volume-high"></i> [ไนซ์ ทู มีต ยู]</span>
                            <div class="vocab-meaning">ยินดีที่ได้รู้จัก</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Print</div>
                            <span class="vocab-pronounce" onclick="app.speak('Print')"><i class="fa-solid fa-volume-high"></i> [ปริ้นต์]</span>
                            <div class="vocab-meaning">คำสั่งแสดงผลบนหน้าจอ</div>
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('theory')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-primary" onclick="app.showSubPage('activity')">ลองกิจกรรมแสนสนุก <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'activity') {
                title.textContent = 'กิจกรรม: ทดลองคุยกับพี่โรบอท!';
                subtitle.textContent = 'มาพิมพ์ทักทายพี่โรบอทเป็นภาษาอังกฤษ แล้วดูโค้ดผลลัพธ์กัน!';
                
                body.innerHTML = `
                    <p>ลองทักทายพี่โรบอทด้วยคำศัพท์ภาษาอังกฤษ เช่น <strong>hello</strong>, <strong>good morning</strong>, หรือ <strong>nice to meet you</strong> ดูสิครับ!</p>
                    
                    <div class="chatbot-box">
                        <div class="chatbot-header">
                            <i class="fa-solid fa-robot"></i> พี่บอท EngProg ทักทายคุณ
                        </div>
                        <div class="chatbot-messages" id="chatbot-msg-area">
                            <div class="chatbot-bubble bot">
                                Hello! I am EngProg Bot. What is your name? (สวัสดี! ฉันคือพี่บอท EngProg คุณชื่ออะไรเหรอ?)
                            </div>
                        </div>
                        <div class="chatbot-input-container">
                            <input type="text" class="chatbot-input" id="chatbot-input-text" placeholder="พิมพ์คำตอบภาษาอังกฤษที่นี่..." autocomplete="off">
                            <button class="chatbot-send" onclick="app.sendChatbotMessage()">ส่ง <i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-accent" onclick="app.showSubPage('quiz')">ทำแบบทดสอบประจำบท <i class="fa-solid fa-circle-question"></i></button>
                    </div>
                `;
                // Add enter key event for chatbot input
                setTimeout(() => {
                    const cbInput = document.getElementById('chatbot-input-text');
                    if (cbInput) {
                        cbInput.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') this.sendChatbotMessage();
                        });
                    }
                }, 100);
            } else if (this.currentSubPage === 'quiz') {
                title.textContent = 'แบบทดสอบบทที่ 1: Greetings';
                subtitle.textContent = 'วัดความรู้ตามหลัก Bloom\'s Taxonomy (ผ่านเกณฑ์ 4 จาก 6 ข้อเพื่อผ่านด่าน!)';
                
                body.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <i class="fa-solid fa-clipboard-question" style="font-size: 5rem; color: var(--primary); margin-bottom: 20px;"></i>
                        <h3>พร้อมที่จะทำแบบทดสอบหรือยังครับน้อง${this.studentName}?</h3>
                        <p style="margin-bottom: 30px; color: var(--text-muted);">ทำแบบทดสอบวัดความจำ ความเข้าใจ และความเข้าใจตรรกะโปรแกรมเพื่อปลดล็อกบทเรียนถัดไปกัน!</p>
                        <button class="btn btn-accent btn-lg" onclick="app.startQuiz(1)">
                            <i class="fa-solid fa-circle-check"></i> เริ่มทำแบบทดสอบเลย!
                        </button>
                    </div>
                `;
            }
        } else if (this.currentLevel === 2) {
            // LEVEL 2: PERSONAL INFORMATION
            if (this.currentSubPage === 'theory') {
                title.textContent = 'Personal Information & Variables';
                subtitle.textContent = 'การแนะนำตัว และแนวคิดการเก็บข้อมูลของคอมพิวเตอร์';
                
                body.innerHTML = `
                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-graduation-cap"></i> 1. แนะนำตัวภาษาอังกฤษอย่างไรดี? (Introducing Yourself)</h3>
                        <p>เวลาเราต้องการบอกเรื่องราวของเราให้คนอื่นฟัง เรามักจะตอบคำถามเหล่านี้ครับ:</p>
                        <ul>
                            <li><strong>"What is your name?"</strong> (คุณชื่ออะไร) -> <strong>"My name is..."</strong> (ฉันชื่อ...)</li>
                            <li><strong>"How old are you?"</strong> (อายุเท่าไหร่) -> <strong>"I am ... years old."</strong> (ฉันอายุ...)</li>
                            <li><strong>"What is your hobby?"</strong> (งานอดิเรกคืออะไร) -> <strong>"My hobby is..."</strong> (งานอดิเรกของฉันคือ...)</li>
                        </ul>
                    </div>

                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-code"></i> 2. แนวคิด "ตัวแปร (Variables)" ในการเขียนโปรแกรม</h3>
                        <p>ในคอมพิวเตอร์ ข้อมูลแนะนำตัวจะถูกเก็บไว้ในสิ่งที่เรียกว่า <strong>"ตัวแปร (Variable)"</strong> เปรียบเสมือน <em>"กล่องของเล่น"</em> ที่แปะชื่อป้ายกล่องไว้ และด้านในเก็บข้อมูลของน้องๆ ไว้ครับ!</p>
                        
                        <div class="var-interactive">
                            <h4>ลองเติมข้อมูลสร้างตัวแปรของตัวเองด้านล่างนี้ดูนะ!</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
                                <div>
                                    <label style="font-size: 0.85rem; font-weight:700; color:var(--primary-dark);">ชื่อเล่นภาษาอังกฤษ</label>
                                    <input type="text" id="var-name-input" class="input-control" value="Mook" oninput="app.updateVariableBox()">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; font-weight:700; color:var(--primary-dark);">อายุ (ตัวเลข)</label>
                                    <input type="number" id="var-age-input" class="input-control" value="10" oninput="app.updateVariableBox()">
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; font-weight:700; color:var(--primary-dark);">งานอดิเรก (ภาษาอังกฤษ)</label>
                                    <input type="text" id="var-hobby-input" class="input-control" value="Drawing" oninput="app.updateVariableBox()">
                                </div>
                            </div>

                            <div class="code-block" style="margin-top: 20px;">
                                <span class="code-comment">// คอมพิวเตอร์สร้างกล่องตัวแปรเก็บข้อมูลของน้องๆ</span><br>
                                <span class="code-keyword">let</span> <span class="code-variable">nickname</span> = <span class="code-string">"<span id="code-var-name">Mook</span>"</span>;<br>
                                <span class="code-keyword">let</span> <span class="code-variable">age</span> = <span class="code-number"><span id="code-var-age">10</span></span>;<br>
                                <span class="code-keyword">let</span> <span class="code-variable">hobby</span> = <span class="code-string">"<span id="code-var-hobby">Drawing</span>"</span>;<br><br>
                                <span class="code-comment">// นำข้อมูลมาต่อกันแล้วแสดงผลทางจอภาพ</span><br>
                                <span class="code-keyword">console</span>.<span class="code-variable">log</span>(<span class="code-string">"Hello! My name is "</span> + <span class="code-variable">nickname</span> + <span class="code-string">". I am "</span> + <span class="code-variable">age</span> + <span class="code-string">" years old. My hobby is "</span> + <span class="code-variable">hobby</span> + <span class="code-string">"."</span>);
                            </div>

                            <div class="var-display">
                                🖥️ <strong>ผลลัพธ์บนหน้าจอคอมพิวเตอร์ (Output):</strong><br>
                                <span id="var-output-text" style="color: var(--success); font-weight: bold;">"Hello! My name is Mook. I am 10 years old. My hobby is Drawing."</span>
                            </div>
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <div></div>
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')">เรียนคำศัพท์ต่อ <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
                setTimeout(() => this.updateVariableBox(), 50);
            } else if (this.currentSubPage === 'vocab') {
                title.textContent = 'คำศัพท์น่ารู้ (Vocabulary)';
                subtitle.textContent = 'คลิกลำโพงเพื่อฟังเสียงพากย์ภาษาอังกฤษแสนสนุก!';
                
                body.innerHTML = `
                    <p style="margin-bottom: 20px;">คำศัพท์เกี่ยวกับการบอกข้อมูลส่วนตัวที่เด็กป.4 ต้องรู้:</p>
                    
                    <div class="vocab-grid">
                        <div class="vocab-card">
                            <div class="vocab-word">Name</div>
                            <span class="vocab-pronounce" onclick="app.speak('Name')"><i class="fa-solid fa-volume-high"></i> [เนม]</span>
                            <div class="vocab-meaning">ชื่อ</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Age</div>
                            <span class="vocab-pronounce" onclick="app.speak('Age')"><i class="fa-solid fa-volume-high"></i> [เอจ]</span>
                            <div class="vocab-meaning">อายุ</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Hobby</div>
                            <span class="vocab-pronounce" onclick="app.speak('Hobby')"><i class="fa-solid fa-volume-high"></i> [ฮ็อบ-บี้]</span>
                            <div class="vocab-meaning">งานอดิเรก</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Favorite color</div>
                            <span class="vocab-pronounce" onclick="app.speak('Favorite color')"><i class="fa-solid fa-volume-high"></i> [เฟ-เวอ-ริท คัล-เลอร์]</span>
                            <div class="vocab-meaning">สีที่ชอบ</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Variable</div>
                            <span class="vocab-pronounce" onclick="app.speak('Variable')"><i class="fa-solid fa-volume-high"></i> [แว-ริ-เอ-เบิ้ล]</span>
                            <div class="vocab-meaning">ตัวแปร (กล่องเก็บข้อมูล)</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Let / Var</div>
                            <span class="vocab-pronounce" onclick="app.speak('Let')"><i class="fa-solid fa-volume-high"></i> [เล็ต]</span>
                            <div class="vocab-meaning">คำสั่งประกาศตัวแปร (จองพื้นที่ในหน่วยความจำ)</div>
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('theory')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-primary" onclick="app.showSubPage('activity')">เล่นเกมจับคู่กล่องตัวแปร <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'activity') {
                title.textContent = 'กิจกรรม: จัดการตัวแปรประมวลผลข้อมูล!';
                subtitle.textContent = 'ลากป้ายข้อมูลด้านซ้าย ไปใส่กล่องหน่วยความจำด้านขวาให้ตรงความหมายเพื่อประมวลผลประโยคแนะนำตัว!';
                
                body.innerHTML = `
                    <p>จับคู่ข้อมูลด้านล่างให้ถูกต้อง จากนั้นลองกดปุ่ม <strong>"Run Program"</strong> เพื่อแสดงความสามารถการเขียนโปรแกรมของน้องๆ นะค้าบ!</p>
                    
                    <div class="dd-container">
                        <!-- Left Pool -->
                        <div>
                            <div class="dd-header">🌟 ค่าตัวแปร (Values)</div>
                            <div class="dd-pool" id="var-game-pool">
                                <div class="dd-card" draggable="true" id="drag-hobby" ondragstart="app.drag(event)">"Reading Books" (งานอดิเรก)</div>
                                <div class="dd-card" draggable="true" id="drag-age" ondragstart="app.drag(event)">10 (เลขอายุ)</div>
                                <div class="dd-card" draggable="true" id="drag-name" ondragstart="app.drag(event)">"Mukrawee" (ชื่อเล่น)</div>
                            </div>
                        </div>

                        <!-- Right Targets -->
                        <div>
                            <div class="dd-header">📦 ชื่อตัวแปรในหน่วยความจำ (Variables)</div>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                <div style="background: white; padding: 15px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium);">
                                    <strong>let <span style="color:var(--primary);">nickname</span> = </strong>
                                    <div class="dd-target" id="target-name" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'name')" style="min-height:60px; padding: 5px;"></div>
                                </div>
                                <div style="background: white; padding: 15px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium);">
                                    <strong>let <span style="color:var(--primary);">age</span> = </strong>
                                    <div class="dd-target" id="target-age" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'age')" style="min-height:60px; padding: 5px;"></div>
                                </div>
                                <div style="background: white; padding: 15px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium);">
                                    <strong>let <span style="color:var(--primary);">hobby</span> = </strong>
                                    <div class="dd-target" id="target-hobby" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'hobby')" style="min-height:60px; padding: 5px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                        <button class="btn btn-accent" onclick="app.checkVariableGame()"><i class="fa-solid fa-play"></i> Run Program (ตรวจคำตอบ)</button>
                    </div>

                    <div id="var-game-result" class="code-block" style="display:none;">
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-accent" onclick="app.showSubPage('quiz')">ทำแบบทดสอบประจำบท <i class="fa-solid fa-circle-question"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'quiz') {
                title.textContent = 'แบบทดสอบบทที่ 2: Personal Information';
                subtitle.textContent = 'วัดความรู้ตามหลัก Bloom\'s Taxonomy (ผ่านเกณฑ์ 4 จาก 6 ข้อเพื่อผ่านด่าน!)';
                
                body.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <i class="fa-solid fa-clipboard-question" style="font-size: 5rem; color: var(--primary); margin-bottom: 20px;"></i>
                        <h3>พร้อมที่จะทำแบบทดสอบหรือยังครับน้อง${this.studentName}?</h3>
                        <p style="margin-bottom: 30px; color: var(--text-muted);">ทำแบบทดสอบเรื่องตัวแปรและการแนะนำตัว เพื่อผ่านเข้าสู่ด่านถัดไป!</p>
                        <button class="btn btn-accent btn-lg" onclick="app.startQuiz(2)">
                            <i class="fa-solid fa-circle-check"></i> เริ่มทำแบบทดสอบเลย!
                        </button>
                    </div>
                `;
            }
        } else if (this.currentLevel === 3) {
            // LEVEL 3: DAILY ROUTINES
            if (this.currentSubPage === 'theory') {
                title.textContent = 'Daily Routines & Algorithms/Loops';
                subtitle.textContent = 'กิจวัตรประจำวัน และการทำงานซ้ำวนลูปของคอมพิวเตอร์';
                
                body.innerHTML = `
                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-graduation-cap"></i> 1. กิจวัตรประจำวัน (Daily Routines)</h3>
                        <p>กิจวัตรประจำวัน คือสิ่งที่เราทำเป็นลำดับขั้นตอนสม่ำเสมอทุกวัน เช่น:</p>
                        <ul>
                            <li><strong>Wake up</strong> (ตื่นนอน)</li>
                            <li><strong>Wash face</strong> (ล้างหน้า)</li>
                            <li><strong>Brush teeth</strong> (แปรงฟัน)</li>
                            <li><strong>Take a shower</strong> (อาบน้ำ)</li>
                            <li><strong>Go to school</strong> (ไปโรงเรียน)</li>
                            <li><strong>Go to sleep</strong> (เข้านอน)</li>
                        </ul>
                    </div>

                    <div class="lesson-section">
                        <h3><i class="fa-solid fa-code"></i> 2. การเรียงลำดับขั้นตอน (Algorithm) และการทำซ้ำ (Loops)</h3>
                        <p>ในการเขียนโปรแกรม เราต้องสั่งการทีละขั้นตอนจากบนลงล่างอย่างมีระเบียบ เรียกว่า <strong>อัลกอริทึม (Algorithm)</strong></p>
                        <p>แต่ถ้ามีบางขั้นตอนที่เราทำซ้ำๆ เช่น แปรงฟันให้ทั่วปาก หรือเดินเป็นก้าวซ้ำๆ มนุษย์สามารถใช้คำสั่ง <strong>"การวนซ้ำ (Loops)"</strong> เพื่อช่วยลดเวลาในการเขียนโค้ดได้!</p>
                        
                        <div class="code-block">
                            <span class="code-comment">// ตัวอย่างลำดับขั้นตอนการตื่นนอนแบบไม่มีลูป</span><br>
                            1. Wake up;<br>
                            2. Wash face;<br>
                            3. Brush teeth;<br>
                            4. Brush teeth; <span class="code-comment">// ทำซ้ำแบบนี้โค้ดจะยาวเกินไป</span>
                        </div>

                        <div class="code-block" style="border-left-color: var(--accent);">
                            <span class="code-comment">// ตัวอย่างโค้ดที่มีการใช้ Loop เพื่อลดความยาวของโค้ด</span><br>
                            1. Wake up;<br>
                            2. Wash face;<br>
                            <span class="code-keyword">repeat</span> <span class="code-number">2 times</span> {<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;Brush teeth;<br>
                            }<br>
                            3. Go to school;
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <div></div>
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')">เรียนคำศัพท์ต่อ <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'vocab') {
                title.textContent = 'คำศัพท์น่ารู้ (Vocabulary)';
                subtitle.textContent = 'คลิกลำโพงเพื่อฟังเสียงพากย์ภาษาอังกฤษแสนสนุก!';
                
                body.innerHTML = `
                    <p style="margin-bottom: 20px;">คำศัพท์การออกเสียงสำหรับกิจวัตรประจำวันและตรรกะแบบลูป:</p>
                    
                    <div class="vocab-grid">
                        <div class="vocab-card">
                            <div class="vocab-word">Wake up</div>
                            <span class="vocab-pronounce" onclick="app.speak('Wake up')"><i class="fa-solid fa-volume-high"></i> [เวก อัป]</span>
                            <div class="vocab-meaning">ตื่นนอน</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Brush teeth</div>
                            <span class="vocab-pronounce" onclick="app.speak('Brush teeth')"><i class="fa-solid fa-volume-high"></i> [บรัช ทีธ]</span>
                            <div class="vocab-meaning">แปรงฟัน</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Wash face</div>
                            <span class="vocab-pronounce" onclick="app.speak('Wash face')"><i class="fa-solid fa-volume-high"></i> [วอช เฟส]</span>
                            <div class="vocab-meaning">ล้างหน้า</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Go to school</div>
                            <span class="vocab-pronounce" onclick="app.speak('Go to school')"><i class="fa-solid fa-volume-high"></i> [โก ทู สคูล]</span>
                            <div class="vocab-meaning">ไปโรงเรียน</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Loop</div>
                            <span class="vocab-pronounce" onclick="app.speak('Loop')"><i class="fa-solid fa-volume-high"></i> [ลูป]</span>
                            <div class="vocab-meaning">การวนซ้ำ / ทำงานเดิมหลายๆ หน</div>
                        </div>
                        <div class="vocab-card">
                            <div class="vocab-word">Sequence</div>
                            <span class="vocab-pronounce" onclick="app.speak('Sequence')"><i class="fa-solid fa-volume-high"></i> [ซี-เควนส์]</span>
                            <div class="vocab-meaning">การเรียงตามลำดับ (ขั้นตอนแรกไปขั้นตอนสุดท้าย)</div>
                        </div>
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('theory')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-primary" onclick="app.showSubPage('activity')">ทดลองเขียนอัลกอริทึม <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'activity') {
                title.textContent = 'กิจกรรม: เรียงลำดับขั้นตอนประจำวัน (Algorithm)!';
                subtitle.textContent = 'ลากแผ่นคำสั่งด้านซ้าย ไปจัดลำดับในตารางประมวลผลด้านขวาตามความสำคัญก่อนหลัง!';
                
                body.innerHTML = `
                    <p>เมื่อโปรแกรมคอมพิวเตอร์ทำงาน มันจะอ่านโค้ดทีละบรรทัดจาก 1 ไปถึง 4 ลองลากการทำงานประจำวันมาจัดเรียงให้อัลกอริทึมทำงานถูกต้องนะจ๊ะ!</p>
                    
                    <div class="dd-container">
                        <!-- Left Pool -->
                        <div>
                            <div class="dd-header">🌟 การกระทำ (Actions)</div>
                            <div class="dd-pool" id="routine-game-pool">
                                <div class="dd-card" draggable="true" id="drag-routine-shower" ondragstart="app.drag(event)">Take a shower (อาบน้ำ)</div>
                                <div class="dd-card" draggable="true" id="drag-routine-sleep" ondragstart="app.drag(event)">Go to sleep (เข้านอน)</div>
                                <div class="dd-card" draggable="true" id="drag-routine-wake" ondragstart="app.drag(event)">Wake up (ตื่นนอน)</div>
                                <div class="dd-card" draggable="true" id="drag-routine-school" ondragstart="app.drag(event)">Go to school (ไปเรียน)</div>
                            </div>
                        </div>

                        <!-- Right Targets -->
                        <div>
                            <div class="dd-header">📋 ลำดับขั้นตอนอัลกอริทึม (Daily Algorithm)</div>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div style="background: white; padding: 12px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium); display:flex; align-items:center; gap: 10px;">
                                    <strong>Step 1:</strong>
                                    <div class="dd-target" id="target-r1" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'r1')" style="min-height:50px; flex-grow:1; padding: 5px;"></div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium); display:flex; align-items:center; gap: 10px;">
                                    <strong>Step 2:</strong>
                                    <div class="dd-target" id="target-r2" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'r2')" style="min-height:50px; flex-grow:1; padding: 5px;"></div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium); display:flex; align-items:center; gap: 10px;">
                                    <strong>Step 3:</strong>
                                    <div class="dd-target" id="target-r3" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'r3')" style="min-height:50px; flex-grow:1; padding: 5px;"></div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: var(--border-radius-md); border: 2px solid var(--primary-medium); display:flex; align-items:center; gap: 10px;">
                                    <strong>Step 4:</strong>
                                    <div class="dd-target" id="target-r4" ondragover="app.allowDrop(event)" ondrop="app.drop(event, 'r4')" style="min-height:50px; flex-grow:1; padding: 5px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                        <button class="btn btn-accent" onclick="app.checkRoutineGame()"><i class="fa-solid fa-play"></i> Run Code (ตรวจคำตอบ)</button>
                    </div>

                    <div id="routine-game-result" class="code-block" style="display:none;">
                    </div>

                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="app.showSubPage('vocab')"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
                        <button class="btn btn-accent" onclick="app.showSubPage('quiz')">ทำแบบทดสอบประจำบท <i class="fa-solid fa-circle-question"></i></button>
                    </div>
                `;
            } else if (this.currentSubPage === 'quiz') {
                title.textContent = 'แบบทดสอบบทที่ 3: Daily Routines';
                subtitle.textContent = 'วัดความรู้ตามหลัก Bloom\'s Taxonomy (ผ่านเกณฑ์ 4 จาก 6 ข้อเพื่อรับใบประกาศ!)';
                
                body.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <i class="fa-solid fa-clipboard-question" style="font-size: 5rem; color: var(--primary); margin-bottom: 20px;"></i>
                        <h3>พร้อมที่จะทำแบบทดสอบหรือยังครับน้อง${this.studentName}?</h3>
                        <p style="margin-bottom: 30px; color: var(--text-muted);">ทำแบบทดสอบความเข้าใจลำดับอัลกอริทึมและวนลูปเพื่อเรียนจบหลักสูตร!</p>
                        <button class="btn btn-accent btn-lg" onclick="app.startQuiz(3)">
                            <i class="fa-solid fa-circle-check"></i> เริ่มทำแบบทดสอบเลย!
                        </button>
                    </div>
                `;
            }
        }
    }

    // Dynamic variable lesson interactive update
    updateVariableBox() {
        const nameVal = document.getElementById('var-name-input').value.trim() || "Mook";
        const ageVal = document.getElementById('var-age-input').value.trim() || "10";
        const hobbyVal = document.getElementById('var-hobby-input').value.trim() || "Drawing";

        document.getElementById('code-var-name').textContent = nameVal;
        document.getElementById('code-var-age').textContent = ageVal;
        document.getElementById('code-var-hobby').textContent = hobbyVal;

        document.getElementById('var-output-text').textContent = 
            `"Hello! My name is ${nameVal}. I am ${ageVal} years old. My hobby is ${hobbyVal}."`;
    }

    // Chatbot Simulator Interaction
    sendChatbotMessage() {
        const input = document.getElementById('chatbot-input-text');
        const text = input.value.trim();
        if (!text) return;

        // Add user msg
        this.addChatMsg(text, 'user');
        input.value = '';

        // Bot response delay
        setTimeout(() => {
            const reply = this.getChatbotResponse(text);
            this.addChatMsg(reply, 'bot');
            this.speak(reply); // Make chatbot read out loud!
        }, 800);
    }

    addChatMsg(text, sender) {
        const area = document.getElementById('chatbot-msg-area');
        if (!area) return;

        const bubble = document.createElement('div');
        bubble.className = `chatbot-bubble ${sender}`;
        bubble.textContent = text;
        area.appendChild(bubble);

        // Auto scroll to bottom
        area.scrollTop = area.scrollHeight;
    }

    getChatbotResponse(text) {
        const lowercaseText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
        
        if (lowercaseText.includes("hello") || lowercaseText.includes("hi")) {
            return `Hello there! Nice to meet you. I can execute console.log("Hello") for you! What is your name?`;
        }
        if (lowercaseText.includes("my name is") || lowercaseText.includes("im") || lowercaseText.includes("i am")) {
            const words = text.split(" ");
            const name = words[words.length - 1];
            return `Nice to meet you, ${name}! In code, I will save you as: let userName = "${name}". Try asking "how are you?"`;
        }
        if (lowercaseText.includes("how are you")) {
            return `I am working 100% fine! My CPU temperature is cool. Thank you for asking. How are you today?`;
        }
        if (lowercaseText.includes("good morning")) {
            return `Good morning! Time to start our compiler! Have you had breakfast?`;
        }
        if (lowercaseText.includes("good afternoon")) {
            return `Good afternoon! Ready to write some code this afternoon?`;
        }
        if (lowercaseText.includes("good evening")) {
            return `Good evening! Make sure to save your work before going to sleep.`;
        }
        if (lowercaseText.includes("nice to meet you")) {
            return `Nice to meet you too! Let's code together!`;
        }
        
        return `I received your message! In computer science, this is called: INPUT = "${text}". Try saying "hello" or "good morning"!`;
    }

    // Drag and Drop implementation
    drag(e) {
        e.dataTransfer.setData("text", e.target.id);
    }

    allowDrop(e) {
        e.preventDefault();
    }

    drop(e, targetName) {
        e.preventDefault();
        const data = e.dataTransfer.getData("text");
        const draggedCard = document.getElementById(data);
        
        // Ensure destination is empty or replace item
        const targetDiv = document.getElementById(`target-${targetName}`);
        if (targetDiv.children.length === 0) {
            targetDiv.appendChild(draggedCard);
        } else {
            // Put old card back to pool
            const oldCard = targetDiv.children[0];
            const pool = document.getElementById(this.currentLevel === 2 ? 'var-game-pool' : 'routine-game-pool');
            pool.appendChild(oldCard);
            targetDiv.appendChild(draggedCard);
        }
    }

    // Checking drag-drop game responses
    checkVariableGame() {
        const nameCard = document.getElementById('target-name').children[0];
        const ageCard = document.getElementById('target-age').children[0];
        const hobbyCard = document.getElementById('target-hobby').children[0];

        const resultBox = document.getElementById('var-game-result');
        resultBox.style.display = 'block';

        if (!nameCard || !ageCard || !hobbyCard) {
            resultBox.style.borderLeftColor = 'var(--accent)';
            resultBox.innerHTML = `<span style="color:var(--accent);">❌ คอมไพล์ไม่ผ่าน (Compile Error):</span> กรุณาลากข้อมูลใส่ลงในตัวแปรทั้ง 3 กล่องให้ครบนะค้าบ!`;
            return;
        }

        const nameOk = nameCard.id === 'drag-name';
        const ageOk = ageCard.id === 'drag-age';
        const hobbyOk = hobbyCard.id === 'drag-hobby';

        if (nameOk && ageOk && hobbyOk) {
            resultBox.style.borderLeftColor = 'var(--success)';
            resultBox.innerHTML = `
                <span style="color:var(--success);">🎉 คอมไพล์สำเร็จ (Compile Success!):</span><br>
                <span class="code-keyword">let</span> nickname = <span class="code-string">"Mukrawee"</span>;<br>
                <span class="code-keyword">let</span> age = <span class="code-number">10</span>;<br>
                <span class="code-keyword">let</span> hobby = <span class="code-string">"Reading Books"</span>;<br><br>
                🖥️ <strong>Output:</strong> "Hello! My name is Mukrawee. I am 10 years old. My hobby is Reading Books."<br>
                <span style="color:var(--success); font-weight:bold;">เก่งมากครับ! ปลดล็อกแบบทดสอบเรียบร้อยแล้ว! (+10 คะแนน)</span>
            `;
            this.addScore(10);
        } else {
            resultBox.style.borderLeftColor = 'var(--warning)';
            resultBox.innerHTML = `
                <span style="color:var(--warning);">⚠️ คำเตือน (Warning):</span> จัดเรียงตัวแปรผิดชนิดข้อความ! ลองดูคำแปลในป้ายสีแล้วสลับสับเปลี่ยนกล่องให้ตรงชนิดตัวแปรอีกครั้งนะจ๊ะ
            `;
        }
    }

    checkRoutineGame() {
        const r1 = document.getElementById('target-r1').children[0];
        const r2 = document.getElementById('target-r2').children[0];
        const r3 = document.getElementById('target-r3').children[0];
        const r4 = document.getElementById('target-r4').children[0];

        const resultBox = document.getElementById('routine-game-result');
        resultBox.style.display = 'block';

        if (!r1 || !r2 || !r3 || !r4) {
            resultBox.style.borderLeftColor = 'var(--accent)';
            resultBox.innerHTML = `<span style="color:var(--accent);">❌ ลำดับไม่สมบูรณ์:</span> กรุณาลากขั้นตอนใส่ตารางประมวลผลให้ครบทั้ง 4 ช่องนะจ๊ะ!`;
            return;
        }

        const ok1 = r1.id === 'drag-routine-wake';
        const ok2 = r2.id === 'drag-routine-shower';
        const ok3 = r3.id === 'drag-routine-school';
        const ok4 = r4.id === 'drag-routine-sleep';

        if (ok1 && ok2 && ok3 && ok4) {
            resultBox.style.borderLeftColor = 'var(--success)';
            resultBox.innerHTML = `
                <span style="color:var(--success);">🎉 อัลกอริทึมถูกต้องสมบูรณ์ (Daily Routine Success!):</span><br>
                1. Wake up (ตื่นนอน)<br>
                2. Take a shower (อาบน้ำ)<br>
                3. Go to school (ไปเรียน)<br>
                4. Go to sleep (เข้านอน)<br><br>
                🖥️ <strong>Output:</strong> ทุกกิจกรรมถูกเรียงลำดับเวลาอย่างมีตรรกะ เรียบร้อยดีมากจ้า! (+10 คะแนน)
            `;
            this.addScore(10);
        } else {
            resultBox.style.borderLeftColor = 'var(--warning)';
            resultBox.innerHTML = `
                <span style="color:var(--warning);">⚠️ ตรรกะผิดพลาด (Logic Bug):</span> เอ๊ะ! ลำดับขั้นตอนดูสลับกันแปลกๆ นะครับ เช่น เข้านอนก่อนตื่นนอน หรือไปโรงเรียนก่อนอาบน้ำหรือเปล่า? ลองลากจัดลำดับสลับที่ใหม่อีกครั้งนะน้องๆ
            `;
        }
    }

    addScore(pts) {
        this.score += pts;
        localStorage.setItem('studentScore', this.score);
        this.updateProfileUI();
    }

    // Quiz Questions database according to Bloom's Taxonomy
    getQuestions(lvl) {
        if (lvl === 1) {
            return [
                {
                    taxonomy: "Remembering (ความรู้-จำ)",
                    question: "ในวิชาการเขียนโปรแกรมคอมพิวเตอร์ ประโยคแรกที่เป็นธรรมเนียมใช้สั่งให้โปรแกรมแสดงผลการทักทายคือคำว่าอะไร?",
                    options: ["Hello World", "Goodbye Moon", "Start Computer", "Welcome Game"],
                    correct: 0
                },
                {
                    taxonomy: "Understanding (ความเข้าใจ)",
                    question: "ประโยคในข้อใด เป็นคำทักทายภาษาอังกฤษแบบสุภาพที่ควรใช้เมื่อพบปะผู้คนในช่วงเช้าตรู่ (เวลา 08.00 น.)?",
                    options: ["Good afternoon", "Good morning", "Good evening", "Goodnight"],
                    correct: 1
                },
                {
                    taxonomy: "Applying (การประยุกต์ใช้)",
                    question: "ถ้าน้องพิมพ์โค้ดสั่งคอมพิวเตอร์ว่า console.log(\"Nice to meet you!\") คอมพิวเตอร์จะประมวลผลและมีคำว่าอะไรแสดงขึ้นที่หน้าจอ?",
                    options: ["console.log", "Hello World", "Nice to meet you!", "ไม่มีข้อความใดขึ้นเลย"],
                    correct: 2
                },
                {
                    taxonomy: "Analyzing (การวิเคราะห์)",
                    question: "น้องบีกำลังแก้โค้ดโปรแกรมแชตบอตทักทายผู้ใช้ แต่ตรวจพบบั๊กบางอย่างในคู่สนทนานี้ ข้อใดคือประโยคที่ 'ไม่เหมาะสม' หรือแปลกประหลาดที่สุดจากข้อความสนทนา?\nA: \"How are you?\"\nB: \"__________\"",
                    options: ["I'm fine, thank you.", "Hello World!", "I'm very good.", "I am happy."],
                    correct: 1
                },
                {
                    taxonomy: "Evaluating (การประเมินค่า)",
                    question: "นักเรียนคิดว่า เพราะเหตุใดโปรแกรมคอมพิวเตอร์จึงจำเป็นต้องมีคำสั่งทักทาย (Greetings) แสดงผลบนหน้าจอเมื่อเริ่มต้นการใช้งาน?",
                    options: [
                        "เพราะคอมพิวเตอร์จะพังถ้าไม่แสดงการทักทายก่อน", 
                        "เพื่อให้ผู้ใช้งานรู้สถานะว่าโปรแกรมพร้อมทำงานแล้ว และสร้างความรู้สึกที่เป็นมิตรกับผู้ใช้งาน", 
                        "เพื่อตรวจสอบความคมชัดของเม็ดพิกเซลบนหน้าจอคอมพิวเตอร์เท่านั้น", 
                        "เป็นกฎข้อบังคับทางกฎหมายสากล"
                    ],
                    correct: 1
                },
                {
                    taxonomy: "Creating (การคิดสร้างสรรค์)",
                    question: "หากต้องการสร้างแชตบอตให้น่ารักและสุภาพ โดยต้องเรียงลำดับการพูด 3 ประโยคดังนี้: [1] ยินดีที่ได้รู้จัก, [2] สวัสดีตอนเช้า, [3] วันนี้เป็นอย่างไรบ้าง ลำดับการสั่งเขียนโค้ดแสดงคำพูดข้อใดเหมาะสมที่สุด?",
                    options: [
                        "2 -> 1 -> 3 (Good morning -> Nice to meet you -> How are you today?)", 
                        "3 -> 2 -> 1 (How are you today? -> Good morning -> Nice to meet you)", 
                        "1 -> 3 -> 2 (Nice to meet you -> How are you today? -> Good morning)",
                        "2 -> 3 -> 1 (Good morning -> How are you today? -> Nice to meet you)"
                    ],
                    correct: 0
                }
            ];
        } else if (lvl === 2) {
            return [
                {
                    taxonomy: "Remembering (ความรู้-จำ)",
                    question: "ในการเขียนโปรแกรมคอมพิวเตอร์ คำว่า 'ตัวแปร (Variable)' เปรียบได้ดั่งสิ่งใดในโลกจริงของน้องๆ?",
                    options: ["กล่องเก็บของเล่นที่แปะป้ายชื่อไว้", "เมาส์คอมพิวเตอร์ที่ขยับได้", "กระดาษคำถามข้อสอบ", "กาวตราช้างใช้ติดกระดาษ"],
                    correct: 0
                },
                {
                    taxonomy: "Understanding (ความเข้าใจ)",
                    question: "หากประโยคโค้ดคือ let myName = \"Kong\" สิ่งใดคือ 'ค่าข้อมูล (Value)' ที่เก็บอยู่ด้านในตัวแปรกล่องนี้?",
                    options: ["let", "myName", "Kong", "="],
                    correct: 2
                },
                {
                    taxonomy: "Applying (การประยุกต์ใช้)",
                    question: "เติมประโยคพูดแนะนำตัวให้สมบูรณ์และถูกต้องตามหลักไวยากรณ์ภาษาอังกฤษ:\n\"How old ________ you?\" \"I ________ 10 years old.\"",
                    options: ["is / am", "are / am", "are / is", "am / are"],
                    correct: 1
                },
                {
                    taxonomy: "Analyzing (การวิเคราะห์)",
                    question: "นักเรียนตรวจพบบั๊กของการใช้ตัวแปรดังนี้: let age = \"สิบขวบ\" หากเราต้องการนำค่าตัวแปร age ไปใช้วัดความต่างเทียบระดับชั้นเรียนหรือคำนวณตัวเลขต่อไป ข้อความใดแก้ไขบั๊กนี้ได้ถูกต้องเหมาะสมที่สุด?",
                    options: ["let age = 10;", "let age = \"10\";", "let age = ten;", "let age = \"ten years old\";"],
                    correct: 0
                },
                {
                    taxonomy: "Evaluating (การประเมินค่า)",
                    question: "หากต้องการเก็บข้อมูลเกี่ยวกับ 'งานอดิเรกที่คุณชื่นชอบ' การตั้งชื่อป้ายตัวแปรในข้อใด สื่อสารความหมายชัดเจนและเหมาะสมที่สุดสำหรับโปรแกรมเมอร์ผู้อื่นที่จะมาอ่านโค้ดต่อ?",
                    options: ["let x = \"Reading\";", "let myHobby = \"Reading\";", "let name = \"Reading\";", "let number = \"Reading\";"],
                    correct: 1
                },
                {
                    taxonomy: "Creating (การคิดสร้างสรรค์)",
                    question: "หากต้องการเชื่อมประโยคจากตัวแปรประกาศข้างต้น: let pet = \"Cat\" เพื่อให้โปรแกรมคอมไพล์ผลลัพธ์เป็นประโยคข้อความ \"I love Cat\" ข้อความโค้ดใดที่จะสร้างผลลัพธ์ออกมาได้ถูกต้อง?",
                    options: [
                        "console.log(\"I love \" + pet);", 
                        "console.log(\"I love pet\");", 
                        "console.log(pet + \"I love\");", 
                        "console.log(\"I love\" + let pet);"
                    ],
                    correct: 0
                }
            ];
        } else if (lvl === 3) {
            return [
                {
                    taxonomy: "Remembering (ความรู้-จำ)",
                    question: "คำศัพท์คำว่า 'Daily Routines' ในวิชาภาษาอังกฤษ หมายถึงหัวข้อเกี่ยวกับอะไร?",
                    options: ["วิชาเขียนโปรแกรมคอมพิวเตอร์", "กิจวัตรประจำวันที่เราทำบ่อยๆ ทุกวัน", "การไปท่องเที่ยวที่ต่างประเทศ", "การแนะนำตัวบอกข้อมูลสัตว์เลี้ยง"],
                    correct: 1
                },
                {
                    taxonomy: "Understanding (ความเข้าใจ)",
                    question: "การใช้คำสั่ง 'วนลูป (Loop)' ในขั้นตอนอัลกอริทึมการแปรงฟัน (Brush teeth) มีประโยชน์หลักอย่างไรกับนักเขียนโปรแกรม?",
                    options: [
                        "ช่วยลดจำนวนบรรทัดของโค้ดโปรแกรมที่ซ้ำซ้อนให้สั้นกระชับ", 
                        "ช่วยสุ่มสีของยาสีฟันโดยอัตโนมัติ", 
                        "ทำให้แปรงฟันได้สะอาดกว่าการไม่ใช้ลูป", 
                        "ช่วยตรวจสอบประจุแบตเตอรี่ในแปรงฟันไฟฟ้า"
                    ],
                    correct: 0
                },
                {
                    taxonomy: "Applying (การประยุกต์ใช้)",
                    question: "หากน้องต้องการสั่งงานหุ่นยนต์ให้ทอดไข่ดาว 3 ฟอง น้องจะเขียนตรรกะแบบลูปวนซ้ำ (Loops) อย่างง่ายอย่างไรจึงจะถูกต้อง?",
                    options: [
                        "repeat 1 time { ทอดไข่ดาว }", 
                        "repeat 3 times { ทอดไข่ดาว }", 
                        "ทอดไข่ดาว 3 ครั้งเขียนบรรทัดเดิม 30 หน", 
                        "loop forever { ทอดไข่ดาว }"
                    ],
                    correct: 1
                },
                {
                    taxonomy: "Analyzing (การวิเคราะห์)",
                    question: "วิเคราะห์อัลกอริทึม (ลำดับขั้นตอนทำงาน) ของระบบจำลองโรบอตเดินออกจากห้องนอนดังนี้:\n1) Wake up (ตื่นนอน)\n2) Go to school (ไปเรียน)\n3) Take a shower (อาบน้ำ)\n4) Brush teeth (แปรงฟัน)\nข้อความใดระบุจุดผิดพลาดเชิงตรรกะ (Logic Bug) และการแก้ไขได้อย่างถูกต้อง?",
                    options: [
                        "ขั้นตอนถูกต้องดีแล้ว ไม่ต้องแก้ไขใดๆ", 
                        "ขั้นตอนที่ 2 (Go to school) เกิดก่อนการอาบน้ำและแปรงฟัน ควรย้ายข้อ 2 ไปอยู่ขั้นตอนสุดท้าย", 
                        "ควรแปรงฟันเป็นอันดับ 1 ก่อนตื่นนอน", 
                        "ย้ายการตื่นนอนไปไว้เป็นขั้นตอนที่ 4"
                    ],
                    correct: 1
                },
                {
                    taxonomy: "Evaluating (การประเมินค่า)",
                    question: "ในเชิงวิทยาการคำนวณและชีวิตจริง นักเรียนคิดว่าเหตุใดขั้นตอนลำดับอัลกอริทึม (Sequencing) จึงมีความสำคัญอย่างสูงที่สุด?",
                    options: [
                        "เพราะคอมพิวเตอร์และสิ่งของในชีวิตประจำวัน หากทำข้ามขั้นตอนหรือสลับลำดับ ผลลัพธ์อาจผิดพลาดหรือเป็นอันตรายได้", 
                        "เพราะช่วยให้การเขียนโค้ดดูซับซ้อนและเข้าใจยากขึ้น", 
                        "เพราะช่วยประหยัดไฟฟ้าเมื่อโปรแกรมทำงาน", 
                        "เพราะคอมพิวเตอร์ชอบความช้าของลำดับโค้ด"
                    ],
                    correct: 0
                },
                {
                    taxonomy: "Creating (การคิดสร้างสรรค์)",
                    question: "มาช่วยเรียงโค้ดโปรแกรมกิจกรรมยามเช้าที่เหมาะสมและรวบรัดที่สุดของน้องโปรแกรมเมอร์:\nA: repeat 2 times: print(\"Brush teeth\")\nB: print(\"Wake up\")\nC: print(\"Wash face\")",
                    options: [
                        "A -> B -> C", 
                        "B -> C -> A", 
                        "C -> A -> B", 
                        "B -> A -> C"
                    ],
                    correct: 1
                }
            ];
        }
    }

    // Start a quiz for a given level
    startQuiz(lvl) {
        this.currentLevel = lvl;
        this.quizQuestions = this.getQuestions(lvl);
        this.currentQuestionIdx = 0;
        this.quizAnswers = [];
        
        // Setup UI
        const badge = document.getElementById('quiz-level-badge');
        const qTitle = document.getElementById('quiz-level-title');
        
        const lvlNames = { 1: "Level 1: Greetings", 2: "Level 2: Personal Info", 3: "Level 3: Daily Routines" };
        badge.textContent = `Quiz - ${lvlNames[lvl]}`;
        qTitle.textContent = `แบบทดสอบบทที่ ${lvl}`;

        this.showView('quiz');
        this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        const qBox = document.getElementById('quiz-question-box');
        const pb = document.getElementById('quiz-progress-bar');
        const btnNext = document.getElementById('btn-next-question');
        const feedback = document.getElementById('quiz-feedback');

        btnNext.style.display = 'none';
        feedback.style.display = 'none';

        // Update progress bar
        const total = this.quizQuestions.length;
        const percent = (this.currentQuestionIdx / total) * 100;
        pb.style.width = `${percent}%`;

        const q = this.quizQuestions[this.currentQuestionIdx];

        qBox.innerHTML = `
            <span class="quiz-taxonomy-tag"><i class="fa-solid fa-brain"></i> ระดับ: ${q.taxonomy}</span>
            <div class="quiz-question-text">
                <strong>ข้อที่ ${this.currentQuestionIdx + 1}:</strong> ${q.question.replace(/\n/g, '<br>')}
            </div>
            <div class="quiz-options">
                ${q.options.map((opt, idx) => `
                    <button class="quiz-option" onclick="app.selectQuizOption(${idx})">
                        <span><span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span> ${opt}</span>
                        <i class="fa-solid fa-circle" id="opt-icon-${idx}" style="color:var(--primary-light);"></i>
                    </button>
                `).join('')}
            </div>
        `;
    }

    selectQuizOption(selectedIdx) {
        const q = this.quizQuestions[this.currentQuestionIdx];
        const options = document.querySelectorAll('.quiz-option');
        const feedback = document.getElementById('quiz-feedback');
        const btnNext = document.getElementById('btn-next-question');

        // Disable options after selection
        options.forEach((opt, idx) => {
            opt.removeAttribute('onclick');
            
            const icon = document.getElementById(`opt-icon-${idx}`);
            if (idx === q.correct) {
                opt.classList.add('correct');
                icon.className = 'fa-solid fa-circle-check';
                icon.style.color = 'var(--success)';
            } else if (idx === selectedIdx) {
                opt.classList.add('wrong');
                icon.className = 'fa-solid fa-circle-xmark';
                icon.style.color = 'var(--accent)';
            }
        });

        const isCorrect = (selectedIdx === q.correct);
        this.quizAnswers.push(isCorrect);

        feedback.style.display = 'block';
        if (isCorrect) {
            feedback.style.backgroundColor = 'var(--success-light)';
            feedback.style.color = 'var(--success)';
            feedback.innerHTML = `🌟 ถูกต้องแล้วจ้า! เก่งมากๆ เลยครับ (+10 คะแนน)`;
            this.addScore(10);
            this.speak("Correct! Well done!");
        } else {
            feedback.style.backgroundColor = 'var(--accent-light)';
            feedback.style.color = 'var(--accent-dark)';
            feedback.innerHTML = `😢 เอ๊ะ! ยังไม่ถูกนะจ๊ะ คำตอบที่ถูกต้องคือข้อ [${String.fromCharCode(65 + q.correct)}] ครับ`;
            this.speak("Try again next time.");
        }

        btnNext.style.display = 'inline-block';
    }

    nextQuizQuestion() {
        this.currentQuestionIdx++;
        if (this.currentQuestionIdx < this.quizQuestions.length) {
            this.renderQuizQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        const correctCount = this.quizAnswers.filter(x => x).length;
        const totalCount = this.quizQuestions.length;
        const passScore = 4; // Need 4 out of 6 correct to pass
        const isPassed = correctCount >= passScore;

        const qBox = document.getElementById('quiz-question-box');
        const btnNext = document.getElementById('btn-next-question');
        const feedback = document.getElementById('quiz-feedback');
        const pb = document.getElementById('quiz-progress-bar');

        btnNext.style.display = 'none';
        feedback.style.display = 'none';
        pb.style.width = '100%';

        let resultHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 5rem; margin-bottom: 20px;">${isPassed ? '🎉' : '🥺'}</div>
                <h3>ผลการประเมินด่านที่ ${this.currentLevel}</h3>
                <p style="font-size:1.4rem; font-weight:700; margin: 15px 0;">
                    คะแนนที่ทำได้: <span style="color:${isPassed ? 'var(--success)' : 'var(--accent-dark)'}">${correctCount} / ${totalCount}</span> ข้อ
                </p>
        `;

        if (isPassed) {
            this.quizCompleted[this.currentLevel] = true;
            
            // Unlock next level
            if (this.currentLevel < 3) {
                const nextLvl = this.currentLevel + 1;
                this.levelsUnlocked[nextLvl] = true;
                localStorage.setItem('levelsUnlocked', JSON.stringify(this.levelsUnlocked));
                
                resultHTML += `
                    <p style="color:var(--success); font-weight:700; margin-bottom: 25px;">ผ่านเกณฑ์แล้วจ้า! ปลดล็อกบทเรียนและแบบทดสอบระดับถัดไปเรียบร้อยแล้ว!</p>
                    <button class="btn btn-primary" onclick="app.showView('home')">กลับหน้าหลัก (Home)</button>
                    <button class="btn btn-accent" onclick="app.startLevel(${nextLvl})">เรียนบทเรียนถัดไปเลย! <i class="fa-solid fa-arrow-right"></i></button>
                `;
            } else {
                resultHTML += `
                    <p style="color:var(--success); font-weight:700; margin-bottom: 25px;">ยินดีด้วยจ้า! น้องผ่านด่านสุดท้ายสำเร็จ เรียนจบครบหลักสูตรแล้วครับ!</p>
                    <button class="btn btn-accent" onclick="app.showView('certificate')">
                        <i class="fa-solid fa-award"></i> ไปรับเกียรติบัตรกันเลย!
                    </button>
                `;
            }
            
            localStorage.setItem('quizCompleted', JSON.stringify(this.quizCompleted));
            this.speak("Congratulations! You passed the quiz!");
        } else {
            resultHTML += `
                <p style="color:var(--accent-dark); font-weight:700; margin-bottom: 25px;">น้องทำคะแนนยังไม่ถึงเกณฑ์ผ่านที่ 4 ข้อนะจ๊ะ ลองศึกษาบทเรียนใหม่อีกครั้งแล้วกลับมาสู้ใหม่นะบอทเป็นกำลังใจให้!</p>
                <button class="btn btn-primary" onclick="app.startLevel(${this.currentLevel})"><i class="fa-solid fa-rotate-right"></i> ทบทวนและทำอีกครั้ง</button>
                <button class="btn btn-accent" onclick="app.showView('home')">กลับหน้าหลัก (Home)</button>
            `;
            this.speak("Don't give up. Study again and retry.");
        }

        resultHTML += `</div>`;
        qBox.innerHTML = resultHTML;
        this.updateLevelsUI();
    }
}

// Global App Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
