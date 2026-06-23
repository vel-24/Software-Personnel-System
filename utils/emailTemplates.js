// Welcome Email Template (When Admin Creates Account)
export const welcomeEmailTemplate = (user, password) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0; }
        .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👥 Welcome to Personnel System</h1>
            <p>Your account has been created</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.name},</h2>
            
            <p>Your account has been successfully created in the Personnel Management System.</p>
            
            <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 5px 10px; border-radius: 3px;">${password}</code></p>
                <p><strong>Role:</strong> ${user.role.toUpperCase()}</p>
                <p><strong>Department:</strong> ${user.department}</p>
            </div>
            
            <div class="warning">
                ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
            </div>
            
            <p style="text-align: center;">
                <a href="http://localhost:3000/login" class="button">Login to Your Account</a>
            </p>
            
            <p>If you have any questions, please contact your administrator.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Personnel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Account Approval Email Template
export const approvalEmailTemplate = (user) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .success-box { background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Account Approved!</h1>
            <p>Your account is now active</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.name},</h2>
            
            <div class="success-box">
                <h3>🎉 Great News!</h3>
                <p>Your account has been <strong>approved and activated</strong> by the administrator.</p>
            </div>
            
            <p>You can now access all features of the Personnel Management System based on your role.</p>
            
            <p><strong>Account Details:</strong></p>
            <ul>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Role:</strong> ${user.role.toUpperCase()}</li>
                <li><strong>Department:</strong> ${user.department}</li>
                <li><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">ACTIVE</span></li>
            </ul>
            
            <p style="text-align: center;">
                <a href="http://localhost:3000/login" class="button">Access Your Dashboard</a>
            </p>
            
            <p>If you have any questions, please contact HR or your administrator.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Personnel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Account Rejection Email Template
export const rejectionEmailTemplate = (user, reason) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .warning-box { background: #fee2e2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Account Status Update</h1>
            <p>Regarding your personnel account</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.name},</h2>
            
            <div class="warning-box">
                <h3>⚠️ Account Status</h3>
                <p>Unfortunately, your account registration has been <strong>rejected</strong> by the administrator.</p>
            </div>
            
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            
            <p>If you believe this is an error or have questions, please contact HR or your administrator.</p>
            
            <p><strong>Account Details:</strong></p>
            <ul>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Requested Role:</strong> ${user.role.toUpperCase()}</li>
                <li><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">REJECTED</span></li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Personnel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Password Reset Email Template
export const passwordResetTemplate = (user, resetToken) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background: #dbeafe; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Reset your personnel system password</p>
        </div>
        
        <div class="content">
            <h2>Hello ${user.name},</h2>
            
            <div class="info-box">
                <p>You have requested to reset your password. Click the button below to proceed:</p>
            </div>
            
            <p style="text-align: center;">
                <a href="http://localhost:3000/reset-password/${resetToken}" class="button">Reset Password</a>
            </p>
            
            <p><strong>Or copy this link:</strong></p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px;">http://localhost:3000/reset-password/${resetToken}</p>
            
            <p>This link will expire in 1 hour.</p>
            
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Personnel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;