module.exports = function adminAuth(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        req.flash('error_msg', 'Unauthorized access');
        return res.redirect('/login');
    }
    next();
}
