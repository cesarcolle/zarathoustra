const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD
  }
});


const mailZarathoustra = process.env.ZARATHOUSTRA_MAIL;

//  625601361624-nsqtd4se4k1snuuoedirt421m4gcjp6q.apps.googleusercontent.com
//  JVID0LbX9Xu2wpfYjCJlp_Hb

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  let unknownUser = !(req.user);
  res.render('contact', {
      title: 'Contact',
      unknownUser,
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  let fromName;
  let fromEmail;
  if (!req.user) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
  }
  req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  if (!req.user) {
    fromName = req.body.name;
    fromEmail = req.body.email;
  } else {
    fromName = req.user.profile.name || '';
    fromEmail = req.user.email;
  }

  const mailOptions = {
    to: mailZarathoustra,
    from: `${fromName} <${fromEmail}>`,
    subject: 'Contact Form | Zarathoustra',
    text: req.body.message
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.redirect('/contact');
    }
    req.flash('success', { msg: 'Email has been sent successfully!' });
    res.redirect('/contact');
  });
};
