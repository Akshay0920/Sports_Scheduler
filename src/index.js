// --- IMPORTS ---
require('dotenv').config();
const express = require('express');
const path = require('path');
const { exec } = require('child_process'); // For programmatic migrations
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const isAuthenticated = require('./middleware/isAuthenticated');
const isAdminView = require('./middleware/isAdminView');

// --- APP INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 10000; // Use Render's default port

// --- IMPORT API ROUTES ---
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const sportRoutes = require('./routes/sport.routes');
const sessionRoutes = require('./routes/session.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');

// --- MIDDLEWARE SETUP ---
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/sessions');
    }
    next();
};

// --- VIEW ENGINE SETUP ---
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// --- FRONTEND VIEW ROUTES ---
app.get('/', (req, res) => {
    if (req.session.user) { return res.redirect('/sessions'); }
    res.redirect('/login');
});
app.get('/sessions', isAuthenticated, async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sessions`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('sessions', { title: 'Available Sessions', sessions: apiResponse.data });
    } catch (error) {
        console.error("--- ERROR FETCHING SESSIONS FROM API ---", error.message);
        res.render('sessions', { title: 'Available Sessions', sessions: [], error: 'Could not fetch sessions.' });
    }
});
app.get('/login', redirectIfAuthenticated, (req, res) => {
    const successMessage = req.query.status === 'success' ? 'Signup successful! Please login.' : null;
    res.render('login', { title: 'Login', error: null, success: successMessage });
});
app.post('/login', redirectIfAuthenticated, async (req, res) => {
    try {
        const response = await axios.post(`http://localhost:${PORT}/api/auth/signin`, req.body);
        req.session.user = response.data;
        res.redirect('/sessions');
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Login failed.';
        res.render('login', { title: 'Login', error: errorMessage, success: null });
    }
});
app.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('signup', { title: 'Sign Up', error: null });
});
app.post('/signup', redirectIfAuthenticated, async (req, res) => {
    try {
        await axios.post(`http://localhost:${PORT}/api/auth/signup`, req.body);
        res.redirect('/login?status=success');
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Signup failed.';
        res.render('signup', { title: 'Sign Up', error: errorMessage });
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy(() => { res.redirect('/login'); });
});
app.get('/sessions/new', isAuthenticated, async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sports`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('create-session', { title: 'Create Session', sports: apiResponse.data, error: null });
    } catch (error) {
        res.redirect('/sessions');
    }
});
app.post('/sessions/new', isAuthenticated, async (req, res) => {
    try {
        await axios.post(`http://localhost:${PORT}/api/sessions`, req.body, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.redirect('/sessions');
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Could not create session.';
        const sportsResponse = await axios.get(`http://localhost:${PORT}/api/sports`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('create-session', { title: 'Create Session', sports: sportsResponse.data, error: errorMessage });
    }
});
app.get('/sessions/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sessions/${req.params.id}`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('cancel-session', { title: 'Cancel Session', session: apiResponse.data });
    } catch (error) {
        console.error("--- ERROR GETTING SESSION DETAILS FOR CANCELLATION ---", error.message);
        res.redirect('/sessions');
    }
});
app.post('/sessions/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        await axios.post(`http://localhost:${PORT}/api/sessions/${req.params.id}/cancel`, { reason: req.body.reason }, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.redirect('/sessions');
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Could not cancel session.';
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sessions/${req.params.id}`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('cancel-session', { title: 'Cancel Session', session: apiResponse.data, error: errorMessage });
    }
});
app.post('/sessions/:id/join', isAuthenticated, async (req, res) => {
    try {
        await axios.post(`http://localhost:${PORT}/api/sessions/${req.params.id}/join`, {}, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.redirect('/sessions');
    } catch (error) {
        console.error("--- ERROR JOINING SESSION ---", error.message);
        res.redirect('/sessions');
    }
});
app.get('/my-sessions', isAuthenticated, async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sessions/me/joined`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('my-sessions', { title: 'My Sessions', sessions: apiResponse.data });
    } catch (error) {
        console.error("--- ERROR FETCHING JOINED SESSIONS ---", error.message);
        res.render('my-sessions', { title: 'My Sessions', sessions: [], error: 'Could not fetch your sessions.' });
    }
});
app.get('/my-created-sessions', isAuthenticated, async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/sessions/me/created`, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('my-created-sessions', { title: 'My Created Sessions', sessions: apiResponse.data });
    } catch (error) {
        res.render('my-created-sessions', { title: 'My Created Sessions', sessions: [], error: 'Could not fetch your created sessions.' });
    }
});
app.get('/admin/create-sport', isAuthenticated, isAdminView, (req, res) => {
    res.render('create-sport', { title: 'Create Sport' });
});
app.post('/admin/create-sport', isAuthenticated, isAdminView, async (req, res) => {
    try {
        await axios.post(`http://localhost:${PORT}/api/sports`, { name: req.body.name }, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('create-sport', { title: 'Create Sport', success: `Sport "${req.body.name}" created successfully!` });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Could not create sport.';
        res.render('create-sport', { title: 'Create Sport', error: errorMessage });
    }
});
app.get('/admin/reports', isAuthenticated, isAdminView, async (req, res) => {
    let reportData = null;
    if (req.query.startDate && req.query.endDate) {
        try {
            const apiResponse = await axios.get(`http://localhost:${PORT}/api/reports`, {
                params: { startDate: req.query.startDate, endDate: req.query.endDate },
                headers: { 'x-access-token': req.session.user.accessToken }
            });
            reportData = apiResponse.data;
        } catch (error) {
            console.error("--- ERROR FETCHING REPORT ---", error.message);
        }
    }
    res.render('admin-reports', { title: 'Admin Reports', report: reportData });
});
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { title: 'My Profile' });
});
app.post('/profile/update', isAuthenticated, async (req, res) => {
    try {
        await axios.patch(`http://localhost:${PORT}/api/users/me`, { name: req.body.name }, { headers: { 'x-access-token': req.session.user.accessToken } });
        req.session.user.name = req.body.name;
        res.render('profile', { title: 'My Profile', details_success: 'Profile updated successfully!' });
    } catch (error) {
        res.render('profile', { title: 'My Profile', details_error: 'Could not update profile.' });
    }
});
app.post('/profile/change-password', isAuthenticated, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (oldPassword === newPassword) {
        return res.render('profile', { title: 'My Profile', password_error: 'New password cannot be the same as the old password.' });
    }
    if (newPassword !== confirmPassword) {
        return res.render('profile', { title: 'My Profile', password_error: 'New passwords do not match.' });
    }
    try {
        await axios.patch(`http://localhost:${PORT}/api/users/me/password`, { oldPassword, newPassword }, { headers: { 'x-access-token': req.session.user.accessToken } });
        res.render('profile', { title: 'My Profile', password_success: 'Password updated successfully!' });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Could not change password.';
        res.render('profile', { title: 'My Profile', password_error: errorMessage });
    }
});

// --- SERVER LISTENER & MIGRATION SCRIPT ---
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

if (process.env.NODE_ENV === 'production') {
    console.log('Running migrations...');
    exec('node ./node_modules/sequelize-cli/lib/sequelize db:migrate --env production', (error, stdout, stderr) => {

        if (error) {
            console.error(`Migration Error: ${error.message}`);
            process.exit(1);
        }
        if (stderr) {
            console.error(`Migration Stderr: ${stderr}`);
        }
        console.log(`Migration Stdout: ${stdout}`);
        console.log('Migrations finished. Starting server...');
        startServer();
    });
} else {
    startServer();
}