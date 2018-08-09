/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    res.render('home', {
        title: 'Home',
        userDefined: !req.user
    });
};
