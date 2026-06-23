import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Simple, direct knowledge base
    const getBotResponse = (message) => {
        const lowerMsg = message.toLowerCase();

        // LEAVE RELATED
        if (lowerMsg.includes('leave') && (lowerMsg.includes('apply') || lowerMsg.includes('how'))) {
            return `📝 **How to Apply for Leave:**

1. Go to your Dashboard
2. Click "My Leaves" tab
3. Click "+ Apply for Leave" button
4. Select:
   - Leave type (Vacation/Sick/Casual/etc.)
   - Start and End dates
   - Reason for leave
5. Click "Submit Request"

✅ HR will review within 2-3 business days
📧 You'll receive email notification`;
        }

        if (lowerMsg.includes('leave') && (lowerMsg.includes('balance') || lowerMsg.includes('available') || lowerMsg.includes('days'))) {
            return `📊 **Your Leave Balance:**

Check your leave balance:
1. Dashboard → "My Leaves" tab
2. View available days at the top

**Annual Leave Entitlement:**
• Vacation: 30 days/year
• Sick: 15 days/year  
• Casual: 7 days/year
• Maternity: 90 days
• Paternity: 15 days`;
        }

        if (lowerMsg.includes('leave') && lowerMsg.includes('cancel')) {
            return `❌ **Cancel Leave Request:**

To cancel a pending leave:
1. Go to "My Leaves"
2. Find your pending request
3. Click "Cancel" button

⚠️ Only pending leaves can be cancelled
⚠️ Approved leaves need HR approval to cancel`;
        }

        if (lowerMsg.includes('leave') && (lowerMsg.includes('type') || lowerMsg.includes('types'))) {
            return `📋 **Leave Types:**

We offer these leave types:

1. **Vacation Leave** - 30 days/year
2. **Sick Leave** - 15 days/year (medical cert required for 3+ days)
3. **Casual Leave** - 7 days/year
4. **Maternity Leave** - 90 days
5. **Paternity Leave** - 15 days
6. **Unpaid Leave** - As approved by HR`;
        }

        // PAYSLIP RELATED
        if (lowerMsg.includes('payslip') && (lowerMsg.includes('when') || lowerMsg.includes('time') || lowerMsg.includes('get') || lowerMsg.includes('receive'))) {
            return `💰 **Payslip Schedule:**

📅 Generated: By 5th of each month
💵 Payment: Last working day of month
📧 Email: You'll receive notification
📥 Download: "My Payslips" section

Example: March payslip available by April 5th`;
        }

        if (lowerMsg.includes('payslip') && (lowerMsg.includes('download') || lowerMsg.includes('view') || lowerMsg.includes('see'))) {
            return `📥 **Download Payslip:**

1. Go to Dashboard
2. Click "My Payslips" tab
3. Find the payslip you need
4. Click "📄 Download" button
5. PDF opens - save or print

✅ All past payslips available anytime`;
        }

        if (lowerMsg.includes('payslip') && (lowerMsg.includes('wrong') || lowerMsg.includes('error') || lowerMsg.includes('discrepancy'))) {
            return `⚠️ **Payslip Discrepancy:**

If you notice an error:

1. Download your payslip
2. Review all components
3. Contact HR immediately:
   📧 hr@company.com
   📞 +1 (555) 123-4567
4. Provide:
   - Payslip number
   - Error details
   - Supporting documents

✅ HR will resolve within 5 business days`;
        }

        if (lowerMsg.includes('salary') && (lowerMsg.includes('component') || lowerMsg.includes('detail') || lowerMsg.includes('include'))) {
            return `💵 **Salary Components:**

**EARNINGS:**
• Basic Salary
• House Rent Allowance (HRA)
• Medical Allowance
• Transport Allowance
• Bonuses (if applicable)
• Overtime (if applicable)

**DEDUCTIONS:**
• Tax (TDS)
• Insurance
• Loan/Advance (if any)
• Other deductions

**Net Salary = Gross - Deductions**`;
        }

        // POLICY RELATED
        if (lowerMsg.includes('hour') || (lowerMsg.includes('work') && lowerMsg.includes('time'))) {
            return `🕐 **Work Hours:**

**Office Timings:**
• Monday - Friday: 9:00 AM - 6:00 PM
• Saturday - Sunday: Weekend Off
• Lunch Break: 1:00 PM - 2:00 PM
• Grace Time: 15 minutes

⚠️ Late arrivals beyond grace time marked as late`;
        }

        if (lowerMsg.includes('work from home') || lowerMsg.includes('wfh') || lowerMsg.includes('remote')) {
            return `🏠 **Work From Home Policy:**

**WFH Guidelines:**
✅ Requires manager approval
✅ Submit request 2 days in advance
✅ Maximum 3 WFH days/month
✅ Must be available during work hours
✅ Submit daily work report

Contact your manager for approval`;
        }

        if (lowerMsg.includes('attendance')) {
            return `📊 **Attendance Policy:**

**Requirements:**
• Biometric/Online attendance mandatory
• Mark within 15 mins of shift start
• Minimum 8 hours work day
• Late marking affects attendance bonus

For regularization, contact HR`;
        }

        // COMPLIANCE RELATED
        if (lowerMsg.includes('compliance') && (lowerMsg.includes('pending') || lowerMsg.includes('view'))) {
            return `✅ **View Pending Compliance:**

1. Go to Dashboard
2. Click "Compliance" tab
3. View "Pending Compliance" section
4. Check due dates (red if overdue)
5. Click "Mark Complete" when done
6. Upload proof if required

⚠️ Complete before due date!`;
        }

        if (lowerMsg.includes('compliance') && lowerMsg.includes('complete')) {
            return `✅ **Complete Compliance Task:**

1. Read task description
2. Complete required training/action
3. Upload proof (certificate/document)
4. Click "Mark Complete" button
5. Wait for HR verification

📧 You'll receive email confirmation`;
        }

        // PROFILE RELATED
        if (lowerMsg.includes('password') && (lowerMsg.includes('change') || lowerMsg.includes('update'))) {
            return `🔐 **Change Password:**

1. Go to Profile Settings
2. Click "Change Password"
3. Enter current password
4. Enter new password (min 6 characters)
5. Confirm new password
6. Click "Update Password"

💡 Use strong password with letters, numbers & symbols`;
        }

        if (lowerMsg.includes('password') && lowerMsg.includes('forgot')) {
            return `🔑 **Forgot Password:**

1. Go to login page
2. Click "Forgot Password?"
3. Enter your registered email
4. Check email for reset link
5. Click link and set new password
6. Link expires in 1 hour

📧 Didn't receive email? Contact IT support`;
        }

        if (lowerMsg.includes('profile') && (lowerMsg.includes('update') || lowerMsg.includes('edit'))) {
            return `👤 **Update Profile:**

1. Go to Dashboard → "Profile" tab
2. Click "Edit Profile"
3. Update information:
   - Personal details
   - Contact information
   - Emergency contact
   - Bank details
4. Click "Save Changes"

✅ Changes saved immediately`;
        }

        // GENERAL GREETINGS
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            return `👋 Hello! I'm your HR Assistant.

I can help you with:
📅 Leave management
💰 Payslip queries
📋 Company policies
✅ Compliance tasks
👤 Profile updates

How can I assist you today?`;
        }

        if (lowerMsg.includes('thank')) {
            return `😊 You're welcome!

Is there anything else I can help you with? Feel free to ask anytime!`;
        }

        if (lowerMsg.includes('who are you') || lowerMsg.includes('what are you')) {
            return `🤖 **About Me:**

I'm an AI-powered HR Assistant integrated with your Personnel Management System.

**My Capabilities:**
✅ Answer HR-related questions
✅ Guide you through processes
✅ Provide policy information
✅ Help with system navigation
✅ Available 24/7

How can I help you?`;
        }

        if (lowerMsg.includes('contact hr') || lowerMsg.includes('contact')) {
            return `📞 **Contact HR:**

**HR Department:**
📧 Email: hr@company.com
📞 Phone: +1 (555) 123-4567
🏢 Office: HR Department, 2nd Floor
⏰ Hours: Mon-Fri, 9 AM - 6 PM

For urgent matters, call the HR hotline.`;
        }

        // DEFAULT RESPONSE
        return `🤔 I'm here to help!

**I can answer questions about:**

📅 **Leave & Time Off**
   - How to apply
   - Leave balance
   - Leave types

💰 **Payslips & Salary**
   - When you'll get paid
   - Download payslip
   - Salary components

📋 **Company Policies**
   - Work hours
   - WFH policy
   - Attendance

✅ **Compliance & Training**
   - Pending tasks
   - How to complete

👤 **Profile & Settings**
   - Update details
   - Change password

**Try asking:**
• "How do I apply for leave?"
• "When will I get my payslip?"
• "What are the work hours?"`;
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const { data } = await axios.get('/api/chat/history');
            if (data.success) {
                const formatted = data.data.flatMap(msg => [
                    {
                        id: `${msg._id}-user`,
                        text: msg.message,
                        sender: 'user',
                        timestamp: msg.createdAt
                    },
                    {
                        id: `${msg._id}-bot`,
                        text: msg.response,
                        sender: 'bot',
                        timestamp: msg.createdAt,
                        messageId: msg._id,
                        feedback: msg.feedback
                    }
                ]);
                setMessages(formatted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            }
        } catch (err) {
            console.error('Failed to load chat history');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Try backend API first
            const { data } = await axios.post('/api/chat', { message: input });
            
            if (data.success && data.data.botResponse) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: data.data.botResponse,
                    sender: 'bot',
                    timestamp: new Date().toISOString(),
                    messageId: data.data.messageId
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                // Fallback to local responses
                const localResponse = getBotResponse(input);
                const botMessage = {
                    id: Date.now() + 1,
                    text: localResponse,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (err) {
            // Use local knowledge base if API fails
            const localResponse = getBotResponse(input);
            const botMessage = {
                id: Date.now() + 1,
                text: localResponse,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async (messageId, feedback) => {
        try {
            await axios.put(`/api/chat/${messageId}/feedback`, { feedback });
            setMessages(prev => prev.map(msg =>
                msg.messageId === messageId ? { ...msg, feedback } : msg
            ));
        } catch (err) {
            console.error('Failed to submit feedback');
        }
    };

    const quickQuestions = [
        "How do I apply for leave?",
        "When will I get my payslip?",
        "What are the work hours?",
        "How to complete compliance?",
        "How to change password?"
    ];

    return (
        <>
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                💬
                {!isOpen && messages.filter(m => m.sender === 'user').length === 0 && (
                    <span className="chatbot-badge">New</span>
                )}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <span className="chatbot-title-icon">🤖</span>
                            <div>
                                <div className="chatbot-title-text">HR Assistant</div>
                                <div className="chatbot-subtitle">Ask me anything!</div>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="chatbot-welcome">
                                <div className="chatbot-welcome-icon">👋</div>
                                <h3 className="chatbot-welcome-title">Hello! I'm your HR Assistant</h3>
                                <p className="chatbot-welcome-text">
                                    I can help you with leave, payslips, policies, compliance, and more!
                                </p>
                                <div className="chatbot-quick-questions">
                                    <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '10px', fontWeight: '500'}}>Quick questions:</p>
                                    {quickQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            className="chatbot-quick-btn"
                                            onClick={() => setInput(q)}
                                            style={{
                                                padding: '10px 15px',
                                                marginBottom: '8px',
                                                background: 'white',
                                                border: '1px solid #4f46e5',
                                                color: '#4f46e5',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                textAlign: 'left',
                                                transition: 'all 0.3s',
                                                width: '100%'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.background = '#4f46e5';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.background = 'white';
                                                e.target.style.color = '#4f46e5';
                                            }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
                                    <div className="chatbot-message-content" style={{whiteSpace: 'pre-line'}}>
                                        {msg.text}
                                    </div>
                                    <div className="chatbot-message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    {msg.sender === 'bot' && msg.messageId && !msg.feedback && (
                                        <div className="chatbot-feedback">
                                            <button
                                                className="chatbot-feedback-btn"
                                                onClick={() => submitFeedback(msg.messageId, 'helpful')}
                                                title="Helpful"
                                            >
                                                👍
                                            </button>
                                            <button
                                                className="chatbot-feedback-btn"
                                                onClick={() => submitFeedback(msg.messageId, 'not_helpful')}
                                                title="Not helpful"
                                            >
                                                👎
                                            </button>
                                        </div>
                                    )}
                                    {msg.feedback && (
                                        <div className="chatbot-feedback-submitted">
                                            {msg.feedback === 'helpful' ? '👍 Thank you!' : '👎 Feedback received'}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-typing">
                                    <div className="chatbot-typing-dot"></div>
                                    <div className="chatbot-typing-dot"></div>
                                    <div className="chatbot-typing-dot"></div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-container">
                        <form className="chatbot-input-form" onSubmit={sendMessage}>
                            <input
                                type="text"
                                className="chatbot-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="chatbot-send-btn"
                                disabled={loading || !input.trim()}
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;